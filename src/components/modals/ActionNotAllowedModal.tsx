'use client';

import React from 'react';
import { AlertOctagon, X } from 'lucide-react';

interface ActionNotAllowedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelRestaurantPlan?: () => void;
}

export default function ActionNotAllowedModal({
  isOpen,
  onClose,
  onCancelRestaurantPlan,
}: ActionNotAllowedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Modal - 526px x 620px from Figma #1867:1718 */}
      <div className="relative bg-white w-full max-w-[526px] rounded-[22px] p-8 md:p-10 shadow-2xl border border-gray-100 z-10 text-center animate-in zoom-in-95 duration-200">
        {/* Warning graphic */}
        <div className="w-20 h-20 rounded-full bg-red-50 text-[#E52B2B] flex items-center justify-center mx-auto mb-6">
          <AlertOctagon size={44} className="stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-[28px] font-bold text-[#2D2F33] tracking-tight mb-4">
          Action Not Allowed
        </h3>

        {/* Description from Figma */}
        <p className="text-[16px] text-[#989898] leading-relaxed max-w-sm mx-auto mb-8">
          You are attempting to modify plan for this branch, but you currently have an active Restaurant Plan covering all branches.
          <br /><br />
          To manage individual branch plans, you must first cancel your overarching Restaurant Plan.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              if (onCancelRestaurantPlan) onCancelRestaurantPlan();
              onClose();
            }}
            className="w-full h-[59px] rounded-full bg-[#E52B2B] hover:bg-[#c92020] text-white font-semibold text-[17px] shadow-[0px_4px_16px_rgba(229,43,43,0.25)] transition-all cursor-pointer"
          >
            Cancel Restaurant Plan
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[59px] rounded-full bg-[#E9E9E9] hover:bg-gray-300 text-[#2D2F33] font-semibold text-[17px] transition-colors"
          >
            Keep Current Plan
          </button>
        </div>
      </div>
    </div>
  );
}
