'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Clock3, X } from 'lucide-react';
import LeftPanel from '@/components/LeftPanel';
import { planPill } from '@/data/figmaPlans';
import {
  FREE_TRIALS,
  TRIALS_ACTIVE,
  TRIALS_AVG_DAYS_LEFT,
  TRIALS_ENDING_SOON,
} from '@/data/revenueAnalytics';
import { toArDate } from '@/lib/localize';

interface FreeTrialsDrawerProps {
  onClose: () => void;
}

/** Countdown pill: red for the last 3 days, amber for the last week. */
function daysLeftClasses(days: number): string {
  if (days <= 3) return 'bg-red-100 text-red-700';
  if (days <= 7) return 'bg-amber-100 text-amber-700';
  return 'bg-[#D9F5D9] text-[#158F15]';
}

/**
 * "Who is on a free trial" list behind the trials card, sorted by time left.
 * Deep link: /revenue?modal=free-trials.
 */
export default function FreeTrialsDrawer({ onClose }: FreeTrialsDrawerProps) {
  const t = useTranslations('sa.revenue');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const rows = [...FREE_TRIALS].sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <LeftPanel
      onClose={onClose}
      labelledBy={t('growth.trials.drawerTitle')}
      widthClass="w-[min(1040px,94vw)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#2D2F33] text-2xl">{t('growth.trials.drawerTitle')}</h3>
          <p className="text-[#989898] mt-1">
            {t('growth.trials.drawerSubtitle', {
              count: TRIALS_ACTIVE,
              soon: TRIALS_ENDING_SOON.length,
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

      <div className="mt-5 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-[#F8F9FA] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#989898]">
            {t('growth.trials.active')}
          </p>
          <p className="mt-1 text-xl font-semibold text-[#026F4F]" dir="ltr">
            <bdi>{TRIALS_ACTIVE}</bdi>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-[#F8F9FA] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#989898]">
            {t('growth.trials.endingSoon')}
          </p>
          <p className="mt-1 text-xl font-semibold text-[#E52B2B]" dir="ltr">
            <bdi>{TRIALS_ENDING_SOON.length}</bdi>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-[#F8F9FA] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#989898]">
            {t('growth.trials.avgDaysLeft')}
          </p>
          <p className="mt-1 text-xl font-semibold text-[#2D2F33]" dir="ltr">
            <bdi>{TRIALS_AVG_DAYS_LEFT.toFixed(1)}</bdi>
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-start border-collapse min-w-[900px] table-fixed">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[13%]" />
            <col className="w-[14%]" />
            <col className="w-[11%]" />
            <col className="w-[16%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
              <th className="py-3 px-4 text-start rounded-s-lg">{t('growth.trials.columns.restaurant')}</th>
              <th className="py-3 px-4 text-center">{t('growth.trials.columns.plan')}</th>
              <th className="py-3 px-4 text-center">{t('growth.trials.columns.started')}</th>
              <th className="py-3 px-4 text-center">{t('growth.trials.columns.branches')}</th>
              <th className="py-3 px-4 text-center">{t('growth.trials.columns.timeLeft')}</th>
              <th className="py-3 px-4 text-start rounded-e-lg">{t('growth.trials.columns.activity')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {rows.map((row) => {
              const pill = planPill(row.plan, locale);
              const urgent = row.daysLeft <= 7;
              return (
                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-4">
                    <span className="block font-semibold text-[#2D2F33] truncate">
                      {isAr ? (row.restaurant_ar ?? row.restaurant) : row.restaurant}
                    </span>
                    <span className="block text-xs text-[#989898] truncate">
                      {isAr ? (row.ownerName_ar ?? row.ownerName) : row.ownerName}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-full ${pill.classes}`}>
                      {pill.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-[#686868] whitespace-nowrap">
                    {isAr ? (row.startedOn_ar ?? toArDate(row.startedOn)) : row.startedOn}
                  </td>
                  <td className="py-4 px-4 text-center text-[#686868]" dir="ltr">
                    <bdi>{row.branches}</bdi>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${daysLeftClasses(row.daysLeft)}`}
                    >
                      <Clock3 size={12} />
                      {row.daysLeft === 0
                        ? t('growth.trials.lastDay')
                        : t('growth.trials.daysLeft', { count: row.daysLeft })}
                    </span>
                    {urgent && (
                      <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-[#E52B2B]">
                        {t('growth.trials.urgent')}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-[#686868]">
                    <span className="block truncate">
                      {isAr ? (row.lastActive_ar ?? row.lastActive) : row.lastActive}
                    </span>
                    <span className="block truncate text-xs text-[#989898]">
                      <bdi dir="ltr">{row.ownerEmail}</bdi>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-gray-200 bg-[#F8F9FA] p-4">
        <Clock3 size={18} className="mt-0.5 shrink-0 text-[#026F4F]" />
        <p className="text-sm leading-relaxed text-[#686868]">{t('growth.trials.note')}</p>
      </div>
    </LeftPanel>
  );
}
