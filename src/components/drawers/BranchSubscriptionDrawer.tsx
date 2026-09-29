'use client';

import React from 'react';
import { X, CreditCard, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Branch } from '../../types/admin';
import { locField } from '@/lib/localize';
import { tierBlurb } from '../../data/figmaPlans';

interface BranchSubscriptionDrawerProps {
  isOpen: boolean;
  branch: Branch | null;
  restaurantName: string;
  onClose: () => void;
  onModifyPlanClick?: () => void;
}

export default function BranchSubscriptionDrawer({
  isOpen,
  branch,
  restaurantName,
  onClose,
  onModifyPlanClick,
}: BranchSubscriptionDrawerProps) {
  const t = useTranslations('sa.restaurantModal');
  const locale = useLocale();
  const isAr = locale === 'ar';
  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" />

      <div className="fixed inset-y-0 end-0 max-w-full flex">
        {/* Drawer - 619px from Figma #1867:1191 */}
        <div className="w-screen max-w-[619px] bg-[#F2F2F2] shadow-2xl rounded-s-[24px] flex flex-col justify-between p-8 md:p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-[28px] font-bold text-[#2D2F33]">
                  {isAr ? 'اشتراك الفرع' : 'Branch Subscription'}
                </h2>
                <p className="text-xs text-[#6E727A] mt-0.5">{locField(locale, branch, 'name')} • {restaurantName}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-[#686868]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Active Tier Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#026F4F] bg-green-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  {isAr ? 'المستوى النشط' : 'Active Tier'}
                </span>
                <span className="text-xs text-[#989898]">{isAr ? 'ينتهي: ' : 'Expires: '}{locField(locale, branch, 'planExpiry')}</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#2D2F33]">
                  {locField(locale, branch, 'planName')}
                </h3>
                <p className="text-sm text-[#6E727A] mt-1">
                  {tierBlurb(locField(locale, branch, 'planName') || branch.planName, locale)}
                </p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-[#686868]">{isAr ? 'الرسوم الشهرية المخصصة:' : 'Monthly Fee Allocated:'}</span>
                  <span className="font-bold text-[#2D2F33]"><bdi dir="ltr">${branch.monthlyFee}{isAr ? '/شهر' : '/mo'}</bdi></span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-[#686868]">{isAr ? 'نقاط البيع:' : 'POS Terminals:'}</span>
                  <span className="font-bold text-[#026F4F]">{isAr ? 'غير محدود' : 'Unlimited'}</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-[#686868]">{isAr ? 'محطات شاشة المطبخ:' : 'KDS Stations:'}</span>
                  <span className="font-bold text-[#026F4F]">{isAr ? 'مفعّلة' : 'Enabled'}</span>
                </div>
              </div>
            </div>

            {/* Note & Actions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                {isAr ? 'للترقية أو الإلغاء أو تعديل مستويات ترخيص الفرع فرديًا، تحقق مما إذا كان المطعم يستخدم خطة موحدة أو خطط فروع مستقلة.' : 'To upgrade, cancel, or modify branch license tiers individually, verify whether the restaurant uses a unified plan or standalone branch plans.'}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (onModifyPlanClick) onModifyPlanClick();
              }}
              className="flex-1 h-14 bg-[#026F4F] hover:bg-[#01533B] text-white font-semibold text-base rounded-full shadow-lg transition-all"
            >
{t('modifyPlan')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
