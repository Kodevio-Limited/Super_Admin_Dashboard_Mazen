'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { UserMinus, X } from 'lucide-react';
import LeftPanel from '@/components/LeftPanel';
import { planPill } from '@/data/figmaPlans';
import { CHURNED_CUSTOMERS, CHURNED_MRR, CHURN_RATE } from '@/data/revenueAnalytics';
import { toArDate } from '@/lib/localize';

interface ChurnedCustomersDrawerProps {
  onClose: () => void;
}

/**
 * "Who churned" list behind the churn KPI — every account lost in the last
 * 12 months with the MRR it took with it.
 * Deep link: /revenue?modal=churned-customers.
 */
export default function ChurnedCustomersDrawer({ onClose }: ChurnedCustomersDrawerProps) {
  const t = useTranslations('sa.revenue');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const totalMrr = `EGP ${CHURNED_MRR.toLocaleString('en-US')}`;
  const pctLabel = `${(CHURN_RATE * 100).toFixed(1)}%`;

  return (
    <LeftPanel
      onClose={onClose}
      labelledBy={t('growth.churnDrawer.title')}
      widthClass="w-[min(1000px,94vw)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#2D2F33] text-2xl">{t('growth.churnDrawer.title')}</h3>
          <p className="text-[#989898] mt-1">
            {t('growth.churnDrawer.subtitle', {
              count: CHURNED_CUSTOMERS.length,
              mrr: totalMrr,
              rate: pctLabel,
            })}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label={t('growth.close')}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 bg-[#F8F9FA] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#989898]">
            {t('growth.rows.logoChurn')}
          </p>
          <p className="mt-1 text-xl font-semibold text-[#E52B2B]" dir="ltr">
            <bdi>{pctLabel}</bdi>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-[#F8F9FA] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#989898]">
            {t('growth.rows.revenueChurn')}
          </p>
          <p className="mt-1 text-xl font-semibold text-[#2D2F33]" dir="ltr">
            <bdi>{totalMrr}</bdi>
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-start border-collapse min-w-[860px] table-fixed">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[13%]" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[22%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
              <th className="py-3 px-4 text-start rounded-s-lg">{t('growth.churnDrawer.columns.restaurant')}</th>
              <th className="py-3 px-4 text-center">{t('growth.churnDrawer.columns.plan')}</th>
              <th className="py-3 px-4 text-center">{t('growth.churnDrawer.columns.churnedOn')}</th>
              <th className="py-3 px-4 text-center">{t('growth.churnDrawer.columns.tenure')}</th>
              <th className="py-3 px-4 text-center">{t('growth.churnDrawer.columns.mrr')}</th>
              <th className="py-3 px-4 text-start rounded-e-lg">{t('growth.churnDrawer.columns.reason')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {CHURNED_CUSTOMERS.map((row) => {
              const pill = planPill(row.plan, locale);
              return (
                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-4">
                    <span className="block font-semibold text-[#2D2F33] truncate">
                      {isAr ? (row.restaurant_ar ?? row.restaurant) : row.restaurant}
                    </span>
                    <span className="block truncate text-xs text-[#989898]">
                      <bdi dir="ltr">{row.ownerEmail}</bdi>
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-full ${pill.classes}`}>
                      {pill.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-[#686868] whitespace-nowrap">
                    {isAr ? (row.churnedOn_ar ?? toArDate(row.churnedOn)) : row.churnedOn}
                  </td>
                  <td className="py-4 px-4 text-center text-[#686868]">
                    {t('growth.churnDrawer.tenureMonths', { count: row.tenureMonths })}
                  </td>
                  <td className="py-4 px-4 text-center font-semibold text-[#E52B2B]" dir="ltr">
                    <bdi>{`EGP ${row.mrrLost}`}</bdi>
                  </td>
                  <td className="py-4 px-4 text-[#686868]">
                    {t(`growth.churnDrawer.reasons.${row.reason}`)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#F8F9FA] text-sm font-semibold text-[#2D2F33]">
              <td className="py-4 px-4 rounded-s-lg" colSpan={4}>
                {t('growth.churnDrawer.total')}
              </td>
              <td className="py-4 px-4 text-center text-[#E52B2B]" dir="ltr">
                <bdi>{totalMrr}</bdi>
              </td>
              <td className="py-4 px-4 rounded-e-lg" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
        <UserMinus size={18} className="mt-0.5 shrink-0 text-[#E52B2B]" />
        <p className="text-sm leading-relaxed text-red-800">{t('growth.churnDrawer.note')}</p>
      </div>
    </LeftPanel>
  );
}
