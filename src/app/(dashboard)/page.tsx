'use client';

import React from 'react';
import Topbar from '../../components/Topbar';
import {
  Store,
  Receipt,
  UtensilsCrossed,
  Armchair,
  Clock,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Source of truth: Figma frame "Dashboard" (1224:1934).
// Labels, values, order, and visual treatment below mirror that frame.
// Figma gives static display values (no data sources), so figures are kept
// exactly as designed — see the data-source flags at the bottom of the report.

// --- KPI cards (Figma row, left → right) ---
const KPI_CARDS = [
  {
    label: 'Total Restaurants',
    value: '250',
    delta: '12.5% from yesterday',
    icon: Store,
  },
  {
    label: 'Active Subscriptions',
    value: '48',
    delta: '12.5% from last month',
    icon: Receipt,
  },
  {
    label: 'Monthly Revenue',
    valuePrefix: '$',
    value: '2,250',
    // Figma renders the whole "$2,250" in brand green (see frame screenshot)
    valuePrefixClass: 'text-[#026F4F]',
    valueClass: 'text-[#026F4F]',
    delta: '12.5% from last month',
    icon: UtensilsCrossed,
  },
  {
    label: 'Active Users (Live)',
    value: '342',
    icon: Armchair,
  },
  {
    label: 'Expiring Subscriptions',
    value: '25',
    note: 'Expiring in next 7 days',
    icon: Clock,
  },
];

// --- Revenue Trends (Figma: smooth line, y 0–30K) ---
// The design is a static SVG path with no data table; points below trace its
// visible trajectory. Last two x-slots are literal "Text" placeholders in
// Figma — rendered as Aug / Sep (flagged for confirmation).
const REVENUE_TRENDS = [
  { month: 'Jan', value: 8 },
  { month: 'Feb', value: 2.5 },
  { month: 'Mar', value: 4 },
  { month: 'Apr', value: 8 },
  { month: 'May', value: 16 },
  { month: 'Jun', value: 21 },
  { month: 'Jul', value: 13 },
  { month: 'Aug', value: 12 },
  { month: 'Sep', value: 17 },
];

// --- Restaurant Onboarding (Figma: exact bar heights on a 0–100 axis) ---
const ONBOARDING_BARS = [
  { day: 'Sat', value: 49.6 },
  { day: 'Sun', value: 32.5 },
  { day: 'Mon', value: 62.4 },
  { day: 'Tue', value: 83.1 },
  { day: 'Wed', value: 21.5 },
  { day: 'Thu', value: 61.3 },
  { day: 'Fri', value: 36.4 },
];

// --- Recent Updates (Figma: 4 identical rows) ---
const RECENT_UPDATES = [
  { text: 'Burger King', time: '2 mins ago' },
  { text: 'Burger King', time: '2 mins ago' },
  { text: 'Burger King', time: '2 mins ago' },
  { text: 'Burger King', time: '2 mins ago' },
];

// --- Revenue Snapshot (Figma: identical $15.99 placeholders) ---
const REVENUE_SNAPSHOT = [
  { label: 'Total Revenue', value: '$15.99' },
  { label: 'MRR', value: '$15.99' },
  { label: 'Failed Payments', value: '$15.99' },
];

function MonthPill() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#E9E9E9]/40 rounded-md px-4 py-1.5 text-[#686868] text-base font-satoshi">
      Month
      <ChevronDown size={16} />
    </span>
  );
}

export default function SuperAdminDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Super Admin Dashboard"
        subtitle="Global platform overview, revenue intelligence, and multi-chain status"
      />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        {/* KPI row — 5 cards per Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="relative bg-white rounded-xl p-5 min-h-[169px] flex flex-col justify-center gap-3.5 overflow-hidden"
              >
                <span className="absolute top-[18px] right-5 w-[45px] h-[42px] bg-[#E9E9E9] rounded-md flex items-center justify-center text-[#2D2F33]">
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <p className="font-medium text-[#686868] text-[19px] leading-[1.4] pr-16">
                  {card.label}
                </p>
                <p className={`font-semibold text-[40px] leading-[1.4] ${card.valueClass ?? 'text-black'}`}>
                  {card.valuePrefix && (
                    <span className={card.valuePrefixClass}>{card.valuePrefix}</span>
                  )}
                  {card.value}
                </p>
                {card.delta ? (
                  <p className="flex items-center gap-2.5 text-[#158F15] text-base">
                    <TrendingUp size={20} />
                    <span>{card.delta}</span>
                  </p>
                ) : (
                  <p className="text-[#989898] text-base">{card.note}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Charts row — Revenue Trends + Restaurant Onboarding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trends */}
          <div className="bg-white rounded-xl p-[22px]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-[#2D2F33] text-[33px] leading-[1.4]">
                Revenue Trends
              </h3>
              <MonthPill />
            </div>
            <div className="h-[273px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TRENDS} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#026F4F" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#026F4F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E9E9E9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#E9E9E9' }}
                  />
                  <YAxis
                    domain={[0, 30]}
                    ticks={[0, 10, 20, 30]}
                    tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val: number) => (val === 0 ? '0' : `${val}K`)}
                  />
                  <Tooltip
                    formatter={(val: number) => [`$${val}K`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#026F4F"
                    strokeWidth={2.5}
                    fill="url(#revTrendFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#026F4F' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Restaurant Onboarding */}
          <div className="bg-white rounded-xl p-[22px]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-[#2D2F33] text-[33px] leading-[1.4]">
                Restaurant Onboarding
              </h3>
              <MonthPill />
            </div>
            <div className="flex gap-2 mt-4 h-[273px]">
              <div className="flex flex-col justify-between text-right text-[#989898] text-xs py-1">
                {['100', '80', '60', '40', '20', '0'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="relative flex-1">
                  <div className="absolute inset-0 flex flex-col justify-between py-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="block h-px bg-[#E9E9E9]" />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-stretch gap-2 px-2">
                    {ONBOARDING_BARS.map((bar) => (
                      <div
                        key={bar.day}
                        className="flex-1 bg-[rgba(215,237,214,0.4)] rounded-t-[15px] relative"
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-[#026F4F]/80 rounded-t-[15px]"
                          style={{ height: `${bar.value}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 px-2 pt-2">
                  {ONBOARDING_BARS.map((bar) => (
                    <span key={bar.day} className="flex-1 text-center text-[#989898] text-xs">
                      {bar.day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row — Recent Updates + Revenue Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Updates */}
          <div className="lg:col-span-3 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-[33px] leading-[1.4]">
              Recent Updates
            </h3>
            <div className="mt-4">
              {RECENT_UPDATES.map((row, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between gap-4 py-6">
                    <p className="text-[#989898] text-[19px] leading-[1.4] truncate">
                      New restaurant{' '}
                      <span className="font-medium text-[#2D2F33]">{row.text}</span>{' '}
                      added to platform
                    </p>
                    <p className="text-[#686868] text-base whitespace-nowrap flex-shrink-0">
                      {row.time}
                    </p>
                  </div>
                  {i < RECENT_UPDATES.length - 1 && (
                    <div className="h-px bg-[#E9E9E9]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Snapshot */}
          <div className="lg:col-span-2 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-[33px] leading-[1.4]">
              Revenue Snapshot
            </h3>
            {/* Figma: rows start 137px below card top → ~69px under the title */}
            <div className="mt-12 lg:mt-[69px] space-y-9">
              {REVENUE_SNAPSHOT.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <p className="text-[#989898] text-[19px]">{row.label}</p>
                  <p className="font-semibold text-[#026F4F] text-[23px]">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
