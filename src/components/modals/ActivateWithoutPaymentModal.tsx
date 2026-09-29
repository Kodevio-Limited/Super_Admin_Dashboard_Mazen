'use client';

import React, { useState } from 'react';
import { X, Check, Gift, Calendar, AlertCircle } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Restaurant } from '../../types/admin';
import { locField } from '../../lib/localize';

const REASONS = [
  { en: 'Promotional / Partner Onboarding Trial', ar: 'تجربة ترويجية / تأهيل شريك' },
  { en: 'VIP Franchise Beta Tester', ar: 'مختبِر تجريبي لامتياز VIP' },
  { en: 'Executive Comp Access', ar: 'وصول مجاني تنفيذي' },
  { en: 'Payment Dispute / Grace Period', ar: 'نزاع دفع / فترة سماح' },
];

interface ActivateWithoutPaymentModalProps {
  isOpen: boolean;
  restaurant: Restaurant | null;
  onClose: () => void;
  onConfirm: (restaurantId: string, expiryDate: string, reason: string) => void;
}

export default function ActivateWithoutPaymentModal({
  isOpen,
  restaurant,
  onClose,
  onConfirm,
}: ActivateWithoutPaymentModalProps) {
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [reason, setReason] = useState('Promotional / Partner Onboarding Trial');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reasonLabel = (en: string) => {
    const f = REASONS.find((r) => r.en === en);
    return isAr && f ? f.ar : en;
  };

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(restaurant.id, expiryDate, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Modal - 1119px x 721px from Figma #1867:1492 */}
      <div className="relative bg-white w-full max-w-xl rounded-[21px] p-8 md:p-10 shadow-2xl border border-gray-100 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#158F15]/10 text-[#158F15] flex items-center justify-center">
              <Gift size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#2D2F33]">
                {isAr ? 'تفعيل بدون دفع' : 'Activate Without Payment'}
              </h3>
              <p className="text-xs text-[#6E727A]">
                {isAr ? 'منح تجربة مجانية أو وصول ترويجي بدون تكلفة' : 'Grant zero-cost complimentary trial or promotional access'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#989898]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <strong>{isAr ? 'تجاوز المشرف:' : 'Admin Override:'}</strong>{' '}{isAr ? 'سيؤدي هذا إلى تجاوز الفوترة التلقائية وتوفير كامل الميزات لـ' : 'This will bypass automated billing and provision full SaaS features for'}{' '}<strong><bdi>{locField(locale, restaurant, 'name')}</bdi></strong>{' '}{isAr ? 'حتى تاريخ الانتهاء المحدد.' : 'until the selected expiry date.'}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D2F33] uppercase">{isAr ? 'تاريخ انتهاء الوصول *' : 'Access Expiration Date *'}</label>
            <div className="relative flex items-center">
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D2F33] uppercase">{isAr ? 'السبب / المبرر *' : 'Reason / Justification *'}</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
            >
              {REASONS.map((r) => (
                <option key={r.en} value={r.en}>{reasonLabel(r.en)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-[#686868] hover:bg-gray-50"
            >
{isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full bg-[#158F15] hover:bg-[#127a12] text-white text-sm font-semibold shadow-md flex items-center gap-2"
            >
              <span>{isAr ? 'منح وصول مجاني' : 'Grant Complimentary Access'}</span>
              <Check size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
