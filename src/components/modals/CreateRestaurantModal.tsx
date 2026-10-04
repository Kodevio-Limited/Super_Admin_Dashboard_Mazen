'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Copy, ArrowRight, ArrowLeft, Upload, BadgeCheck, Plus, Trash2, Share2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import PlanTierPicker from '../PlanTierPicker';
import { toArDate, planNameAr } from '../../lib/localize';
import { readQueryParam, writeQueryParam } from '../../lib/use-query-modal';
import { useBodyScrollLock, useEscapeToClose } from '../../lib/useModalShell';
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
  const [shared, setShared] = useState(false);
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
  const t = useTranslations('sa.createRestaurant');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const CATEGORY_EN = ['Japanese & Ramen', 'Italian & Pizzeria', 'American Burger & Grill', 'Mexican & Tacos', 'French Bistro & Cafe', 'Seafood & Fine Dining'];
  const catsAr = t.raw('categories') as unknown as string[];
  const catLabel = (en: string) => {
    const i = CATEGORY_EN.indexOf(en);
    return isAr && catsAr[i] ? catsAr[i] : en;
  };

  useBodyScrollLock(isOpen);
  useEscapeToClose(isOpen, onClose);

  // Query-driven step: ?modal=create-restaurant[&step=branches|plan|credentials|done]
  useEffect(() => {
    if (!isOpen) {
      writeQueryParam('step', null, false);
      return;
    }
    const s = readQueryParam('step');
    if (s === 'branches' || s === 'plan' || s === 'credentials' || s === 'done') {
      setStep(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    writeQueryParam('step', step === 'info' ? null : step, false);
  }, [isOpen, step]);

  if (!isOpen) return null;

  const updateDraft = (i: number, patch: Partial<DraftBranch>) =>
    setDraftBranches((prev) => prev.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('branches');
  };

  const handleBranchesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Bug-17: exactly one Main Branch — block duplicate/“main” names on added branches.
    const names = draftBranches.slice(1).map((b) => b.name.trim().toLowerCase()).filter(Boolean);
    if (names.length !== new Set(names).size || names.includes('main branch')) return;
    setStep('plan');
  };

  const handlePlanDone = () => {
    const tempPass = 'Echo#' + Math.floor(100000 + Math.random() * 900000);
    setCredentials({ username: ownerEmail, temporaryPassword: tempPass });

    const chosenTier = FIGMA_TIERS.find((p) => p.tier === selectedTier)!;
    const id = `rest-${Date.now()}`;
    const branches = draftBranches.map((b, i) => ({
      id: `br-${Date.now()}-${i}`,
      // Bug-17: first block is always the single Main Branch.
      name: i === 0 ? `${name} Main Branch` : (b.name || `${name} Branch ${i + 1}`),
      name_ar: b.name || undefined,
      address: [b.address, b.cityCountry].filter(Boolean).join(', ') || address,
      phone: ownerPhone,
      managerName: ownerName,
      managerEmail: ownerEmail,
      staffCount: 1,
      ordersToday: 0,
      revenueToday: 0,
      status: 'Active' as const,
      planName: `${chosenTier.tier} Plan`,
      planName_ar: planNameAr(`${chosenTier.tier} Plan`),
      planExpiry: 'Sep 30, 2027',
      planExpiry_ar: toArDate('Sep 30, 2027'),
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
      joinedDate_ar: 'الآن',
      planName: `${chosenTier.tier} Plan`,
      planName_ar: planNameAr(`${chosenTier.tier} Plan`),
      planType: 'Restaurant',
      planBilling: billingCycle,
      planPrice: cycleTotal(chosenTier.monthlyPrice, billingCycle),
      planExpiry: 'Sep 30, 2027',
      planExpiry_ar: toArDate('Sep 30, 2027'),
      totalBranches: branches.length,
      totalOrders: 0,
      totalRevenue: 0,
      branches,
    });
    setStep('credentials');
  };

  const credentialsText = () =>
    `Login URL: http://localhost:3000/login\nEmail: ${credentials.username}\nPassword: ${credentials.temporaryPassword}`;

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText(credentialsText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bug-18: one-click share of the new owner's login (native share sheet,
  // WhatsApp-capable) with clipboard fallback.
  const handleShareCredentials = async () => {
    const text = credentialsText();
    try {
      if (navigator.share) {
        await navigator.share({ title: t('createdTitle'), text });
        return;
      }
      throw new Error('no-share');
    } catch {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // clipboard unavailable — nothing to fall back to
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
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
                {step === 'credentials' ? t('createdTitle') : t('title')}
              </h3>
              <button
                onClick={onClose}
                aria-label={t('close')}
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
                  <label className="block text-sm text-[#2D2F33]">{t('restaurantName')}</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t('restaurantNamePlaceholder')} className={pillInput} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">{t('category')}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={pillInput}>
                    {CATEGORY_EN.map((c) => (
                      <option key={c} value={c}>{catLabel(c)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">{t('ownerFullName')}</label>
                  <input type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder={t('ownerNamePlaceholder')} className={pillInput} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">{t('ownerEmail')}</label>
                  <input dir="ltr" type="email" required value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder={t('ownerEmailPlaceholder')} className={pillInput} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm text-[#2D2F33]">{t('phoneNumber')}</label>
                  <input dir="ltr" type="tel" required value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder={t('phonePlaceholder')} className={pillInput} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">{t('hqAddress')}</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('hqPlaceholder')} className={pillInput} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">{t('logoTitle')}</label>
                <div className="border-2 border-dashed border-gray-200 hover:border-[#026F4F] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#F8F9FA]">
                  <Upload size={24} className="mx-auto text-[#989898] mb-1" />
                  <p className="text-xs text-[#2D2F33] font-medium">{t('logoHint')}</p>
                  <p className="text-[11px] text-[#989898]">{t('logoHint2')}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold text-[#686868] hover:bg-gray-50 transition-colors">
                  {t('cancel')}
                </button>
                <button type="submit" className="px-8 py-3 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer">
                  <span>{t('nextStep')}</span>
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
                  <h4 className="text-xl font-semibold text-[#2D2F33]">{t('locationsTitle')}</h4>
                  <p className="text-[#989898] mt-1">{t('locationsDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftBranches((prev) => [...prev, { ...EMPTY_BRANCH }])}
                  className="flex items-center gap-1.5 bg-[#026F4F]/10 hover:bg-[#026F4F]/15 text-[#026F4F] text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
                >
                  <Plus size={16} />
                  <span>{t('addBranch')}</span>
                </button>
              </div>

              {draftBranches.map((b, i) => (
                <div key={i} className="space-y-5">
                  {i === 0 ? (
                    // Bug-17: exactly one Main Branch — fixed, non-editable, non-deletable.
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">{t('branchName')}</label>
                      <div className="flex h-14 items-center justify-between rounded-full bg-[#026F4F]/10 px-6 text-[15px] font-semibold text-[#026F4F]">
                        <span>{t('mainBranch')}</span>
                        <span className="rounded-full bg-[#026F4F] px-3 py-1 text-xs font-semibold text-white">{t('primary')}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <p className="text-sm font-semibold text-[#2D2F33]">
                          {t('branchN', { n: i + 1 })}
                        </p>
                        <button
                          type="button"
                          onClick={() => setDraftBranches((prev) => prev.filter((_, j) => j !== i))}
                          aria-label={t('removeBranch')}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDECEC] text-[#E85E5E] transition-colors hover:bg-[#E85E5E] hover:text-white"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm text-[#2D2F33]">{t('branchName')}</label>
                        <input type="text" value={b.name} onChange={(e) => updateDraft(i, { name: e.target.value })} placeholder={t('branchNamePlaceholder')} className={pillInput} />
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">{t('cityCountry')}</label>
                      <input type="text" value={b.cityCountry} onChange={(e) => updateDraft(i, { cityCountry: e.target.value })} placeholder={t('cityCountryPlaceholder')} className={pillInput} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm text-[#2D2F33]">{t('fullAddress')}</label>
                      <input type="text" value={b.address} onChange={(e) => updateDraft(i, { address: e.target.value })} placeholder={t('addressPlaceholder')} className={pillInput} />
                    </div>
                  </div>
                </div>
              ))}
              {(() => {
                const names = draftBranches.slice(1).map((b) => b.name.trim().toLowerCase()).filter(Boolean);
                const dup = names.length !== new Set(names).size || names.includes('main branch');
                return dup ? (
                  <p className="text-sm font-medium text-[#E85E5E]">{t('duplicateBranchName')}</p>
                ) : null;
              })()}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={() => setStep('info')} className="px-6 py-3 rounded-full text-sm font-semibold text-[#686868] hover:bg-gray-100 flex items-center gap-2 transition-colors">
              <ArrowLeft size={16} className="rtl:scale-x-[-1]" />
                  <span>{t('back')}</span>
                </button>
                <button type="submit" className="px-10 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md flex items-center gap-2 transition-all cursor-pointer">
                  <span>{t('nextStep')}</span>
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
              <ArrowLeft size={16} className="rtl:scale-x-[-1]" />
                  <span>{t('back')}</span>
                </button>
                <button onClick={handlePlanDone} className="px-10 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all cursor-pointer">
                  {t('done')}
                </button>
              </div>
            </div>
          )}

          {/* S4 — credentials (Figma 1862:546) */}
          {step === 'credentials' && (
            <div className="space-y-6">
              <p className="text-center text-[#989898] max-w-xl mx-auto">
                {t('credentialsDesc')}
              </p>
              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">{t('email')}</label>
                <input type="text" readOnly value={credentials.username} placeholder="e.g. example@gmail.com" className={pillInput} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">{t('tempPassword')}</label>
                <input type="text" readOnly value={credentials.temporaryPassword} placeholder="aKOhfyf8qw9r9-" className={pillInput} />
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <button onClick={handleCopyCredentials} className="px-6 py-3 rounded-full border border-gray-200 hover:border-[#026F4F] hover:text-[#026F4F] text-sm font-semibold text-[#2D2F33] flex items-center gap-2 transition-all">
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    <span>{copied ? t('copied') : t('copyCredentials')}</span>
                  </button>
                  <button onClick={handleShareCredentials} className="px-6 py-3 rounded-full border border-gray-200 hover:border-[#026F4F] hover:text-[#026F4F] text-sm font-semibold text-[#2D2F33] flex items-center gap-2 transition-all">
                    {shared ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
                    <span>{shared ? t('copied') : t('shareCredentials')}</span>
                  </button>
                </div>
                <button onClick={() => setStep('done')} className="px-10 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all cursor-pointer">
                  {t('done')}
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
              <h3 className="text-2xl font-semibold text-[#2D2F33]">{t('createdDone')}</h3>
              <p className="text-[#989898] max-w-md mx-auto">
                {t('createdDesc', { name: '\u2066' + name + '\u2069' })}
              </p>
              <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
                <button onClick={onClose} className="px-10 py-3.5 rounded-full bg-[#F2F2F2] hover:bg-gray-200 text-[#2D2F33] font-medium transition-all min-w-[180px]">
                  {t('close')}
                </button>
                <button onClick={goToRestaurant} className="px-10 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all min-w-[180px]">
                  {t('viewRestaurant')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
