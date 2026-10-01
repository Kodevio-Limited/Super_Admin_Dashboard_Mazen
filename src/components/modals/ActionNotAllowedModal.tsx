'use client';

import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBodyScrollLock, useEscapeToClose } from '../../lib/useModalShell';

export type BlockedBranchAction = 'modify' | 'cancelRenewal' | 'logPayment' | 'activate';

interface ActionNotAllowedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelRestaurantPlan?: () => void;
  // Excludes just this branch from the restaurant plan (Bug-50). Hidden when absent.
  onExcludeBranch?: () => void;
  // Which branch action was blocked — customizes the description text.
  action?: BlockedBranchAction;
  // Figma flow presents this as a right slide-in panel; other pages keep center.
  placement?: 'center' | 'right';
}

export default function ActionNotAllowedModal({
  isOpen,
  onClose,
  onCancelRestaurantPlan,
  onExcludeBranch,
  action = 'modify',
  placement = 'right',
}: ActionNotAllowedModalProps) {
  useBodyScrollLock(isOpen);
  useEscapeToClose(isOpen, onClose);
  const t = useTranslations('sa.planModals');

  if (!isOpen) return null;

  const descKey =
    action === 'cancelRenewal'
      ? 'notAllowedDescCancel'
      : action === 'logPayment'
        ? 'notAllowedDescLogPayment'
        : action === 'activate'
          ? 'notAllowedDescActivate'
          : 'notAllowedDesc';

  const handleCancelPlan = () => {
    if (onCancelRestaurantPlan) onCancelRestaurantPlan();
    onClose();
  };

  const handleExcludeBranch = () => {
    if (onExcludeBranch) onExcludeBranch();
    onClose();
  };

  const body = (
    <>
      {/* Warning graphic (Figma 1867:1718 — yellow triangle, red mark) */}
      <div className="relative w-28 h-24 mx-auto mb-6">
        <div
          className="absolute inset-0 bg-[#FFD60A]"
          style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
        />
        <TriangleAlert
          size={44}
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 text-[#E52B2B]"
          strokeWidth={2.4}
        />
      </div>

      <h3 className="text-[28px] font-bold text-[#2D2F33] tracking-tight mb-4">
        {t('notAllowedTitle')}
      </h3>

      <p className="text-[16px] text-[#989898] leading-relaxed max-w-sm mx-auto mb-8 whitespace-pre-line">
        {t(descKey)}
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleCancelPlan}
          className="w-full h-[59px] rounded-full bg-[#E52B2B] hover:bg-[#c92020] text-white font-semibold text-[17px] shadow-[0px_4px_16px_rgba(229,43,43,0.25)] transition-all cursor-pointer"
        >
          {t('cancelRestaurantPlan')}
        </button>
        {onExcludeBranch && (
          <button
            type="button"
            onClick={handleExcludeBranch}
            className="w-full h-[59px] rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-semibold text-[17px] shadow-[0px_4px_16px_rgba(2,111,79,0.25)] transition-all cursor-pointer"
          >
            {t('excludeBranchOnly')}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-[59px] rounded-full bg-[#E9E9E9] hover:bg-gray-300 text-[#2D2F33] font-semibold text-[17px] transition-colors"
        >
          {t('keepCurrentPlan')}
        </button>
      </div>
    </>
  );

  if (placement === 'right') {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div onClick={onClose} className="absolute inset-0 bg-black/50 transition-opacity animate-in fade-in" />
        <div className="fixed inset-y-0 end-0 w-[min(480px,94vw)] bg-white shadow-2xl rounded-s-3xl overflow-y-auto p-8 text-center animate-in slide-in-from-right duration-300">
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Modal - 526px x 620px from Figma #1867:1718 */}
      <div className="relative bg-white w-full max-w-[526px] rounded-[22px] p-8 md:p-10 shadow-2xl border border-gray-100 z-10 text-center animate-in zoom-in-95 duration-200">
        {body}
      </div>
    </div>
  );
}
