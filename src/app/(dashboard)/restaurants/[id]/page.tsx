'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Topbar from '../../../../components/Topbar';
import {
  ArrowLeft,
  TrendingUp,
  Trash2,
  MapPin,
  Store,
  Clock,
  Plus,
  Check,
} from 'lucide-react';
import { mockPlans } from '../../../../data/mockData';
import { getRestaurants, updateRestaurant, deleteRestaurant } from '../../../../data/restaurantStore';
import { Restaurant, Branch } from '../../../../types/admin';
import { FigmaTier, FigmaBillingCycle, FIGMA_TIERS, tierBlurb } from '../../../../data/figmaPlans';
import ModifyPlanModal from '../../../../components/modals/ModifyPlanModal';
import ManualPlanActivationModal from '../../../../components/modals/ManualPlanActivationModal';
import ManualActivationModal from '../../../../components/modals/ManualActivationModal';

// Source of truth: Figma frames 1862:762 (Overview), 1465:821 (Branches),
// 1508:1274 (Add branch), 1511:1544 (Main branch), 1512:1785 (Subscription),
// 1692:72598 (Modify plan), 1864:870 (Manual activation), 1514:1940 (Activity).
// Detail content is a centered narrow column (frames are 632px wide).

type Tab = 'Overview' | 'Branches' | 'Subscription' | 'Activity';
type BranchPanel = { mode: 'add' } | { mode: 'edit'; branchId: string } | null;

interface Note {
  id: string;
  by: string;
  text: string;
  date: string;
}

const pillInput =
  'w-full h-14 px-6 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all';

function idCode(id: string): string {
  const digits = id.replace(/\D/g, '').slice(-4);
  return digits.padStart(4, '0');
}

function addYear(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function MapPlaceholder() {
  // Stylised stand-in for the Figma map tile (no asset access to the file).
  return (
    <div className="relative h-44 rounded-2xl overflow-hidden bg-[#E7EDE8]">
      <svg viewBox="0 0 400 176" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="176" fill="#E7EDE8" />
        <path d="M-10,140 C60,120 90,90 130,95 C170,100 180,60 230,55 C280,50 300,20 340,25 L410,10 L410,190 L-10,190 Z" fill="#D9EADF" />
        <path d="M250,-10 C240,40 260,70 235,110 C215,140 225,160 220,190" stroke="#BFD9EC" strokeWidth="16" fill="none" />
        <g stroke="#FFFFFF" strokeWidth="5">
          <line x1="0" y1="60" x2="400" y2="45" />
          <line x1="0" y1="120" x2="400" y2="130" />
          <line x1="80" y1="0" x2="70" y2="176" />
          <line x1="180" y1="0" x2="190" y2="176" />
          <line x1="300" y1="0" x2="290" y2="176" />
        </g>
        <g stroke="#C9D4CB" strokeWidth="2">
          <line x1="0" y1="90" x2="400" y2="85" />
          <line x1="130" y1="0" x2="125" y2="176" />
          <line x1="240" y1="0" x2="245" y2="176" />
        </g>
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#026F4F] flex items-center justify-center shadow-lg">
        <MapPin size={20} className="text-white" />
      </span>
    </div>
  );
}

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [restaurants, setRestaurants] = useState<Restaurant[]>(getRestaurants());
  const restaurant = restaurants.find((r) => r.id === id) || restaurants[0];

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [branchPanel, setBranchPanel] = useState<BranchPanel>(null);

  // Overview form state (Figma shows fields + Cancel/Delete, no Save)
  const [ownerName, setOwnerName] = useState(restaurant.ownerName);
  const [ownerEmail, setOwnerEmail] = useState(restaurant.ownerEmail);
  const [ownerPhone, setOwnerPhone] = useState(restaurant.ownerPhone);
  const [secondPhone, setSecondPhone] = useState(restaurant.ownerPhone);
  const [primaryLocation, setPrimaryLocation] = useState(restaurant.address);
  const [loginEmail, setLoginEmail] = useState(restaurant.ownerEmail);
  const [tempPassword, setTempPassword] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [isActive, setIsActive] = useState(restaurant.status === 'Active');

  // Subscription tab state
  const [renewalNote, setRenewalNote] = useState('');
  const [cancelArmed, setCancelArmed] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);

  // Branch form state
  const editingBranch =
    branchPanel?.mode === 'edit'
      ? restaurant.branches.find((b) => b.id === branchPanel.branchId)
      : undefined;
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchCountry, setBranchCountry] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchEmail, setBranchEmail] = useState('');
  const [branchDeleteArmed, setBranchDeleteArmed] = useState(false);

  const openAddBranch = () => {
    setBranchName('');
    setBranchAddress('');
    setBranchCity('');
    setBranchCountry('');
    setBranchPhone('');
    setBranchEmail('');
    setBranchDeleteArmed(false);
    setBranchPanel({ mode: 'add' });
  };

  const openEditBranch = (branch: Branch) => {
    setBranchName(branch.name);
    setBranchAddress(branch.address);
    setBranchCity(branch.city || '');
    setBranchCountry(branch.country || '');
    setBranchPhone(branch.phone);
    setBranchEmail(branch.managerEmail);
    setBranchDeleteArmed(false);
    setBranchPanel({ mode: 'edit', branchId: branch.id });
  };

  const patchRestaurant = (patch: Partial<Restaurant>) => {
    updateRestaurant(restaurant.id, patch);
    setRestaurants(getRestaurants());
  };

  const saveBranch = () => {
    if (branchPanel?.mode === 'add') {
      const nb: Branch = {
        id: `br-${Date.now()}`,
        name: branchName || `${restaurant.name} Branch ${restaurant.branches.length + 1}`,
        address: branchAddress || 'Downtown Avenue, New York',
        city: branchCity || undefined,
        country: branchCountry || undefined,
        phone: branchPhone || restaurant.ownerPhone,
        managerName: restaurant.ownerName,
        managerEmail: branchEmail || restaurant.ownerEmail,
        staffCount: 1,
        ordersToday: 0,
        revenueToday: 0,
        status: 'Active',
        planName: restaurant.planName,
        planExpiry: restaurant.planExpiry,
        monthlyFee: 0,
      };
      patchRestaurant({ branches: [...restaurant.branches, nb] });
    } else if (branchPanel?.mode === 'edit') {
      patchRestaurant({
        branches: restaurant.branches.map((b) =>
          b.id === branchPanel.branchId
            ? {
                ...b,
                name: branchName || b.name,
                address: branchAddress || b.address,
                city: branchCity || undefined,
                country: branchCountry || undefined,
                phone: branchPhone || b.phone,
                managerEmail: branchEmail || b.managerEmail,
              }
            : b
        ),
      });
    }
    setBranchPanel(null);
  };

  const deleteBranch = () => {
    if (branchPanel?.mode === 'edit') {
      patchRestaurant({
        branches: restaurant.branches.filter((b) => b.id !== branchPanel.branchId),
      });
    }
    setBranchPanel(null);
  };

  const addNote = () => {
    const text = noteDraft.trim();
    if (!text) return;
    setNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        by: '(Admin)',
        text,
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      },
    ]);
    setNoteDraft('');
  };

  const resetOverview = () => {
    setOwnerName(restaurant.ownerName);
    setOwnerEmail(restaurant.ownerEmail);
    setOwnerPhone(restaurant.ownerPhone);
    setSecondPhone(restaurant.ownerPhone);
    setPrimaryLocation(restaurant.address);
    setLoginEmail(restaurant.ownerEmail);
    setTempPassword('');
    setDeleteArmed(false);
  };

  const activity = restaurant.branches.flatMap((b) =>
    (b.activities || []).map((a) => ({ ...a, branch: b.name }))
  );

  const tabs: Tab[] = ['Overview', 'Branches', 'Subscription', 'Activity'];

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title={`${restaurant.name} • Details`} subtitle="Restaurant details" />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 w-full">
        <div className="max-w-[680px] mx-auto space-y-5">
          {/* Header: back / title+ID / status toggle (Figma 1862:762) */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {branchPanel ? (
              <button
                onClick={() => {
                  setBranchPanel(null);
                  setActiveTab('Branches');
                }}
                aria-label="Back to branches"
                className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Link
                href="/restaurants"
                aria-label="Back to restaurants"
                className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
            )}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D2F33]">
                {branchPanel?.mode === 'add'
                  ? 'Add New Branch'
                  : branchPanel?.mode === 'edit'
                    ? editingBranch?.name || 'Main Branch'
                    : restaurant.name}
              </h2>
              {!branchPanel && (
                <p className="text-[#686868] mt-1">ID: {idCode(restaurant.id)}</p>
              )}
            </div>
            {!branchPanel ? (
              <button
                role="switch"
                aria-checked={isActive}
                aria-label="Restaurant active status"
                onClick={() => {
                  const next = !isActive;
                  setIsActive(next);
                  patchRestaurant({ status: next ? 'Active' : 'Suspended' });
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  isActive ? 'bg-[#22C55E]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            ) : (
              <span className="w-14" />
            )}
          </div>

          {!branchPanel && (
            <>
              {/* Tabs (Figma: Overview / Branches / Subscription / Activity) */}
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-full text-[15px] font-medium whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? 'bg-[#026F4F] text-white shadow-md'
                        : 'bg-white text-[#686868] hover:text-[#2D2F33]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* OVERVIEW (Figma 1862:762) */}
              {activeTab === 'Overview' && (
                <div className="space-y-5">
                  <p className="text-sm text-[#686868]">Quick Stats</p>
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-5">
                      <p className="text-[#686868]">Total Orders (30d)</p>
                      <p className="text-3xl font-semibold text-[#2D2F33] mt-2">
                        {restaurant.totalOrders.toLocaleString()}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#158F15] text-sm mt-2">
                        <TrendingUp size={16} />
                        <span>12.5% vs Last Month</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-5">
                      <p className="text-[#686868]">Revenue (30d)</p>
                      <p className="text-3xl font-semibold text-[#2D2F33] mt-2">
                        ${restaurant.totalRevenue.toLocaleString()}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#158F15] text-sm mt-2">
                        <TrendingUp size={16} />
                        <span>12.5% vs Last Month</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 space-y-4">
                    {[
                      { label: 'Owner Name', value: ownerName, set: setOwnerName, type: 'text' },
                      { label: 'Email Address', value: ownerEmail, set: setOwnerEmail, type: 'email' },
                      { label: 'Phone Number', value: ownerPhone, set: setOwnerPhone, type: 'tel' },
                      { label: 'Secondary Phone Number', value: secondPhone, set: setSecondPhone, type: 'tel' },
                      { label: 'Primary Location', value: primaryLocation, set: setPrimaryLocation, type: 'text' },
                    ].map((f) => (
                      <div key={f.label} className="space-y-1.5">
                        <label className="block text-sm text-[#2D2F33]">{f.label}</label>
                        <input
                          type={f.type}
                          value={f.value}
                          onChange={(e) => f.set(e.target.value)}
                          className={pillInput}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl p-5 space-y-4">
                    <h3 className="text-lg font-semibold text-[#2D2F33]">Login Credentials</h3>
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">Email</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. example@gmail.com"
                        className={pillInput}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">Temporary Password</label>
                      <input
                        type="text"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        placeholder="aKOhfyf8qw9r9-"
                        className={pillInput}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">Add New Notes</label>
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Enter your notes"
                        rows={3}
                        className="w-full px-6 py-4 bg-[#F2F2F2] rounded-2xl text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 resize-none"
                      />
                      <button
                        onClick={addNote}
                        className="px-6 py-2.5 rounded-full bg-[#026F4F]/10 hover:bg-[#026F4F]/15 text-[#026F4F] text-sm font-semibold transition-colors"
                      >
                        Add Note
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-[#2D2F33]">Previous Notes ({notes.length})</p>
                      {notes.length === 0 ? (
                        <p className="text-sm text-[#989898]">No notes yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {notes.map((note) => (
                            <div key={note.id} className="bg-[#F2F2F2] rounded-2xl p-4 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[#2D2F33]">{note.by}</p>
                                <p className="text-sm text-[#686868] mt-1">{note.text}</p>
                                <p className="text-xs text-[#989898] mt-1">{note.date}</p>
                              </div>
                              <button
                                onClick={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                                aria-label="Delete note"
                                className="text-[#E52B2B] hover:text-red-700 transition-colors flex-shrink-0 mt-1"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={resetOverview}
                      className="py-3.5 rounded-full border border-gray-300 text-[#2D2F33] font-medium hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (deleteArmed) {
                          deleteRestaurant(restaurant.id);
                          router.push('/restaurants');
                        } else setDeleteArmed(true);
                      }}
                      className="py-3.5 rounded-full bg-[#E52B2B] hover:bg-red-700 text-white font-medium transition-all"
                    >
                      {deleteArmed ? 'Confirm Delete?' : 'Delete Restaurant'}
                    </button>
                  </div>
                </div>
              )}

              {/* BRANCHES (Figma 1465:821) */}
              {activeTab === 'Branches' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#686868]">
                      Active Locations ({restaurant.branches.length})
                    </p>
                    <button
                      onClick={openAddBranch}
                      className="flex items-center gap-1.5 text-[#026F4F] font-semibold text-[15px] hover:underline"
                    >
                      <Plus size={18} />
                      <span>Add Branch</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {restaurant.branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => openEditBranch(branch)}
                        className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left hover:shadow-md transition-shadow"
                      >
                        <span className="w-14 h-14 rounded-xl bg-[#F2F2F2] flex items-center justify-center text-[#686868] flex-shrink-0">
                          <Store size={26} strokeWidth={1.6} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-[#2D2F33] text-[17px] truncate">
                            {branch.name}
                          </span>
                          <span className="block text-sm text-[#989898] truncate mt-0.5">
                            {branch.address}
                          </span>
                        </span>
                        <span className="text-sm font-medium px-4 py-1.5 rounded-lg bg-[#D9F5D9] text-[#158F15] flex-shrink-0">
                          Paid
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBSCRIPTION (Figma 1512:1785) */}
              {activeTab === 'Subscription' && (
                <div className="space-y-4">
                  <div className="bg-[#222A37] rounded-2xl p-6 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="flex items-center gap-3 text-2xl font-semibold">
                          {restaurant.planName}
                          <span className="text-[11px] font-bold bg-[#22C55E] text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
                            {isActive ? 'Active' : restaurant.status}
                          </span>
                        </p>
                        <p className="text-white/60 text-sm mt-2">{tierBlurb(restaurant.planName)}</p>
                        <p className="text-3xl font-semibold mt-3">
                          ${restaurant.planPrice.toLocaleString()}
                          <span className="text-base font-normal text-white/70">
                            /{restaurant.planBilling === 'Monthly' ? 'Month' : restaurant.planBilling}
                          </span>
                        </p>
                      </div>
                      <div className="border border-white/25 rounded-lg px-4 py-2.5 text-right flex-shrink-0">
                        <p className="text-xs text-white/60">Next Renewal</p>
                        <p className="font-semibold mt-0.5 whitespace-nowrap">{restaurant.planExpiry}</p>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-white/25 my-5" />
                    <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3">
                      <button
                        onClick={() => setIsModifyOpen(true)}
                        className="py-2.5 rounded-lg bg-white text-[#2D2F33] text-sm font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Modify Plan
                      </button>
                      <button
                        onClick={() => {
                          patchRestaurant({ planExpiry: addYear(restaurant.planExpiry) });
                          setRenewalNote('Plan renewed for one more year.');
                          setCancelArmed(false);
                        }}
                        className="py-2.5 rounded-lg border border-white/50 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                      >
                        Renew Plan
                      </button>
                      <button
                        onClick={() => {
                          if (cancelArmed) {
                            setRenewalNote('Auto-renewal cancelled.');
                            setCancelArmed(false);
                          } else setCancelArmed(true);
                        }}
                        className="py-2.5 rounded-lg bg-[#3B4252] text-white text-sm font-semibold hover:bg-[#454d61] transition-colors"
                      >
                        {cancelArmed ? 'Confirm?' : 'Cancel Renewal'}
                      </button>
                    </div>
                    {renewalNote && (
                      <p className="flex items-center gap-1.5 text-sm text-white/70 mt-3">
                        <Check size={15} className="text-[#22C55E]" />
                        {renewalNote}
                      </p>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-5 space-y-3">
                    <h3 className="text-lg font-medium text-[#2D2F33]">Offline Management</h3>
                    <p className="text-sm text-[#989898]">
                      Manage payments outside the app. Log a received payment out side the app.
                    </p>
                    <button
                      onClick={() => setIsLogPaymentOpen(true)}
                      className="w-full py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
                    >
                      Log Payment
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4">
                    <p className="text-[17px] font-medium text-[#2D2F33]">Activate Without Payment</p>
                    <button
                      onClick={() => setIsManualOpen(true)}
                      className="px-5 py-2.5 rounded-lg bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold transition-all flex-shrink-0"
                    >
                      Activate Manually
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVITY (Figma 1514:1940 — the "Activation" frame) */}
              {activeTab === 'Activity' && (
                <div className="space-y-0">
                  {activity.length === 0 ? (
                    <p className="text-sm text-[#989898]">No activity recorded yet.</p>
                  ) : (
                    activity.map((a, i) => (
                      <div key={a.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="w-4 h-4 rounded-full bg-[#026F4F] flex-shrink-0 mt-1" />
                          {i < activity.length - 1 && <span className="w-px flex-1 bg-gray-300" />}
                        </div>
                        <div className="pb-7">
                          <p className="font-semibold text-[#2D2F33] text-[17px]">{a.description}</p>
                          <p className="flex items-center gap-1.5 text-sm text-[#989898] mt-1.5">
                            <Clock size={15} />
                            <span>{a.time}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* BRANCH ADD / EDIT PANEL (Figma 1508:1274 / 1511:1544) */}
          {branchPanel && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-semibold text-[#2D2F33]">Basic Info</h3>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">Branch Name</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. downtown Branch"
                    className={pillInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">Location</label>
                  <MapPlaceholder />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">Full Address</label>
                  <input
                    type="text"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="Street-Zip.."
                    className={pillInput}
                  />
                </div>
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">City</label>
                    <input
                      type="text"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className={pillInput}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">Country</label>
                    <input
                      type="text"
                      value={branchCountry}
                      onChange={(e) => setBranchCountry(e.target.value)}
                      className={pillInput}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-semibold text-[#2D2F33]">Contact & Settings</h3>
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">Phone Number</label>
                    <input
                      type="tel"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      placeholder="+155555484"
                      className={pillInput}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">Email (Optional)</label>
                    <input
                      type="email"
                      value={branchEmail}
                      onChange={(e) => setBranchEmail(e.target.value)}
                      className={pillInput}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBranchPanel(null)}
                  className="py-3.5 rounded-full border border-gray-300 text-[#2D2F33] font-medium hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                {branchPanel.mode === 'add' ? (
                  <button
                    onClick={saveBranch}
                    className="py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
                  >
                    Create Branch
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (branchDeleteArmed) deleteBranch();
                      else setBranchDeleteArmed(true);
                    }}
                    className="py-3.5 rounded-full bg-[#E52B2B] hover:bg-red-700 text-white font-medium transition-all"
                  >
                    {branchDeleteArmed ? 'Confirm Delete?' : 'Delete Branch'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modify Plan (Figma 1692:72598) */}
      <ModifyPlanModal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        onActivate={(tier: FigmaTier, billing: FigmaBillingCycle, price: number) => {
          patchRestaurant({
            planName: `${tier} Plan`,
            planBilling: billing,
            planPrice: price,
          });
          setRenewalNote(`Plan changed to ${tier} (${billing}).`);
          setIsModifyOpen(false);
        }}
      />

      {/* Manual Activation (Figma 1864:870) */}
      <ManualPlanActivationModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onActivate={(tier: FigmaTier, expiryDate: string) => {
          const monthly = FIGMA_TIERS.find((t) => t.tier === tier)!.monthlyPrice;
          patchRestaurant({
            planName: `${tier} Plan`,
            planBilling: 'Monthly',
            planPrice: monthly,
            planExpiry: expiryDate
              ? new Date(expiryDate + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : restaurant.planExpiry,
            status: 'Active',
          });
          setIsActive(true);
          setRenewalNote(`${tier} plan activated manually.`);
          setIsManualOpen(false);
        }}
      />

      {/* Log Payment reuses the existing repo ManualActivationModal pattern */}
      <ManualActivationModal
        isOpen={isLogPaymentOpen}
        restaurant={restaurant}
        plans={mockPlans}
        onClose={() => setIsLogPaymentOpen(false)}
        onConfirm={(_rid, planId, months) => {
          const plan = mockPlans.find((p) => p.id === planId);
          if (plan) {
            patchRestaurant({
              planName: plan.name,
              planBilling: 'Monthly',
              planPrice: plan.priceMonthly * months,
            });
            setRenewalNote(`Offline payment logged (${plan.name}, ${months} mo).`);
          }
          setIsLogPaymentOpen(false);
        }}
      />
    </div>
  );
}
