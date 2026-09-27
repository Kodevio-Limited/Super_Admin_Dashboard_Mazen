'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Copy, ArrowRight, ArrowLeft, Upload, BadgeCheck, Plus } from 'lucide-react';
import PlanTierPicker from '../PlanTierPicker';
import {
  FIGMA_TIERS,
  FigmaTier,
  FigmaBillingCycle,
  cycleTotal,
} from '../../data/figmaPlans';

interface CreateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRestaurant: any) => void;
  onViewRestaurant?: (id: string) => void;
}

// Flow mirrors the Figma frames in order:
// S1 info (app fields — no frame) → S2 Locations & Branches (1259:651) →
// S3 plan picker (1859:336) → S4 credentials (1862:546) → S5 done (1309:1206).
type Step = 'info' | 'branches' | 'plan' | 'credentials' | 'done';

interface DraftBranch {
  name: string;
  cityCountry: string;
  address: string;
}

const EMPTY_BRANCH: DraftBranch = { name: '', cityCountry: '', address: '' };

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ['info', 'branches', 'plan', 'credentials', 'done'];
  const idx = order.indexOf(step);
  // Indicator has 3 dots: info→1, branches→2, plan/credentials/done→3.
  const activeDot = step === 'info' ? 1 : step === 'branches' ? 2 : 3;
  return (
    <div className="flex items-center mt-5 px-1" aria-hidden="true">
      {[1, 2, 3].map((n, i) => {
        const filled = n < activeDot || idx >= 3;
        const current = n === activeDot && idx < 4;
        return (
          <React.Fragment key={n}>
            <span
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                filled || current ? 'bg-[#026F4F] text-white' : 'bg-[#E9E9E9] text-[#989898]'
              }`}
            >
              {filled && !(n === activeDot) ? <Check size={18} /> : n}
            </span>
            {i < 2 && (
              <span
                className={`flex-1 mx-2 sm:mx-4 border-t-2 border-dashed ${
                  n < activeDot ? 'border-[#026F4F]/40' : 'border-[#E9E9E9]'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const pillInput =
  'w-full h-14 px-6 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all';

export default function CreateRestaurantModal({
  isOpen,
  onClose,
  onSuccess,
  onViewRestaurant,
}: CreateRestaurantModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [copied, setCopied] = useState(false);
  const [createdId, setCreatedId] = useState('');

  // S1 — restaurant & owner
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Japanese & Ramen');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [address, setAddress] = useState('');

  // S2 — branches (Figma 1259:651; "+ Add Branch" appends another block)
  const [draftBranches, setDraftBranches] = useState<DraftBranch[]>([{ ...EMPTY_BRANCH }]);

  // S3 — plan (Figma 1859:336)
  const [selectedTier, setSelectedTier] = useState<FigmaTier>('Pro');
  const [billingCycle, setBillingCycle] = useState<FigmaBillingCycle>('Yearly');

  // S4 — credentials
  const [credentials, setCredentials] = useState({ username: '', temporaryPassword: '' });

  if (!isOpen) return null;

  const updateDraft = (i: number, patch: Partial<DraftBranch>) =>
    setDraftBranches((prev) => prev.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('branches');
  };

  const handleBranchesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('plan');
  };

  const handlePlanDone = () => {
    const tempPass = 'Echo#' + Math.floor(100000 + Math.random() * 900000);
    setCredentials({ username: ownerEmail, temporaryPassword: tempPass });

    const chosenTier = FIGMA_TIERS.find((p) => p.tier === selectedTier)!;
    const id = `rest-${Date.now()}`;
    const branches = draftBranches.map((b, i) => ({
      id: `br-${Date.now()}-${i}`,
      name: b.name || (i === 0 ? `${name} Main Branch` : `${name} Branch ${i + 1}`),
      address: [b.address, b.cityCountry].filter(Boolean).join(', ') || address,
      phone: ownerPhone,
      managerName: ownerName,
      managerEmail: ownerEmail,
      staffCount: 1,
      ordersToday: 0,
      revenueToday: 0,
      status: 'Active' as const,
      planName: `${chosenTier.tier} Plan`,
      planExpiry: 'Sep 30, 2027',
      monthlyFee: 0,
    }));

    setCreatedId(id);
    onSuccess({
      id,
      name,
      logo: '/images/food-41e5d7.png',
      category,
      ownerName,
      ownerEmail,
      ownerPhone,
      address,
      status: 'Active' as const,
      joinedDate: 'Just now',
      planName: `${chosenTier.tier} Plan`,
      planType: 'Restaurant',
      planBilling: billingCycle,
      planPrice: cycleTotal(chosenTier.monthlyPrice, billingCycle),
      planExpiry: 'Sep 30, 2027',
      totalBranches: branches.length,
      totalOrders: 0,
      totalRevenue: 0,
      branches,
    });
    setStep('credentials');
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText(
      `Login URL: http://localhost:3000/login\nEmail: ${credentials.username}\nPassword: ${credentials.temporaryPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToRestaurant = () => {
    onClose();
    if (createdId) {
      if (onViewRestaurant) onViewRestaurant(createdId);
      else router.push(`/restaurants/${createdId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={step === 'done' || step === 'credentials' ? undefined : onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {step !== 'done' && (
          <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#2D2F33] text-xl sm:text-2xl">
                {step === 'credentials' ? 'Restaurant Created Successfully!' : 'Create New Restaurant'}
              </h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <StepIndicator step={step} />
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* S1 — restaurant & owner info (app fields; Figma starts at S2) */}
          {step === 'info' && (
            <form onSubmit={handleInfoSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">Restaurant Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kyoto Ramen Bar" className={pillInput} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">Category / Cuisine *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={pillInput}>
                    <option>Japanese & Ramen</option>
                    <option>Italian & Pizzeria</option>
                    <option>American Burger & Grill</option>
                    <option>Mexican & Tacos</option>
                    <option>French Bistro & Cafe</option>
                    <option>Seafood & Fine Dining</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">Owner Full Name *</label>
                  <input type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="e.g. Alexander Wright" className={pillInput} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">Owner Email *</label>
                  <input type="email" required value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="alexander@domain.com" className={pillInput} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">Phone Number *</label>
                  <input type="tel" required value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={pillInput} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">Headquarters / Primary Address *</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="742 Evergreen Terrace, Springfield, OR" className={pillInput} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">Restaurant Logo / Brand Asset</label>
                <div className="border-2 border-dashed border-gray-200 hover:border-[#026F4F] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#F8F9FA]">
                  <Upload size={24} className="mx-auto text-[#989898] mb-1" />
                  <p className="text-xs text-[#2D2F33] font-medium">Click to upload PNG or JPG logo</p>
                  <p className="text-[11px] text-[#989898]">Recommended 400x400px (Max 5MB)</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold text-[#686868] hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-3 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer">
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* S2 — Locations & Branches (Figma 1259:651) */}
          {step === 'branches' && (
            <form onSubmit={handleBranchesSubmit} className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-semibold text-[#2D2F33]">Locations & Branches</h4>
                  <p className="text-[#989898] mt-1">Set up a restaurant in a few steps</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftBranches((prev) => [...prev, { ...EMPTY_BRANCH }])}
                  className="flex items-center gap-1.5 bg-[#026F4F]/10 hover:bg-[#026F4F]/15 text-[#026F4F] text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
                >
                  <Plus size={16} />
                  <span>Add Branch</span>
                </button>
              </div>

              {draftBranches.map((b, i) => (
                <div key={i} className="space-y-5">
                  {i > 0 && (
                    <p className="text-sm font-semibold text-[#2D2F33] pt-2 border-t border-gray-100">
                      Branch {i + 1}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">Branch Name</label>
                    <input type="text" value={b.name} onChange={(e) => updateDraft(i, { name: e.target.value })} placeholder="Main Branch" className={pillInput} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">City / Country</label>
                      <input type="text" value={b.cityCountry} onChange={(e) => updateDraft(i, { cityCountry: e.target.value })} placeholder="e.g. New York, USA" className={pillInput} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">Full Address</label>
                      <input type="text" value={b.address} onChange={(e) => updateDraft(i, { address: e.target.value })} placeholder="Street ZIP" className={pillInput} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={() => setStep('info')} className="px-6 py-3 rounded-full text-sm font-semibold text-[#686868] hover:bg-gray-100 flex items-center gap-2 transition-colors">
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="submit" className="px-10 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md flex items-center gap-2 transition-all cursor-pointer">
                  <span>Next Step</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* S3 — plan picker (Figma 1859:336) */}
          {step === 'plan' && (
            <div className="space-y-6">
              <PlanTierPicker
                selectedTier={selectedTier}
                billingCycle={billingCycle}
                onSelectTier={setSelectedTier}
                onSelectCycle={setBillingCycle}
              />
              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={() => setStep('branches')} className="px-6 py-3 rounded-full text-sm font-semibold text-[#686868] hover:bg-gray-100 flex items-center gap-2 transition-colors">
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button onClick={handlePlanDone} className="px-10 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all cursor-pointer">
                  Done
                </button>
              </div>
            </div>
          )}

          {/* S4 — credentials (Figma 1862:546) */}
          {step === 'credentials' && (
            <div className="space-y-6">
              <p className="text-center text-[#989898] max-w-xl mx-auto">
                We&apos;ve automatically generated login credentials for the restaurant owner. Please copy them securely.
              </p>
              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">Email</label>
                <input type="text" readOnly value={credentials.username} placeholder="e.g. example@gmail.com" className={pillInput} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">Temporary Password</label>
                <input type="text" readOnly value={credentials.temporaryPassword} placeholder="aKOhfyf8qw9r9-" className={pillInput} />
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button onClick={handleCopyCredentials} className="px-6 py-3 rounded-full border border-gray-200 hover:border-[#026F4F] hover:text-[#026F4F] text-sm font-semibold text-[#2D2F33] flex items-center gap-2 transition-all">
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
                </button>
                <button onClick={() => setStep('done')} className="px-10 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all cursor-pointer">
                  Done
                </button>
              </div>
            </div>
          )}

          {/* S5 — final confirmation (Figma 1309:1206) */}
          {step === 'done' && (
            <div className="text-center py-6 space-y-5">
              <span className="mx-auto w-28 h-28 rounded-full bg-[#026F4F] text-white flex items-center justify-center shadow-lg">
                <BadgeCheck size={56} />
              </span>
              <h3 className="text-2xl font-semibold text-[#2D2F33]">Restaurant Created!</h3>
              <p className="text-[#989898] max-w-md mx-auto">
                {name} has been successfully set up and added to your platform.
              </p>
              <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
                <button onClick={onClose} className="px-10 py-3.5 rounded-full bg-[#F2F2F2] hover:bg-gray-200 text-[#2D2F33] font-medium transition-all min-w-[180px]">
                  Close
                </button>
                <button onClick={goToRestaurant} className="px-10 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all min-w-[180px]">
                  View Restaurant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
