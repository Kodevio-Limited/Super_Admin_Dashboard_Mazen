'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, SquarePen, Trash2, Users } from 'lucide-react';
import Topbar from '@/components/Topbar';
import PlanFormModal from '@/components/modals/PlanFormModal';
import {
  FIGMA_TIERS,
  FIGMA_CYCLES,
  FigmaBillingCycle,
  CustomPlan,
  customPlanBranchLimit,
  customPlanPrice,
  effectiveMonthly,
  formatMonthly,
  moduleArLabel,
} from '@/data/figmaPlans';

// Source of truth: Figma frame "Subscriptions" (1514:2021).
// Built-in tiers render exactly as designed (incl. static "1,024" counts);
// custom plans created via the Figma form frames share the card language.
export default function SubscriptionsPage() {
  const t = useTranslations('sa.subscriptions');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [scope, setScope] = useState<'Restaurant' | 'Branch'>('Restaurant');
  const [billingCycle, setBillingCycle] = useState<FigmaBillingCycle>('Yearly');
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);
  const [planForm, setPlanForm] = useState<{ kind: 'Restaurant' | 'Branch'; editing: CustomPlan | null } | null>(null);
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null);

  const scopedCustom = customPlans.filter((p) => p.kind === scope);

  const handleSavePlan = (plan: CustomPlan) => {
    setCustomPlans((prev) => {
      const exists = prev.some((p) => p.id === plan.id);
      return exists ? prev.map((p) => (p.id === plan.id ? plan : p)) : [...prev, plan];
    });
    setDeleteArmed(null);
  };

  const priceForTier = (monthly: number) => effectiveMonthly(monthly, billingCycle);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title={t('title')} subtitle={t('subtitle')} />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        <div>
          <h2 className="text-3xl font-bold text-[#2D2F33]">{t('title')}</h2>
          <p className="text-[#989898] mt-1">{t('subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold text-[#2D2F33]">{t('plans')}</h3>
            <div className="flex items-center bg-[#F2F2F2] p-1 rounded-lg text-sm font-medium">
              {(['Restaurant Plan', 'Branch Plan'] as const).map((label) => {
                const value = label === 'Restaurant Plan' ? 'Restaurant' : 'Branch';
                const selected = scope === value;
                return (
                  <button
                    key={label}
                    onClick={() => setScope(value)}
                    className={`px-5 py-2.5 rounded-md transition-all ${
                      selected ? 'bg-white shadow text-[#2D2F33] font-semibold' : 'text-[#989898] hover:text-[#2D2F33]'
                    }`}
                  >
                    {value === 'Restaurant' ? t('restaurantPlan') : t('branchPlan')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing cycle toggle (Figma labels, "Quaterly" spelling kept) */}
          <div className="flex flex-wrap">
            <div className="flex flex-wrap items-center bg-[#F2F2F2] p-1.5 rounded-full text-sm">
              {FIGMA_CYCLES.map((b) => (
                <button
                  key={b.cycle}
                  onClick={() => setBillingCycle(b.cycle)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full transition-all ${
                    billingCycle === b.cycle
                      ? 'bg-white shadow font-semibold text-[#2D2F33]'
                      : 'text-[#686868] hover:text-[#2D2F33]'
                  }`}
                >
                  {t(`billingCycle.${b.cycle.toLowerCase()}` as any)}
                  {b.saveLabel && <span className="text-[#158F15] font-medium"> {isAr ? (b.saveLabel_ar ?? b.saveLabel) : b.saveLabel}</span>}
                </button>
              ))}
            </div>
          </div>

          {scope === 'Restaurant' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {FIGMA_TIERS.map((plan) => {
                const isPopular = plan.tier === 'Pro';
                return (
                  <div
                    key={plan.tier}
                    className={`relative bg-white rounded-2xl border-2 p-5 flex flex-col ${
                      isPopular ? 'border-[#026F4F] shadow-md' : 'border-gray-200'
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#026F4F] text-white text-[11px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                        {t('popular')}
                      </span>
                    )}
                    <h4 className="font-bold text-[#2D2F33] text-lg">{isAr ? (plan.tier_ar ?? plan.tier) : plan.tier}</h4>
                    <div className="text-[32px] leading-tight font-bold text-[#2D2F33] mt-1">
                      {formatMonthly(priceForTier(plan.monthlyPrice))}
                      <span className="text-sm text-[#989898] font-normal"> {isAr ? '/شهر' : '/mo'}</span>
                    </div>
                    <span className="inline-flex w-fit mt-2 text-xs font-medium text-[#026F4F] bg-[#026F4F]/10 px-2.5 py-1 rounded-full">
                      {isAr ? (plan.branchLimit_ar ?? plan.branchLimit) : plan.branchLimit}
                    </span>
                    <ul className="mt-3 space-y-1.5 flex-1">
                      {(isAr ? (plan.features_ar ?? plan.features) : plan.features).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-[#2D2F33] font-medium">
                          <span className="text-[#158F15]">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-[#686868]">
                        <Users size={16} />
                        1,024
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-10 h-10 rounded-lg bg-[#F2F2F2] flex items-center justify-center text-[#686868]">
                          <SquarePen size={17} />
                        </span>
                        <span className="w-10 h-10 rounded-lg bg-[#E05252] flex items-center justify-center text-white">
                          <Trash2 size={17} />
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {scopedCustom.map((plan) => (
                <CustomPlanCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  deleteArmed={deleteArmed === plan.id}
                  onEdit={() => setPlanForm({ kind: plan.kind, editing: plan })}
                  onDelete={() => {
                    if (deleteArmed === plan.id) {
                      setCustomPlans((prev) => prev.filter((p) => p.id !== plan.id));
                      setDeleteArmed(null);
                    } else setDeleteArmed(plan.id);
                  }}
                />
              ))}

              <button
                onClick={() => setPlanForm({ kind: 'Restaurant', editing: null })}
                className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#026F4F] text-[#989898] hover:text-[#026F4F] flex flex-col items-center justify-center gap-4 min-h-[320px] transition-colors"
              >
                <Plus size={44} strokeWidth={1.5} />
                <span className="text-xl font-medium">{t('createNewPlan')}</span>
              </button>
            </div>
          ) : (
            <BranchPlans
              customPlans={scopedCustom}
              onCreate={() => setPlanForm({ kind: 'Branch', editing: null })}
              onEdit={(plan) => setPlanForm({ kind: plan.kind, editing: plan })}
              onDelete={(plan) => {
                if (deleteArmed === plan.id) {
                  setCustomPlans((prev) => prev.filter((p) => p.id !== plan.id));
                  setDeleteArmed(null);
                } else setDeleteArmed(plan.id);
              }}
              deleteArmedId={deleteArmed}
            />
          )}
        </div>
      </main>

      {planForm && (
        <PlanFormModal
          key={`${planForm.kind}-${planForm.editing?.id || 'new'}`}
          isOpen
          kind={planForm.kind}
          editing={planForm.editing}
          onClose={() => setPlanForm(null)}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
}

function CustomPlanCard({
  plan,
  billingCycle,
  deleteArmed,
  onEdit,
  onDelete,
}: {
  plan: CustomPlan;
  billingCycle: FigmaBillingCycle;
  deleteArmed: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations('sa.subscriptions');
  const tc = useTranslations('common.actions');
  const locale = useLocale();
  const ar = locale === 'ar';
  return (
    <div className="relative bg-white rounded-2xl border-2 border-gray-200 p-5 flex flex-col">
      <h4 className="font-bold text-[#2D2F33] text-lg">{plan.name}</h4>
      <div className="text-[32px] leading-tight font-bold text-[#2D2F33] mt-1">
        <span dir="ltr">${customPlanPrice(plan, billingCycle).toLocaleString()}</span>
        <span className="text-sm text-[#989898] font-normal"> {ar ? '/شهر' : '/mo'}</span>
      </div>
      <span className="inline-flex w-fit mt-2 text-xs font-medium text-[#026F4F] bg-[#026F4F]/10 px-2.5 py-1 rounded-full">
        {customPlanBranchLimit(plan, locale)}
      </span>
      <ul className="mt-3 space-y-1.5 flex-1">
        {plan.modules.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-[#2D2F33] font-medium">
            <span className="text-[#158F15]">✓</span>
            <span>{moduleArLabel(f, locale)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-[#686868]">
          <Users size={16} />0
        </span>
        <span className="flex items-center gap-2">
          <button
            onClick={onEdit}
            aria-label={`${tc('edit')} ${plan.name}`}
            className="w-10 h-10 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] transition-colors"
          >
            <SquarePen size={17} />
          </button>
          <button
            onClick={onDelete}
            aria-label={`${tc('delete')} ${plan.name}`}
            title={deleteArmed ? tc('confirmDelete') : `${tc('delete')} ${plan.name}`}
            className={`h-10 min-w-10 px-2 rounded-lg flex items-center justify-center text-white transition-colors ${
              deleteArmed ? 'bg-[#E52B2B] text-xs font-bold px-3' : 'bg-[#E05252] w-10'
            }`}
          >
            {deleteArmed ? tc('confirmDelete') : <Trash2 size={17} />}
          </button>
        </span>
      </div>
    </div>
  );
}

// Branch Plan tab — Figma provides the segment but no branch cards, so the
// custom branch plans (plus the create card) render in the same language.
function BranchPlans({
  customPlans,
  onCreate,
  onEdit,
  onDelete,
  deleteArmedId,
}: {
  customPlans: CustomPlan[];
  onCreate: () => void;
  onEdit: (plan: CustomPlan) => void;
  onDelete: (plan: CustomPlan) => void;
  deleteArmedId: string | null;
}) {
  const t = useTranslations('sa.subscriptions');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {customPlans.map((plan) => (
        <CustomPlanCard
          key={plan.id}
          plan={plan}
          billingCycle="Monthly"
          deleteArmed={deleteArmedId === plan.id}
          onEdit={() => onEdit(plan)}
          onDelete={() => onDelete(plan)}
        />
      ))}
      <button
        onClick={onCreate}
        className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#026F4F] text-[#989898] hover:text-[#026F4F] flex flex-col items-center justify-center gap-4 min-h-[320px] transition-colors"
      >
        <Plus size={44} strokeWidth={1.5} />
        <span className="text-xl font-medium">{t('createNewPlan')}</span>
      </button>
    </div>
  );
}
