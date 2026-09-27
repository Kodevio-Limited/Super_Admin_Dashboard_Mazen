'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import PlanTierPicker from '../PlanTierPicker';
import { FigmaTier, FigmaBillingCycle, cycleTotal, FIGMA_TIERS } from '../../data/figmaPlans';

interface ModifyPlanModalProps {
  isOpen: boolean;
  currentTier?: FigmaTier;
  onClose: () => void;
  onActivate: (tier: FigmaTier, billing: FigmaBillingCycle, price: number) => void;
  // Branch flow presents this as a right slide-in panel; restaurant flow is centered.
  placement?: 'center' | 'right';
}

// Source of truth: Figma frames "Modify Plan" (1692:72598, also 1867:1403).
export default function ModifyPlanModal({
  isOpen,
  currentTier = 'Pro',
  onClose,
  onActivate,
  placement = 'right',
}: ModifyPlanModalProps) {
  const [selectedTier, setSelectedTier] = useState<FigmaTier>(currentTier);
  const [billingCycle, setBillingCycle] = useState<FigmaBillingCycle>('Yearly');

  if (!isOpen) return null;

  const monthly = FIGMA_TIERS.find((t) => t.tier === selectedTier)!.monthlyPrice;
  const stacked = placement === 'right';

  const body = (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#2D2F33] text-xl sm:text-2xl">Modify Plan</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-6">
        <PlanTierPicker
          selectedTier={selectedTier}
          billingCycle={billingCycle}
          onSelectTier={setSelectedTier}
          onSelectCycle={setBillingCycle}
          singleColumn={stacked}
        />
      </div>

      <div className={`flex ${stacked ? 'flex-col' : 'flex-col sm:flex-row'} items-stretch sm:items-center gap-4 mt-8`}>
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-full bg-[#F2F2F2] hover:bg-gray-200 text-[#2D2F33] font-medium transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => onActivate(selectedTier, billingCycle, cycleTotal(monthly, billingCycle))}
          className="flex-1 py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all"
        >
          Activate Now
        </button>
      </div>
    </>
  );

  if (placement === 'right') {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div onClick={onClose} className="absolute inset-0 bg-black/50 transition-opacity animate-in fade-in" />
        <div className="fixed inset-y-0 right-0 w-[min(560px,94vw)] bg-white shadow-2xl rounded-l-3xl overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-right duration-300">
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        {body}
      </div>
    </div>
  );
}
