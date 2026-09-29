'use client';

import React, { useState } from 'react';
import { X, Check, ShieldCheck, Calendar, CreditCard } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Restaurant, SubscriptionPlan } from '../../types/admin';
import { useBodyScrollLock, useEscapeToClose } from '../../lib/useModalShell';
import { locField } from '../../lib/localize';

interface ManualActivationModalProps {
  isOpen: boolean;
  restaurant: Restaurant | null;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onConfirm: (restaurantId: string, planId: string, durationMonths: number, note: string) => void;
}

export default function ManualActivationModal({
  isOpen,
  restaurant,
  plans,
  onClose,
  onConfirm,
}: ManualActivationModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [duration, setDuration] = useState('12');
  const t = useTranslations('sa.planModals');
  const locale = useLocale();
  const [paymentMode, setPaymentMode] = useState(t('paymentDefault'));
  const [note, setNote] = useState(t('noteDefault'));
  const durations = [
    { value: '1', label: t('durations.m1') },
    { value: '3', label: t('durations.m3') },
    { value: '6', label: t('durations.m6') },
    { value: '12', label: t('durations.m12') },
    { value: '24', label: t('durations.m24') },
  ];

  useBodyScrollLock(isOpen);
  useEscapeToClose(isOpen, onClose);

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(restaurant.id, selectedPlanId, parseInt(duration) || 12, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 transition-opacity animate-in fade-in" />
      <div className="fixed inset-y-0 end-0 w-[min(600px,94vw)] bg-white shadow-2xl rounded-s-3xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#026F4F]/10 text-[#026F4F] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#2D2F33]">
                {t('manualPlanTitle')}
              </h3>
              <p className="text-xs text-[#6E727A]">
                {t('manualGrant')} <strong><bdi>{locField(locale, restaurant, 'name')}</bdi></strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#989898]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D2F33] uppercase">{t('targetRestaurant')}</label>
            <input
              type="text"
              disabled
              value={`${locField(locale, restaurant, 'name')} (${restaurant.ownerName})`}
              className="w-full h-12 px-4 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-[#2D2F33]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2D2F33] uppercase">{t('selectPlanTier')}</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {locField(locale, p, 'name')} ({p.type === 'Restaurant' ? t('typeRestaurant') : t('typeBranch')}) - ${p.priceMonthly}{t('perMonthSuffix')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2D2F33] uppercase">{t('activationDuration')}</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
              >
                {durations.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D2F33] uppercase">{t('paymentRef')}</label>
            <input
              type="text"
              required
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              placeholder={t('paymentPlaceholder')}
              className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D2F33] uppercase">{t('auditNotes')}</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-[#686868] hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold shadow-md flex items-center gap-2"
            >
              <span>{t('activatePlan')}</span>
              <Check size={16} />
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
