'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Topbar from '../../../components/Topbar';
import {
  Store, Receipt, UtensilsCrossed, Armchair,
  Clock, TrendingUp, ChevronDown,
} from 'lucide-react';
import SelectableAreaChart from '../../../components/SelectableAreaChart';

const REVENUE_TRENDS = [
  { month: 'Jan', value: 8 },  { month: 'Feb', value: 2.5 },
  { month: 'Mar', value: 4 },  { month: 'Apr', value: 8 },
  { month: 'May', value: 16 }, { month: 'Jun', value: 21 },
  { month: 'Jul', value: 13 }, { month: 'Aug', value: 12 },
  { month: 'Sep', value: 17 },
];

const ONBOARDING_BARS = [
  { day: 'Sat', value: 49.6 }, { day: 'Sun', value: 32.5 },
  { day: 'Mon', value: 62.4 }, { day: 'Tue', value: 83.1 },
  { day: 'Wed', value: 21.5 }, { day: 'Thu', value: 61.3 },
  { day: 'Fri', value: 36.4 },
];

const MONTH_AR: Record<string, string> = {
  Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل', May: 'مايو',
  Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس', Sep: 'سبتمبر',
};

const DAY_AR: Record<string, string> = {
  Sat: 'السبت', Sun: 'الأحد', Mon: 'الاثنين', Tue: 'الثلاثاء',
  Wed: 'الأربعاء', Thu: 'الخميس', Fri: 'الجمعة',
};

const RECENT_UPDATES = [
  { text: 'Burger King', text_ar: 'برجر كنج', time: '2 mins ago', time_ar: 'قبل دقيقتين' },
  { text: 'Burger King', text_ar: 'برجر كنج', time: '2 mins ago', time_ar: 'قبل دقيقتين' },
  { text: 'Burger King', text_ar: 'برجر كنج', time: '2 mins ago', time_ar: 'قبل دقيقتين' },
  { text: 'Burger King', text_ar: 'برجر كنج', time: '2 mins ago', time_ar: 'قبل دقيقتين' },
];

const REVENUE_SNAPSHOT = [
  { key: 'totalRevenueSnap', value: '$15.99' },
  { key: 'mrrSnap',          value: '$15.99' },
  { key: 'failedPayments',   value: '$15.99' },
];

function MonthPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#E9E9E9]/40 rounded-md px-4 py-1.5 text-[#686868] text-base font-satoshi">
      {label}
      <ChevronDown size={16} />
    </span>
  );
}

export default function SuperAdminDashboardPage() {
  const t = useTranslations('sa.dashboard');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const KPI_CARDS = [
    { key: 'totalRestaurants',    value: '250',   delta: t('deltaYesterday', { value: '12.5%' }), icon: Store },
    { key: 'activeSubscriptions', value: '48',    delta: t('deltaLastMonth', { value: '12.5%' }), icon: Receipt },
    {
      key: 'totalRevenue',
      valuePrefix: '$', value: '2,250',
      valuePrefixClass: 'text-[#026F4F]', valueClass: 'text-[#026F4F]',
      delta: t('deltaLastMonth', { value: '12.5%' }), icon: UtensilsCrossed,
    },
    { key: 'activeUsersLive',         value: '342', icon: Armchair },
    { key: 'expiringSubscriptions',   value: '25',  note: t('expiringNote'), icon: Clock },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="relative bg-white rounded-xl p-5 min-h-[169px] flex flex-col justify-center gap-3.5 overflow-hidden">
                <span className="absolute top-[18px] end-5 w-[45px] h-[42px] bg-[#E9E9E9] rounded-md flex items-center justify-center text-[#2D2F33]">
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <p className="font-medium text-[#686868] text-[19px] leading-[1.4] pe-16">{t(card.key as any)}</p>
                <p className={`font-semibold text-[40px] leading-[1.4] ${'valueClass' in card ? card.valueClass : 'text-black'}`}>
                  {'valuePrefix' in card && <span className={'valuePrefixClass' in card ? card.valuePrefixClass : ''}>{card.valuePrefix}</span>}
                  {card.value}
                </p>
                {'delta' in card && card.delta ? (
                  <p className="flex items-center gap-2.5 text-[#158F15] text-base">
                    <TrendingUp size={20} />
                    <span>{card.delta}</span>
                  </p>
                ) : (
                  <p className="text-[#989898] text-base">{'note' in card ? card.note : ''}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-[22px]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-[#2D2F33] text-[33px] leading-[1.4]">{t('revenueTrends')}</h3>
              <MonthPill label={t('monthPill')} />
            </div>
            <div className="h-[273px] w-full mt-4">
              <SelectableAreaChart
                data={REVENUE_TRENDS.map((d) => ({ label: isAr ? (MONTH_AR[d.month] ?? d.month) : d.month, value: d.value }))}
                formatValue={(v) => `$${v}K`}
                yDomain={[0, 30]} yTicks={[0, 10, 20, 30]}
                formatTick={(v) => (v === 0 ? '0' : `${v}K`)}
                gradientId="revTrendFill"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-[22px]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-[#2D2F33] text-[33px] leading-[1.4]">{t('restaurantOnboarding')}</h3>
              <MonthPill label={t('monthPill')} />
            </div>
            <div className="flex gap-2 mt-4 h-[273px]">
              <div className="flex flex-col justify-between text-end text-[#989898] text-xs py-1">
                {['100', '80', '60', '40', '20', '0'].map((tick) => <span key={tick}>{tick}</span>)}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="relative flex-1">
                  <div className="absolute inset-0 flex flex-col justify-between py-1">
                    {Array.from({ length: 6 }).map((_, i) => <span key={i} className="block h-px bg-[#E9E9E9]" />)}
                  </div>
                  <div className="absolute inset-0 flex items-stretch gap-2 px-2">
                    {ONBOARDING_BARS.map((bar) => {
                      const selected = selectedDay === bar.day;
                      const dimmed = selectedDay !== null && !selected;
                      return (
                        <button
                          key={bar.day}
                          type="button"
                          onClick={() => setSelectedDay((prev) => (prev === bar.day ? null : bar.day))}
                          title={`${isAr ? (DAY_AR[bar.day] ?? bar.day) : bar.day}: ${bar.value}`}
                          className={`flex-1 rounded-t-[15px] relative transition-opacity cursor-pointer ${dimmed ? 'opacity-30' : 'opacity-100'} ${selected ? 'bg-[rgba(215,237,214,0.7)]' : 'bg-[rgba(215,237,214,0.4)]'}`}
                        >
                          <span className="absolute bottom-0 start-0 end-0 bg-[#026F4F]/80 rounded-t-[15px] pointer-events-none" style={{ height: `${bar.value}%` }} />
                          {selected && (
                            <span className="absolute start-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#2D2F33] text-white text-xs font-semibold px-2.5 py-1.5 shadow-lg pointer-events-none" style={{ bottom: `calc(${bar.value}% + 10px)` }}>
                              {bar.value}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 px-2 pt-2">
                  {ONBOARDING_BARS.map((bar) => (
                    <span key={bar.day} className="flex-1 text-center text-[#989898] text-xs">{isAr ? (DAY_AR[bar.day] ?? bar.day) : bar.day}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-[33px] leading-[1.4]">{t('recentUpdates')}</h3>
            <div className="mt-4">
              {RECENT_UPDATES.map((row, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between gap-4 py-6">
                    <p className="text-[#989898] text-[19px] leading-[1.4] truncate">
                      {t('newRestaurantAdded', { name: isAr ? row.text_ar : row.text })}
                    </p>
                    <p className="text-[#686868] text-base whitespace-nowrap flex-shrink-0">{isAr ? row.time_ar : row.time}</p>
                  </div>
                  {i < RECENT_UPDATES.length - 1 && <div className="h-px bg-[#E9E9E9]" />}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-[33px] leading-[1.4]">{t('revenueSnapshot')}</h3>
            <div className="mt-12 lg:mt-[69px] space-y-9">
              {REVENUE_SNAPSHOT.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4">
                  <p className="text-[#989898] text-[19px]">{t(row.key as any)}</p>
                  <p className="font-semibold text-[#026F4F] text-[23px]">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
