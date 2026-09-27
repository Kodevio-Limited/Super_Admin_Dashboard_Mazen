'use client';

import React from 'react';
import { Check } from 'lucide-react';
import {
  FIGMA_TIERS,
  FIGMA_CYCLES,
  FigmaTier,
  FigmaBillingCycle,
  effectiveMonthly,
  cycleTotal,
  formatMonthly,
} from '../data/figmaPlans';

interface PlanTierPickerProps {
  selectedTier: FigmaTier;
  billingCycle: FigmaBillingCycle;
  onSelectTier: (tier: FigmaTier) => void;
  onSelectCycle: (cycle: FigmaBillingCycle) => void;
  showPrices?: boolean;
  // Stacked single column for narrow left slide-in panels.
  singleColumn?: boolean;
}

// Shared plan picker matching Figma frames 1859:336 (Create),
// 1692:72598 (Modify Plan) and 1864:870 (Manual Activation — no prices).
export default function PlanTierPicker({
  selectedTier,
  billingCycle,
  onSelectTier,
  onSelectCycle,
  showPrices = true,
  singleColumn = false,
}: PlanTierPickerProps) {
  const activeBilling = FIGMA_CYCLES.find((b) => b.cycle === billingCycle)!;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex flex-wrap items-center bg-[#F2F2F2] p-1.5 rounded-full text-sm font-medium">
          {FIGMA_CYCLES.map((b) => (
            <button
              key={b.cycle}
              type="button"
              onClick={() => onSelectCycle(b.cycle)}
              className={`px-4 sm:px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 ${
                billingCycle === b.cycle
                  ? 'bg-white shadow font-semibold text-[#2D2F33]'
                  : 'text-[#686868] hover:text-[#2D2F33]'
              }`}
            >
              <span>{b.label}</span>
              {b.saveLabel && (
                <span className="text-[#158F15] font-medium">{b.saveLabel}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${singleColumn ? '' : 'md:grid-cols-3'} gap-4 pt-4`}>
        {FIGMA_TIERS.map((plan) => {
          const isSelected = selectedTier === plan.tier;
          const monthly = effectiveMonthly(plan.monthlyPrice, billingCycle);

          return (
            <div
              key={plan.tier}
              onClick={() => onSelectTier(plan.tier)}
              className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col bg-white ${
                isSelected
                  ? 'border-[#026F4F] shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#026F4F] text-white text-[11px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  Popular
                </span>
              )}
              {isSelected && (
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#026F4F] text-white flex items-center justify-center shadow">
                  <Check size={14} />
                </span>
              )}
              <h4 className="font-bold text-[#2D2F33] text-lg">{plan.tier}</h4>
              {showPrices && (
                <div className="text-[32px] leading-tight font-bold text-[#2D2F33] mt-1">
                  {formatMonthly(monthly)}
                  <span className="text-sm text-[#989898] font-normal"> /mo</span>
                </div>
              )}
              <span
                className={`inline-flex w-fit ${showPrices ? 'mt-2' : 'mt-3'} text-xs font-medium text-[#026F4F] bg-[#026F4F]/10 px-2.5 py-1 rounded-full`}
              >
                {plan.branchLimit}
              </span>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#2D2F33]">
                    <Check size={15} className="text-[#158F15] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {showPrices && activeBilling.months > 1 && (
                <p className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-[#6E727A]">
                  Billed ${cycleTotal(plan.monthlyPrice, billingCycle).toLocaleString()} per{' '}
                  {activeBilling.label.toLowerCase()} cycle
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
