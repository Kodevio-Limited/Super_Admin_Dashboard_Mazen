'use client';

import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import PlanTierPicker from '../PlanTierPicker';
import { FigmaTier } from '../../data/figmaPlans';

interface ManualPlanActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (tier: FigmaTier, expiryDate: string) => void;
  // Branch flow presents this as a right slide-in panel; restaurant flow is centered.
  placement?: 'center' | 'right';
}

// Source of truth: Figma frame "Manual Activation" (1864:870) — expiry date
// plus tier cards without prices.
export default function ManualPlanActivationModal({
  isOpen,
  onClose,
  onActivate,
  placement = 'right',
}: ManualPlanActivationModalProps) {
  const [selectedTier, setSelectedTier] = useState<FigmaTier>('Pro');
  const [expiryDate, setExpiryDate] = useState('');

  if (!isOpen) return null;

  const stacked = placement === 'right';

  const body = (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#2D2F33] text-xl sm:text-2xl">Manual Activation</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-[#2D2F33]">Set Expiration Date for Manual Activation</p>
        <label className="relative">
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="mm/dd/yyyy"
            onFocus={(e) => { e.target.type = 'date'; }}
            className="h-12 w-64 px-5 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30"
          />
          <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#686868] pointer-events-none" />
        </label>
      </div>

      <div className="mt-6">
        <PlanTierPicker
          selectedTier={selectedTier}
          billingCycle="Monthly"
          onSelectTier={setSelectedTier}
          onSelectCycle={() => {}}
          showPrices={false}
          singleColumn={stacked}
        />
      </div>

      <div className="flex flex-col min-[420px]:flex-row items-stretch gap-4 mt-8">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-full bg-[#F2F2F2] hover:bg-gray-200 text-[#2D2F33] font-medium transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => onActivate(selectedTier, expiryDate)}
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
