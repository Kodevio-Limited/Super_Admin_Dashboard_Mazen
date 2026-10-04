'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { locField, toArDate, planNameAr, tierArLabel, billingCycleAr, billingPerLabel } from '../../lib/localize';
import {
  ArrowLeft,
  TrendingUp,
  Trash2,
  MapPin,
  Store,
  Clock,
  Plus,
  Check,
  SquarePen,
} from 'lucide-react';
import { mockPlans } from '../../data/mockData';
import { getRestaurants, updateRestaurant, deleteRestaurant } from '../../data/restaurantStore';
import { Restaurant, Branch } from '../../types/admin';
import { FigmaTier, FigmaBillingCycle, FIGMA_TIERS, tierBlurb, effectiveMonthly } from '../../data/figmaPlans';
import LeftPanel from '../LeftPanel';
import ModifyPlanModal from './ModifyPlanModal';
import ManualPlanActivationModal from './ManualPlanActivationModal';
import ManualActivationModal from './ManualActivationModal';
import ActionNotAllowedModal, { BlockedBranchAction } from './ActionNotAllowedModal';
import { useQueryModal } from '../../lib/use-query-modal';

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

function addMonths(dateStr: string, months: number): string {
  const base = new Date(dateStr);
  const d = isNaN(base.getTime()) ? new Date() : base;
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatExpiryInput(value: string, fallback: string): string {
  if (!value) return fallback;
  const d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return fallback;
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

type BranchTab = 'Overview' | 'Subscription' | 'Activity';

interface BranchDetailsPanelProps {
  restaurant: Restaurant;
  branch: Branch;
  tab: BranchTab;
  onTabChange: (tab: BranchTab) => void;
  onBack: () => void;
  onPatchBranch: (patch: Partial<Branch>) => void;
  onDeleteBranch: () => void;
  onOpenEditForm: () => void;
  onPatchRestaurant: (patch: Partial<Restaurant>) => void;
}

// Branch Details flow — Figma 1867:1032 (Overview), 1867:1191 (Subscription),
// 1867:1244 (Activity). Same narrow-panel language as restaurant details.
function BranchDetailsPanel({
  restaurant,
  branch,
  tab,
  onTabChange,
  onBack,
  onPatchBranch,
  onDeleteBranch,
  onOpenEditForm,
  onPatchRestaurant,
}: BranchDetailsPanelProps) {
  const t = useTranslations('sa.restaurantModal');
  const ts = useTranslations('common.status');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const tierName = (tier: FigmaTier) => (isAr ? tierArLabel(tier) : tier);
  const cycleName = (billing: FigmaBillingCycle) => (isAr ? billingCycleAr(billing) : billing);
  const tabLabel = (tb: BranchTab) =>
    tb === 'Overview' ? t('tabs.overview') : tb === 'Subscription' ? t('tabs.subscription') : t('tabs.activity');
  const [branchName, setBranchName] = useState(branch.name);
  const [email, setEmail] = useState(branch.managerEmail);
  const [phone, setPhone] = useState(branch.phone);
  const [fullAddress, setFullAddress] = useState(branch.address);
  const [loginEmail, setLoginEmail] = useState(branch.managerEmail);
  const [tempPassword, setTempPassword] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [isActive, setIsActive] = useState(branch.status === 'Active');

  // Which branch action is currently blocked by the overarching restaurant
  // plan (null = none). Drives the Action Not Allowed modal + its text.
  const [blockedAction, setBlockedAction] = useState<BlockedBranchAction | null>(null);
  // Nested plan modals, query-driven (?sub=modify-plan|manual-activation|log-payment)
  const [isModifyOpen, setIsModifyOpen] = useQueryModal('modify-plan', 'sub');
  const [isManualOpen, setIsManualOpen] = useQueryModal('manual-activation', 'sub');
  const [isLogOpen, setIsLogOpen] = useQueryModal('log-payment', 'sub');
  const [subNote, setSubNote] = useState('');
  const [cancelArmed, setCancelArmed] = useState(false);

  // A covered branch plan cannot be touched directly (modify, cancel renewal,
  // log payment, activate) while an active overarching restaurant plan exists
  // — otherwise Figma 1867:1718 (Action Not Allowed) applies, customized per
  // attempted action.
  // Excluding drops the branch to "No Active Plan" so it can hold its own
  // individual plan; re-including pulls it back under the restaurant plan and
  // cancels that individual branch plan (Bug-50).
  const restaurantHasPlan =
    restaurant.status === 'Active' && restaurant.planName !== 'No Active Plan';

  const handleExcludeBranch = () => {
    onPatchBranch({
      planName: 'No Active Plan',
      planName_ar: 'لا توجد خطة نشطة',
      monthlyFee: 0,
      planExpiry: '—',
      planExpiry_ar: '—',
    });
    setSubNote(t('branchExcluded'));
    setBlockedAction(null);
  };

  const handleIncludeBranch = () => {
    const tier = restaurant.planName.replace(/ Plan$/, '') || 'Enterprise';
    onPatchBranch({
      planName: `${tier} (Covered by Restaurant Plan)`,
      planName_ar: `${tierArLabel(tier)} (مشمولة بخطة المطعم)`,
      monthlyFee: 0,
      planExpiry: restaurant.planExpiry,
      planExpiry_ar: restaurant.planExpiry_ar,
    });
    setSubNote(t('branchIncluded'));
  };

  const covered =
    restaurant.status === 'Active' &&
    restaurant.planName !== 'No Active Plan' &&
    /covered/i.test(branch.planName);

  const price = branch.monthlyFee > 0
    ? { amount: branch.monthlyFee, per: 'Month' as string }
    : {
        amount: restaurant.planPrice,
        per: restaurant.planBilling === 'Monthly' ? 'Month' : restaurant.planBilling,
      };

  const addNote = () => {
    const text = noteDraft.trim();
    if (!text) return;
    setNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        by: t('adminBy'),
        text,
        date: new Date().toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
      },
    ]);
    setNoteDraft('');
  };

  const resetOverview = () => {
    setBranchName(branch.name);
    setEmail(branch.managerEmail);
    setPhone(branch.phone);
    setFullAddress(branch.address);
    setLoginEmail(branch.managerEmail);
    setTempPassword('');
    setDeleteArmed(false);
  };

  const commitFieldEdits = () =>
    onPatchBranch({
      name: branchName || branch.name,
      managerEmail: email,
      phone,
      address: fullAddress || branch.address,
    });

  const branchTabs: BranchTab[] = ['Overview', 'Subscription', 'Activity'];

  return (
    <div className="space-y-5">
      {/* Header: back / title+ID / edit + toggle */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <button
          onClick={onBack}
          aria-label={t('backToBranches')}
          className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
        >
          <ArrowLeft size={20} className="rtl:scale-x-[-1]" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D2F33]">{locField(locale, branch, 'name')}</h2>
          <p className="text-[#686868] mt-1">{isAr ? 'المعرف' : 'ID'}: <bdi dir="ltr">{idCode(branch.id)}</bdi></p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEditForm}
            aria-label={t('editBranchDetails')}
            title={t('editBranchDetails')}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors"
          >
            <SquarePen size={18} />
          </button>
          <button
            role="switch"
            aria-checked={isActive}
            aria-label={t('branchActiveStatus')}
            onClick={() => {
              const next = !isActive;
              setIsActive(next);
              onPatchBranch({ status: next ? 'Active' : 'Inactive' });
            }}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${
              isActive ? 'bg-[#22C55E]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
                isActive ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {branchTabs.map((bt) => (
          <button
            key={bt}
            onClick={() => onTabChange(bt)}
            className={`px-6 py-2.5 rounded-full text-[15px] font-medium whitespace-nowrap transition-all ${
              tab === bt
                ? 'bg-[#026F4F] text-white shadow-md'
                : 'bg-white text-[#686868] hover:text-[#2D2F33]'
            }`}
          >
            {tabLabel(bt)}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-5">
          <p className="text-sm text-[#686868]">{t('quickStats')}</p>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5">
              <p className="text-[#686868]">{t('totalOrders30d')}</p>
              <p className="text-3xl font-semibold text-[#2D2F33] mt-2">
                {branch.ordersToday.toLocaleString()}
              </p>
              <p className="flex items-center gap-1.5 text-[#158F15] text-sm mt-2">
                <TrendingUp size={16} />
                <span>{t('vsLastMonth')}</span>
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-[#686868]">{t('revenue30d')}</p>
              <p className="text-3xl font-semibold text-[#2D2F33] mt-2">
                ${branch.revenueToday.toLocaleString()}
              </p>
              <p className="flex items-center gap-1.5 text-[#158F15] text-sm mt-2">
                <TrendingUp size={16} />
                <span>{t('vsLastMonth')}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 space-y-4">
            {[
              { label: t('branchName'), value: branchName, set: setBranchName, type: 'text' },
              { label: t('emailAddress'), value: email, set: setEmail, type: 'email' },
              { label: t('phoneNumber'), value: phone, set: setPhone, type: 'tel' },
              { label: t('fullAddress'), value: fullAddress, set: setFullAddress, type: 'text' },
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => { f.set(e.target.value); }}
                  onBlur={commitFieldEdits}
                  className={pillInput}
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 space-y-4">
            <h3 className="text-lg font-semibold text-[#2D2F33]">{t('loginCredentials')}</h3>
            <div className="space-y-1.5">
              <label className="block text-sm text-[#2D2F33]">{t('email')}</label>
              <input dir="ltr"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className={pillInput}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm text-[#2D2F33]">{t('tempPassword')}</label>
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
              <label className="block text-sm text-[#2D2F33]">{t('addNewNotes')}</label>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={3}
                className="w-full px-6 py-4 bg-[#F2F2F2] rounded-2xl text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 resize-none"
              />
              <button
                onClick={addNote}
                className="px-6 py-2.5 rounded-full bg-[#026F4F]/10 hover:bg-[#026F4F]/15 text-[#026F4F] text-sm font-semibold transition-colors"
              >
                {t('addNote')}
              </button>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-[#2D2F33]">{t('previousNotes', { count: notes.length })}</p>
              {notes.length === 0 ? (
                <p className="text-sm text-[#989898]">{t('noNotes')}</p>
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
                        aria-label={t('deleteNote')}
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
              {t('cancel')}
            </button>
            <button
              onClick={() => {
                if (deleteArmed) onDeleteBranch();
                else setDeleteArmed(true);
              }}
              className="py-3.5 rounded-full bg-[#E52B2B] hover:bg-red-700 text-white font-medium transition-all"
            >
              {deleteArmed ? t('confirmDelete') : t('deleteBranch')}
            </button>
          </div>
        </div>
      )}

      {tab === 'Subscription' && (
        <div className="space-y-4">
          <div className="bg-[#222A37] rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-3 text-2xl font-semibold">
                  {locField(locale, branch, 'planName')}
                  <span className="text-[11px] font-bold bg-[#22C55E] text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {branch.status === 'Active' ? ts('active') : ts('inactive')}
                  </span>
                </p>
                <p className="text-white/60 text-sm mt-2">{tierBlurb(locField(locale, branch, 'planName') || branch.planName, locale)}</p>
                <p className="text-3xl font-semibold mt-3">
                  <bdi dir="ltr">${price.amount.toLocaleString()}</bdi>
                  <span className="text-base font-normal text-white/70">/{billingPerLabel(locale, price.per)}</span>
                </p>
              </div>
              <div className="border border-white/25 rounded-lg px-4 py-2.5 text-end flex-shrink-0">
                <p className="text-xs text-white/60">{t('nextRenewal')}</p>
                <p className="font-semibold mt-0.5 whitespace-nowrap">{locField(locale, branch, 'planExpiry')}</p>
              </div>
            </div>
            <div className="border-t border-dashed border-white/25 my-5" />
            <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3">
              <button
                onClick={() => (covered ? setBlockedAction('modify') : setIsModifyOpen(true))}
                className="py-2.5 rounded-lg bg-white text-[#2D2F33] text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('modifyPlan')}
              </button>
              <button
                onClick={() => {
                  const renewed = addYear(branch.planExpiry);
                  onPatchBranch({ planExpiry: renewed, planExpiry_ar: toArDate(renewed) });
                  setSubNote(t('planRenewedYear'));
                  setCancelArmed(false);
                }}
                className="py-2.5 rounded-lg border border-white/50 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                {t('renewPlan')}
              </button>
              <button
                onClick={() => {
                  if (covered) { setBlockedAction('cancelRenewal'); return; }
                  if (cancelArmed) {
                    setSubNote(t('autoRenewalCancelled'));
                    setCancelArmed(false);
                  } else setCancelArmed(true);
                }}
                className="py-2.5 rounded-lg bg-[#3B4252] text-white text-sm font-semibold hover:bg-[#454d61] transition-colors"
              >
                {cancelArmed ? t('confirm') : t('cancelRenewal')}
              </button>
            </div>
            {subNote && (
              <p className="flex items-center gap-1.5 text-sm text-white/70 mt-3">
                <Check size={15} className="text-[#22C55E]" />
                {subNote}
              </p>
            )}
          </div>

          {/* Re-include an excluded branch under the restaurant plan —
              cancels its individual branch plan (Bug-50) */}
          {!covered && restaurantHasPlan && (
            <div className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[17px] font-medium text-[#2D2F33]">{t('includeTitle')}</p>
                <p className="text-sm text-[#989898] mt-1">{t('includeDesc')}</p>
              </div>
              <button
                onClick={handleIncludeBranch}
                className="px-5 py-2.5 rounded-lg bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold transition-all flex-shrink-0"
              >
                {t('includeBranch')}
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 space-y-3">
            <h3 className="text-lg font-medium text-[#2D2F33]">{t('offlineManagement')}</h3>
            <p className="text-sm text-[#989898]">
              {t('offlineManagementDesc')}
            </p>
            <button
              onClick={() => (covered ? setBlockedAction('logPayment') : setIsLogOpen(true))}
              className="w-full py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
            >
              {t('logPayment')}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4">
            <p className="text-[17px] font-medium text-[#2D2F33]">{t('activateWithoutPayment')}</p>
            <button
              onClick={() => (covered ? setBlockedAction('activate') : setIsManualOpen(true))}
              className="px-5 py-2.5 rounded-lg bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold transition-all flex-shrink-0"
            >
              {t('activateManually')}
            </button>
          </div>
        </div>
      )}

      {tab === 'Activity' && (
        <div className="space-y-0">
          {(branch.activities || []).length === 0 ? (
            <p className="text-sm text-[#989898]">{t('noActivity')}</p>
          ) : (
            (branch.activities || []).map((a, i, arr) => (
              <div key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="w-4 h-4 rounded-full bg-[#026F4F] flex-shrink-0 mt-1" />
                  {i < arr.length - 1 && <span className="w-px flex-1 bg-gray-300" />}
                </div>
                <div className="pb-7">
                  <p className="font-semibold text-[#2D2F33] text-[17px]">{locField(locale, a, 'description')}</p>
                  <p className="flex items-center gap-1.5 text-sm text-[#989898] mt-1.5">
                    <Clock size={15} />
                    <span>{locField(locale, a, 'time')}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modify Plan as left slide-in (blocked → Action Not Allowed instead) */}
      <ModifyPlanModal
        isOpen={isModifyOpen}
        placement="right"
        onClose={() => setIsModifyOpen(false)}
        onActivate={(tier: FigmaTier, billing: FigmaBillingCycle, price: number) => {
          onPatchBranch({
            planName: `${tier} Plan`,
            planName_ar: planNameAr(`${tier} Plan`),
            monthlyFee: Math.round(effectiveMonthly(FIGMA_TIERS.find((t) => t.tier === tier)!.monthlyPrice, billing)),
            planExpiry: branch.planExpiry,
          });
          setSubNote(t('planChanged', { tier: tierName(tier), billing: cycleName(billing) }));
          setIsModifyOpen(false);
        }}
      />

      {/* Action Not Allowed as left slide-in (Figma 1867:1718) */}
      <ActionNotAllowedModal
        isOpen={blockedAction !== null}
        placement="right"
        action={blockedAction ?? 'modify'}
        onClose={() => setBlockedAction(null)}
        onCancelRestaurantPlan={() => {
          onPatchRestaurant({ planName: 'No Active Plan', planName_ar: 'لا توجد خطة نشطة', planPrice: 0, planExpiry: '—' });
          setSubNote(t('restaurantPlanCancelled'));
          setBlockedAction(null);
        }}
        onExcludeBranch={handleExcludeBranch}
      />

      {/* Manual Activation as left slide-in (Figma 1864:870) */}
      <ManualPlanActivationModal
        isOpen={isManualOpen}
        placement="right"
        onClose={() => setIsManualOpen(false)}
        onActivate={(tier: FigmaTier, expiryDate: string) => {
          const monthly = FIGMA_TIERS.find((t) => t.tier === tier)!.monthlyPrice;
          onPatchBranch({
            planName: `${tier} Plan`,
            planName_ar: planNameAr(`${tier} Plan`),
            monthlyFee: monthly,
            planExpiry: formatExpiryInput(expiryDate, branch.planExpiry),
            planExpiry_ar: toArDate(formatExpiryInput(expiryDate, branch.planExpiry)),
            status: 'Active',
          });
          setSubNote(t('planActivatedManual', { tier: tierName(tier) }));
          setIsManualOpen(false);
        }}
      />

      {/* Log Payment reuses the existing repo ManualActivationModal pattern */}
      <ManualActivationModal
        isOpen={isLogOpen}
        restaurant={restaurant}
        plans={mockPlans}
        onClose={() => setIsLogOpen(false)}
        onConfirm={(_rid, planId, months) => {
          const plan = mockPlans.find((p) => p.id === planId);
          if (plan) {
            const expiry = addMonths(new Date().toDateString(), months);
            onPatchBranch({
              planName: plan.name,
              planName_ar: locField(locale, plan, 'name'),
              monthlyFee: plan.priceMonthly,
              planExpiry: expiry,
              planExpiry_ar: toArDate(expiry),
            });
            setSubNote(t('offlinePaymentLogged', { plan: locField(locale, plan, 'name'), months }));
          }
          setIsLogOpen(false);
        }}
      />
    </div>
  );
}

export default function RestaurantFlowModal({
  restaurantId,
  initialTab = 'Overview',
  initialBranch = null,
  onClose,
}: {
  restaurantId: string;
  initialTab?: Tab;
  initialBranch?: { id: string; tab: BranchTab } | null;
  onClose: () => void;
}) {
  const t = useTranslations('sa.restaurantModal');
  const ts = useTranslations('common.status');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const tierName = (tier: FigmaTier) => (isAr ? tierArLabel(tier) : tier);
  const cycleName = (billing: FigmaBillingCycle) => (isAr ? billingCycleAr(billing) : billing);
  const tabLabel = (tb: Tab) =>
    tb === 'Overview' ? t('tabs.overview')
    : tb === 'Branches' ? t('tabs.branches')
    : tb === 'Subscription' ? t('tabs.subscription')
    : t('tabs.activity');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(getRestaurants());
  const restaurant = restaurants.find((r) => r.id === restaurantId) || restaurants[0];

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [branchPanel, setBranchPanel] = useState<BranchPanel>(null);
  const [branchDetails, setBranchDetails] = useState<{ id: string; tab: BranchTab } | null>(initialBranch);
  const [formReturn, setFormReturn] = useState<'list' | 'details'>('list');

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
  // Nested plan modals, query-driven (?sub=modify-plan|manual-activation|log-payment)
  const [isModifyOpen, setIsModifyOpen] = useQueryModal('modify-plan', 'sub');
  const [isManualOpen, setIsManualOpen] = useQueryModal('manual-activation', 'sub');
  const [isLogPaymentOpen, setIsLogPaymentOpen] = useQueryModal('log-payment', 'sub');
  // After subscribing to a restaurant plan, offer to pull individually-planned
  // branches under it (Bug-51). Null = no prompt. Query-mirrored
  // (?sub=include-branches) so Back dismisses it.
  const [includeSubOpen, setIncludeSubOpen] = useQueryModal('include-branches', 'sub');
  const [includePrompt, setIncludePrompt] = useState<{
    tier: string;
    expiry: string;
    expiryAr: string;
    ids: string[];
  } | null>(null);

  // Open the include-branches prompt when the restaurant holds a plan while
  // some branches still carry their own individual (non-covered) plans.
  const afterRestaurantSubscribe = (np: { planName: string; planExpiry?: string; planExpiryAr?: string }) => {
    const individual = restaurant.branches.filter((b) => !/covered/i.test(b.planName));
    if (individual.length === 0) return;
    setIncludePrompt({
      tier: np.planName.replace(/ Plan$/, '') || 'Enterprise',
      expiry: np.planExpiry ?? restaurant.planExpiry,
      expiryAr: np.planExpiryAr ?? restaurant.planExpiry_ar ?? restaurant.planExpiry,
      ids: individual.map((b) => b.id),
    });
    setIncludeSubOpen(true);
  };
  const closeIncludePrompt = () => {
    setIncludePrompt(null);
    setIncludeSubOpen(false);
  };

  const confirmIncludeBranches = () => {
    if (!includePrompt) return;
    patchRestaurant({
      branches: restaurant.branches.map((b) =>
        includePrompt.ids.includes(b.id)
          ? {
              ...b,
              planName: `${includePrompt.tier} (Covered by Restaurant Plan)`,
              planName_ar: `${tierArLabel(includePrompt.tier)} (مشمولة بخطة المطعم)`,
              monthlyFee: 0,
              planExpiry: includePrompt.expiry,
              planExpiry_ar: includePrompt.expiryAr,
            }
          : b,
      ),
    });
    setRenewalNote(t('branchesIncluded', { count: includePrompt.ids.length }));
    closeIncludePrompt();
  };

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
    setFormReturn('list');
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
    setFormReturn('details');
    setBranchPanel({ mode: 'edit', branchId: branch.id });
  };

  const openBranchDetails = (branch: Branch) =>
    setBranchDetails({ id: branch.id, tab: 'Overview' });

  const onPatchBranch = (branchId: string, patch: Partial<Branch>) =>
    patchRestaurant({
      branches: restaurant.branches.map((b) => (b.id === branchId ? { ...b, ...patch } : b)),
    });

  const onDeleteBranch = (branchId: string) => {
    patchRestaurant({ branches: restaurant.branches.filter((b) => b.id !== branchId) });
    setBranchDetails(null);
    setActiveTab('Branches');
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
        planName_ar: locField(locale, restaurant, 'planName') || restaurant.planName,
        planExpiry: restaurant.planExpiry,
        planExpiry_ar: locField(locale, restaurant, 'planExpiry') || restaurant.planExpiry,
        monthlyFee: 0,
      };
      patchRestaurant({ branches: [...restaurant.branches, nb] });
      setBranchPanel(null);
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
      const returnTo = formReturn;
      setBranchPanel(null);
      if (returnTo === 'details') setBranchDetails({ id: branchPanel.branchId, tab: 'Overview' });
    }
  };

  const deleteBranch = () => {
    if (branchPanel?.mode === 'edit') {
      patchRestaurant({
        branches: restaurant.branches.filter((b) => b.id !== branchPanel.branchId),
      });
    }
    setBranchPanel(null);
    setBranchDetails(null);
    setActiveTab('Branches');
  };

  const addNote = () => {
    const text = noteDraft.trim();
    if (!text) return;
    setNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        by: t('adminBy'),
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
    <LeftPanel onClose={onClose} labelledBy={restaurant.name} widthClass="w-[min(700px,96vw)]" tone="gray">
      <div className="space-y-5">
          {/* Header: back / title+ID / status toggle (Figma 1862:762) */}
          {!branchDetails && (
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {branchPanel ? (
              <button
                onClick={() => {
                  if (formReturn === 'details' && branchPanel.mode === 'edit') {
                    const id = branchPanel.branchId;
                    setBranchPanel(null);
                    setBranchDetails({ id, tab: 'Overview' });
                  } else {
                    setBranchPanel(null);
                    setActiveTab('Branches');
                  }
                }}
                aria-label={t('backToBranches')}
                className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
              >
                <ArrowLeft size={20} className="rtl:scale-x-[-1]" />
              </button>
            ) : (
              <button
                onClick={onClose}
                aria-label={t('backToRestaurants')}
                className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
              >
                <ArrowLeft size={20} className="rtl:scale-x-[-1]" />
              </button>
            )}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D2F33]">
                {branchPanel?.mode === 'add'
                  ? t('addNewBranch')
                  : branchPanel?.mode === 'edit'
                    ? (editingBranch ? locField(locale, editingBranch, 'name') : t('mainBranch'))
                    : locField(locale, restaurant, 'name')}
              </h2>
              {!branchPanel && (
                <p className="text-[#686868] mt-1">ID: {idCode(restaurant.id)}</p>
              )}
            </div>
            {!branchPanel ? (
              <button
                role="switch"
                aria-checked={isActive}
                aria-label={t('restaurantActiveStatus')}
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
                    isActive ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            ) : (
              <span className="w-14" />
            )}
          </div>
          )}
          {!branchPanel && !branchDetails && (
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
                    {tabLabel(tab)}
                  </button>
                ))}
              </div>

              {/* OVERVIEW (Figma 1862:762) */}
              {activeTab === 'Overview' && (
                <div className="space-y-5">
                  <p className="text-sm text-[#686868]">{t('quickStats')}</p>
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-5">
                      <p className="text-[#686868]">{t('totalOrders30d')}</p>
                      <p className="text-3xl font-semibold text-[#2D2F33] mt-2">
                        {restaurant.totalOrders.toLocaleString()}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#158F15] text-sm mt-2">
                        <TrendingUp size={16} />
                        <span>{t('vsLastMonth')}</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-5">
                      <p className="text-[#686868]">{t('revenue30d')}</p>
                      <p className="text-3xl font-semibold text-[#2D2F33] mt-2">
                        ${restaurant.totalRevenue.toLocaleString()}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#158F15] text-sm mt-2">
                        <TrendingUp size={16} />
                        <span>{t('vsLastMonth')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 space-y-4">
                     {[
                      { label: t('ownerName'), value: ownerName, set: setOwnerName, type: 'text' },
                      { label: t('emailAddress'), value: ownerEmail, set: setOwnerEmail, type: 'email' },
                      { label: t('phoneNumber'), value: ownerPhone, set: setOwnerPhone, type: 'tel' },
                      { label: t('secondaryPhone'), value: secondPhone, set: setSecondPhone, type: 'tel' },
                      { label: t('primaryLocation'), value: primaryLocation, set: setPrimaryLocation, type: 'text' },
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
                    <h3 className="text-lg font-semibold text-[#2D2F33]">{t('loginCredentials')}</h3>
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">{t('email')}</label>
                      <input dir="ltr"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        className={pillInput}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">{t('tempPassword')}</label>
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
                      <label className="block text-sm text-[#2D2F33]">{t('addNewNotes')}</label>
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder={t('notesPlaceholder')}
                        rows={3}
                        className="w-full px-6 py-4 bg-[#F2F2F2] rounded-2xl text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 resize-none"
                      />
                      <button
                        onClick={addNote}
                        className="px-6 py-2.5 rounded-full bg-[#026F4F]/10 hover:bg-[#026F4F]/15 text-[#026F4F] text-sm font-semibold transition-colors"
                      >
                        {t('addNote')}
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-[#2D2F33]">{t('previousNotes', { count: notes.length })}</p>
                      {notes.length === 0 ? (
                        <p className="text-sm text-[#989898]">{t('noNotes')}</p>
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
                                aria-label={t('deleteNote')}
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
                          onClose();
                        } else setDeleteArmed(true);
                      }}
                      className="py-3.5 rounded-full bg-[#E52B2B] hover:bg-red-700 text-white font-medium transition-all"
                    >
                      {deleteArmed ? t('confirmDelete') : t('deleteRestaurant')}
                    </button>
                  </div>
                </div>
              )}

              {/* BRANCHES (Figma 1465:821) */}
              {activeTab === 'Branches' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#686868]">
                      {t('activeLocations', { count: restaurant.branches.length })}
                    </p>
                    <button
                      onClick={openAddBranch}
                      className="flex items-center gap-1.5 text-[#026F4F] font-semibold text-[15px] hover:underline"
                    >
                      <Plus size={18} />
                      <span>{t('addBranch')}</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {restaurant.branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => openBranchDetails(branch)}
                        className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-start hover:shadow-md transition-shadow"
                      >
                        <span className="w-14 h-14 rounded-xl bg-[#F2F2F2] flex items-center justify-center text-[#686868] flex-shrink-0">
                          <Store size={26} strokeWidth={1.6} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-[#2D2F33] text-[17px] truncate">
                            {locField(locale, branch, 'name')}
                          </span>
                          <span className="block text-sm text-[#989898] truncate mt-0.5">
                            {locField(locale, branch, 'address')}
                          </span>
                        </span>
                        <span className="text-sm font-medium px-4 py-1.5 rounded-lg bg-[#D9F5D9] text-[#158F15] flex-shrink-0">
                          {t('paid')}
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
                          {locField(locale, restaurant, 'planName')}
                          <span className="text-[11px] font-bold bg-[#22C55E] text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
                            {isActive ? ts('active') : restaurant.status === 'Suspended' ? ts('suspended') : ts('pending')}
                          </span>
                        </p>
                        <p className="text-white/60 text-sm mt-2">{tierBlurb(locField(locale, restaurant, 'planName') || restaurant.planName, locale)}</p>
                        <p className="text-3xl font-semibold mt-3">
                          <bdi dir="ltr">${restaurant.planPrice.toLocaleString()}</bdi>
                          <span className="text-base font-normal text-white/70">
                            /{billingPerLabel(locale, restaurant.planBilling === 'Monthly' ? 'Month' : restaurant.planBilling)}
                          </span>
                        </p>
                      </div>
                      <div className="border border-white/25 rounded-lg px-4 py-2.5 text-end flex-shrink-0">
                        <p className="text-xs text-white/60">{t('nextRenewal')}</p>
                        <p className="font-semibold mt-0.5 whitespace-nowrap">{locField(locale, restaurant, 'planExpiry')}</p>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-white/25 my-5" />
                    <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3">
                      <button
                        onClick={() => setIsModifyOpen(true)}
                        className="py-2.5 rounded-lg bg-white text-[#2D2F33] text-sm font-semibold hover:bg-gray-100 transition-colors"
                      >
                        {t('modifyPlan')}
                      </button>
                      <button
                        onClick={() => {
                          const renewedRt = addYear(restaurant.planExpiry);
                          patchRestaurant({ planExpiry: renewedRt, planExpiry_ar: toArDate(renewedRt) });
                          setRenewalNote(t('planRenewedYear'));
                          setCancelArmed(false);
                        }}
                        className="py-2.5 rounded-lg border border-white/50 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                      >
                        {t('renewPlan')}
                      </button>
                      <button
                        onClick={() => {
                          if (cancelArmed) {
                            setRenewalNote(t('autoRenewalCancelled'));
                            setCancelArmed(false);
                          } else setCancelArmed(true);
                        }}
                        className="py-2.5 rounded-lg bg-[#3B4252] text-white text-sm font-semibold hover:bg-[#454d61] transition-colors"
                      >
                        {cancelArmed ? t('confirm') : t('cancelRenewal')}
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
                    <h3 className="text-lg font-medium text-[#2D2F33]">{t('offlineManagement')}</h3>
                    <p className="text-sm text-[#989898]">
                      {t('offlineManagementDesc')}
                    </p>
                    <button
                      onClick={() => setIsLogPaymentOpen(true)}
                      className="w-full py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
                    >
                      {t('logPayment')}
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4">
                    <p className="text-[17px] font-medium text-[#2D2F33]">{t('activateWithoutPayment')}</p>
                    <button
                      onClick={() => setIsManualOpen(true)}
                      className="px-5 py-2.5 rounded-lg bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold transition-all flex-shrink-0"
                    >
                      {t('activateManually')}
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVITY (Figma 1514:1940 — the "Activation" frame) */}
              {activeTab === 'Activity' && (
                <div className="space-y-0">
                  {activity.length === 0 ? (
                    <p className="text-sm text-[#989898]">{t('noActivity')}</p>
                  ) : (
                    activity.map((a, i) => (
                      <div key={a.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="w-4 h-4 rounded-full bg-[#026F4F] flex-shrink-0 mt-1" />
                          {i < activity.length - 1 && <span className="w-px flex-1 bg-gray-300" />}
                        </div>
                        <div className="pb-7">
                          <p className="font-semibold text-[#2D2F33] text-[17px]">{locField(locale, a, 'description')}</p>
                          <p className="flex items-center gap-1.5 text-sm text-[#989898] mt-1.5">
                            <Clock size={15} />
                            <span>{locField(locale, a, 'time')}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* BRANCH DETAILS VIEW (Figma 1867:1032 / 1867:1191 / 1867:1244) */}
          {!branchPanel &&
            branchDetails &&
            (() => {
              const branch = restaurant.branches.find((b) => b.id === branchDetails.id);
              if (!branch) return null;
              return (
                <BranchDetailsPanel
                  key={branch.id}
                  restaurant={restaurant}
                  branch={branch}
                  tab={branchDetails.tab}
                  onTabChange={(tab) => setBranchDetails({ id: branch.id, tab })}
                  onBack={() => {
                    setBranchDetails(null);
                    setActiveTab('Branches');
                  }}
                  onPatchBranch={(patch) => onPatchBranch(branch.id, patch)}
                  onDeleteBranch={() => onDeleteBranch(branch.id)}
                  onOpenEditForm={() => openEditBranch(branch)}
                  onPatchRestaurant={patchRestaurant}
                />
              );
            })()}

          {/* BRANCH ADD / EDIT PANEL (Figma 1508:1274 / 1511:1544) */}
          {branchPanel && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-semibold text-[#2D2F33]">{t('basicInfo')}</h3>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">{t('branchName')}</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder={t('branchNamePlaceholder')}
                    className={pillInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">{t('location')}</label>
                  <MapPlaceholder />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">{t('fullAddress')}</label>
                  <input
                    type="text"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder={t('addressPlaceholder')}
                    className={pillInput}
                  />
                </div>
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">{t('city')}</label>
                    <input
                      type="text"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className={pillInput}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">{t('country')}</label>
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
                <h3 className="text-lg font-semibold text-[#2D2F33]">{t('contactSettings')}</h3>
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">{t('phoneNumber')}</label>
                    <input dir="ltr"
                      type="tel"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      placeholder="+155555484"
                      className={pillInput}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-[#2D2F33]">{t('emailOptional')}</label>
                    <input dir="ltr"
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
                  {t('cancel')}
                </button>
                {branchPanel.mode === 'add' ? (
                  <button
                    onClick={saveBranch}
                    className="py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
                  >
                    {t('createBranch')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (branchDeleteArmed) deleteBranch();
                      else setBranchDeleteArmed(true);
                    }}
                    className="py-3.5 rounded-full bg-[#E52B2B] hover:bg-red-700 text-white font-medium transition-all"
                  >
                    {branchDeleteArmed ? t('confirmDelete') : t('deleteBranch')}
                  </button>
                )}
              </div>
            </div>
          )}
      </div>

      {/* Modify Plan (Figma 1692:72598) */}
      <ModifyPlanModal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        onActivate={(tier: FigmaTier, billing: FigmaBillingCycle, price: number) => {
          const planName = `${tier} Plan`;
          patchRestaurant({
            planName,
            planName_ar: planNameAr(planName),
            planBilling: billing,
            planPrice: price,
          });
          setRenewalNote(t('planChanged', { tier: tierName(tier), billing: cycleName(billing) }));
          setIsModifyOpen(false);
          afterRestaurantSubscribe({ planName });
        }}
      />

      {/* Manual Activation (Figma 1864:870) */}
      <ManualPlanActivationModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onActivate={(tier: FigmaTier, expiryDate: string) => {
          const monthly = FIGMA_TIERS.find((t) => t.tier === tier)!.monthlyPrice;
          const planName = `${tier} Plan`;
          const newExpiry = expiryDate
            ? new Date(expiryDate + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : restaurant.planExpiry;
          patchRestaurant({
            planName,
            planName_ar: planNameAr(planName),
            planBilling: 'Monthly',
            planPrice: monthly,
            planExpiry: newExpiry,
            planExpiry_ar: toArDate(newExpiry),
            status: 'Active',
          });
          setIsActive(true);
          setRenewalNote(t('planActivatedManual', { tier: tierName(tier) }));
          setIsManualOpen(false);
          afterRestaurantSubscribe({ planName, planExpiry: newExpiry, planExpiryAr: toArDate(newExpiry) });
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
              planName_ar: locField(locale, plan, 'name'),
              planBilling: 'Monthly',
              planPrice: plan.priceMonthly * months,
            });
            setRenewalNote(t('offlinePaymentLogged', { plan: locField(locale, plan, 'name'), months }));
            afterRestaurantSubscribe({ planName: plan.name });
          }
          setIsLogPaymentOpen(false);
        }}
      />

      {/* Include-branches prompt (Bug-51): after subscribing, offer to pull
          individually-planned branches under the restaurant plan */}
      {includePrompt && includeSubOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={closeIncludePrompt} className="fixed inset-0 bg-black/50 transition-opacity" />
          <div className="relative bg-white w-full max-w-[520px] rounded-[22px] p-8 shadow-2xl border border-gray-100 z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-[22px] font-bold text-[#2D2F33] tracking-tight">
              {t('includeBranchesTitle')}
            </h3>
            <p className="text-[15px] text-[#989898] leading-relaxed mt-2">
              {t('includeBranchesDesc')}
            </p>
            <div className="mt-5 max-h-[240px] overflow-y-auto space-y-2">
              {restaurant.branches
                .filter((b) => !/covered/i.test(b.planName))
                .map((b) => {
                  const checked = includePrompt.ids.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        setIncludePrompt((prev) =>
                          prev
                            ? {
                                ...prev,
                                ids: checked
                                  ? prev.ids.filter((id) => id !== b.id)
                                  : [...prev.ids, b.id],
                              }
                            : prev,
                        )
                      }
                      className="w-full flex items-center gap-3 rounded-2xl border border-[#E9E9E9] px-4 py-3 text-start transition-colors hover:border-[#026F4F]"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                          checked ? 'border-[#026F4F] bg-[#026F4F] text-white' : 'border-[#B9B9B9] bg-white text-transparent'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-[#2D2F33]">
                          {locField(locale, b, 'name')}
                        </span>
                        <span className="block truncate text-xs text-[#989898]">
                          {locField(locale, b, 'planName')}
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeIncludePrompt}
                className="h-[52px] rounded-full bg-[#E9E9E9] hover:bg-gray-300 text-[#2D2F33] font-semibold text-[15px] transition-colors"
              >
                {t('skip')}
              </button>
              <button
                type="button"
                onClick={confirmIncludeBranches}
                disabled={includePrompt.ids.length === 0}
                className="h-[52px] rounded-full bg-[#026F4F] hover:bg-[#01533B] disabled:opacity-40 text-white font-semibold text-[15px] transition-all"
              >
                {t('includeSelected', { count: includePrompt.ids.length })}
              </button>
            </div>
          </div>
        </div>
      )}
    </LeftPanel>
  );
}
