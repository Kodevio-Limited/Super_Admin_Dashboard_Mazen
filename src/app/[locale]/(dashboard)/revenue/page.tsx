'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Store,
  Receipt,
  UtensilsCrossed,
  Armchair,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ListFilter,
  Plus,
  Download,
  X,
} from 'lucide-react';
import SelectableAreaChart from '@/components/SelectableAreaChart';
import Topbar from '@/components/Topbar';
import LeftPanel from '@/components/LeftPanel';
import ExportLedgerModal from '@/components/modals/ExportLedgerModal';
import LogEntryModal, { LedgerEntry } from '@/components/modals/LogEntryModal';
import { mockLedger } from '@/data/mockData';
import { getRestaurants } from '@/data/restaurantStore';
import { planPill } from '@/data/figmaPlans';
import { locField } from '@/lib/localize';
import { useQueryModal } from '@/lib/use-query-modal';
import { TransactionLedger } from '@/types/admin';

// Source of truth: Figma frame "Revenue & Reports" (1939:1060).
// KPI figures, chart shapes, report rows, performers and snapshot values are
// static display values from the design (flagged in the report); the Invoices
// table runs on the app ledger so entries can be added and exported.

// --- KPI cards (values translated via keys; icons per Figma) ---
const KPI_CARDS = [
  { key: 'totalRevenue', value: '$1,250', valueClass: 'text-[#026F4F]', subKey: 'deltaYesterday', subValues: { value: '12.5%' }, subClass: 'text-[#158F15]', icon: Store, delta: true },
  { key: 'activeRestaurants', value: '155', subKey: 'deltaThisMonth', subValues: { value: '12' }, subClass: 'text-[#989898]', icon: Receipt },
  { key: 'totalOrders', value: '432', subKey: 'deltaThisMonth', subValues: { value: '12' }, subClass: 'text-[#989898]', icon: UtensilsCrossed },
  { key: 'paidAccounts', value: '142', subKey: 'percentOfTotal', subValues: { value: '91%' }, subClass: 'text-[#989898]', icon: Armchair },
  { key: 'delayedPayments', value: '13', subKey: 'actionRequired', subClass: 'text-[#E52B2B]', icon: Clock, viewModal: 'delayed-payments' },
] as const;

// "Who is delayed" modal (?modal=delayed-payments). Renders the overdue list.
// TODO(api): GET /billing/delayed.
function DelayedPaymentsModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations('sa.revenue');
  return (
    <LeftPanel onClose={onClose} labelledBy="Delayed Payments" widthClass="w-[min(860px,94vw)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#2D2F33] text-2xl">{t('delayedPayments')}</h3>
          <p className="text-[#989898] mt-1">13 {t('actionRequired')} — who is delayed</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors shrink-0"
        >
          <X size={20} />
        </button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-start border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
              <th className="whitespace-nowrap py-3 px-4 text-start rounded-s-lg">{t('columns.restaurant')}</th>
              <th className="whitespace-nowrap py-3 px-4 text-start">{t('columns.planTier')}</th>
              <th className="whitespace-nowrap py-3 px-4 text-start">{t('columns.revenue')}</th>
              <th className="whitespace-nowrap py-3 px-4 text-start">Overdue</th>
              <th className="whitespace-nowrap py-3 px-4 rounded-e-lg">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {DELAYED_ROWS.map((row, i) => (
              <tr key={i}>
                <td className="whitespace-nowrap py-4 px-4 font-semibold text-[#2D2F33]">{row.restaurant}</td>
                <td className="whitespace-nowrap py-4 px-4 text-[#686868]">{row.plan}</td>
                <td className="whitespace-nowrap py-4 px-4 font-semibold text-[#E52B2B]"><bdi dir="ltr">{row.amount}</bdi></td>
                <td className="whitespace-nowrap py-4 px-4">
                  <span className="inline-block rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">{row.overdue}</span>
                </td>
                <td className="whitespace-nowrap py-4 px-4 text-[#686868]"><bdi dir="ltr">{row.contact}</bdi></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LeftPanel>
  );
}

// --- Delayed payments list (Bug-20). TODO(api): GET /billing/delayed.
// Mock rows shaped like the ledger; count matches the KPI (13 total,
// showing the most overdue first).
const DELAYED_ROWS = [
  { restaurant: 'Casa Mia Italian', plan: 'Custom Plan', amount: '$299.00', overdue: '21 days', contact: 'marcus@casamiapizza.com' },
  { restaurant: 'Bistro Belle', plan: 'Basic Plan', amount: '$19.00', overdue: '18 days', contact: 'chloe@bistrobelle.com' },
  { restaurant: "L'Étoile Grill", plan: 'Pro Plan', amount: '$63.00', overdue: '15 days', contact: 'tariq@grilletoile.com' },
  { restaurant: 'The Shamrock Pub', plan: 'Pro Plan', amount: '$63.00', overdue: '12 days', contact: 'liam@dublinpub.com' },
  { restaurant: 'Tokyo Ramen House', plan: 'Enterprise Plan', amount: '$191.00', overdue: '9 days', contact: 'alexander@tokyodining.com' },
  { restaurant: 'Burger Haven', plan: 'Basic Plan', amount: '$19.00', overdue: '6 days', contact: 'omar@burgerhaven.com' },
];

// --- Revenue Over Time (traced from the Figma SVG; x slots 8-9 are literal
// "Text" placeholders in the design, rendered here as Aug / Sep) ---
const REVENUE_OVER_TIME = [
  { month: 'Jan', value: 7 },
  { month: 'Feb', value: 3 },
  { month: 'Mar', value: 4.5 },
  { month: 'Apr', value: 9 },
  { month: 'May', value: 17 },
  { month: 'Jun', value: 21 },
  { month: 'Jul', value: 14 },
  { month: 'Aug', value: 16 },
  { month: 'Sep', value: 17 },
];

// --- Revenue by plan (bar heights approximated from Figma; no data table) ---
// Custom covers revenue from custom-built plans (Subscriptions → plan form).
const REVENUE_BY_PLAN = [
  { plan: 'Basic', value: 19, color: '#B9B9B9' },
  { plan: 'Pro', value: 26, color: '#026F4F' },
  { plan: 'Enterprise', value: 27, color: '#5B9BF5' },
  { plan: 'Custom', value: 12, color: '#B93DBE' },
];

// --- Subscriptions expiring soon, per month (counts) ---
const EXPIRING_OVER_TIME = [
  { month: 'Jan', value: 4 },
  { month: 'Feb', value: 6 },
  { month: 'Mar', value: 5 },
  { month: 'Apr', value: 8 },
  { month: 'May', value: 7 },
  { month: 'Jun', value: 10 },
  { month: 'Jul', value: 9 },
  { month: 'Aug', value: 12 },
  { month: 'Sep', value: 14 },
];

// --- Detailed Report (verbatim Figma rows + parallel Arabic fields) ---
const DETAILED_REPORT = [
  { date: 'Aug 08, 2026', date_ar: '8 أغسطس 2026', restaurant: 'El Gaucho Steakhouse', restaurant_ar: 'مطعم إل غاوتشو', revenue: '$1,240.00', orders: 142, tier: 'ENTERPRISE', tier_ar: 'المؤسسية' },
  { date: 'Aug 08, 2026', date_ar: '8 أغسطس 2026', restaurant: 'The Rustic Spoon', restaurant_ar: 'الملعقة الريفية', revenue: '$890.50', orders: 89, tier: 'PRO', tier_ar: 'الاحترافية' },
  { date: 'Aug 07, 2026', date_ar: '7 أغسطس 2026', restaurant: 'Burger Haven', restaurant_ar: 'برجر هافن', revenue: '$945.20', orders: 112, tier: 'BASIC', tier_ar: 'الأساسية' },
];

const RECENT_UPDATES = [
  { name: 'Burger King', name_ar: 'برجر كنج' },
  { name: 'Burger King', name_ar: 'برجر كنج' },
  { name: 'Burger King', name_ar: 'برجر كنج' },
  { name: 'Burger King', name_ar: 'برجر كنج' },
];

const TOP_PERFORMERS = [
  { name: 'El Gaucho', name_ar: 'إل غاوتشو', orders: '2,420 Orders', orders_ar: '2,420 طلب', revenue: '$12.5k' },
  { name: 'El Gaucho', name_ar: 'إل غاوتشو', orders: '2,420 Orders', orders_ar: '2,420 طلب', revenue: '$12.5k' },
  { name: 'El Gaucho', name_ar: 'إل غاوتشو', orders: '2,420 Orders', orders_ar: '2,420 طلب', revenue: '$12.5k' },
];

const MONTH_AR: Record<string, string> = {
  Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل', May: 'مايو',
  Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس', Sep: 'سبتمبر',
};

const PLAN_AR: Record<string, string> = {
  Basic: 'الأساسية', Pro: 'الاحترافية', Enterprise: 'المؤسسية', Custom: 'مخصصة',
};

const REVENUE_SNAPSHOT = [
  { key: 'totalRevenueSnap', value: '$15.99' },
  { key: 'mrrSnap', value: '$15.99' },
  { key: 'failedPaymentsSnap', value: '$15.99' },
] as const;

function tierPill(tier: string): string {
  switch (tier) {
    case 'ENTERPRISE':
      return 'bg-[#7C5CFC] text-white';
    case 'PRO':
      return 'bg-[#A78BFA] text-white';
    default:
      return 'bg-[#E9E9E9] text-[#686868]';
  }
}

function statusPill(status: TransactionLedger['status']): string {
  switch (status) {
    case 'Paid':
      return 'bg-[#D9F5D9] text-[#158F15]';
    case 'Pending':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-red-100 text-red-700';
  }
}

function downloadCSV(filename: string, rows: TransactionLedger[]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    ['Invoice ID,Restaurant,Plan,Amount,Method,Date,Status']
      .concat(
        rows.map(
          (l) =>
            `${l.invoiceId},"${l.restaurantName}","${l.planName}",$${l.amount},${l.paymentMethod},${l.date},${l.status}`
        )
      )
      .join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function RevenueReportsPage() {
  const t = useTranslations('sa.revenue');
  const tc = useTranslations('common.actions');
  const ts = useTranslations('common.status');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [ledger, setLedger] = useState<TransactionLedger[]>(mockLedger);
  // Query-driven overlays: ?modal=export-ledger, ?modal=log-entry, ?modal=delayed-payments
  const [exportOpen, setExportOpen] = useQueryModal('export-ledger');
  const [entryOpen, setEntryOpen] = useQueryModal('log-entry');
  const [delayedOpen, setDelayedOpen] = useQueryModal('delayed-payments');
  // Bar select/deselect (Owner Reports & Analytics pattern).
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const branchCount = (restaurantName: string) =>
    getRestaurants().find((r) => r.name === restaurantName)?.branches.length;

  const handleSaveEntry = (entry: LedgerEntry) => {
    const amount = parseFloat(entry.amount);
    const date = entry.date
      ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const seq = `INV-${new Date().getFullYear()}-${String(849 + ledger.length).padStart(4, '0')}`;
    setLedger((prev) => [
      {
        id: `tx-${Date.now()}`,
        invoiceId: seq,
        restaurantName: entry.description.trim() || 'Untitled entry',
        restaurantName_ar: entry.description.trim() || 'قيد بدون عنوان',
        restaurantId: '',
        planName: entry.category.trim() || '—',
        planName_ar: entry.category.trim() || '—',
        amount: isNaN(amount) ? 0 : amount,
        paymentMethod: 'Bank Transfer',
        paymentMethod_ar: 'تحويل بنكي',
        date,
        status: entry.type === 'Revenue' ? 'Paid' : 'Pending',
      },
      ...prev,
    ]);
    setEntryOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title={t('title')} subtitle={t('subtitle')} />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#2D2F33]">{t('title')}</h2>
            <p className="text-[#989898] mt-1">{t('subtitle')}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 border border-gray-200 bg-white rounded-full px-4 py-2 text-sm text-[#686868]">
            {t('perMonth')}
            <ChevronDown size={15} />
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="relative bg-white rounded-xl p-5 min-h-[150px] flex flex-col justify-center gap-2.5 overflow-hidden">
                <span className="absolute top-[18px] end-5 w-[45px] h-[42px] bg-[#E9E9E9] rounded-md flex items-center justify-center text-[#2D2F33]">
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <p className="font-medium text-[#686868] text-[15px] leading-[1.4] pe-16">{t(card.key as any)}</p>
                <p className={`font-semibold text-[32px] leading-[1.4] ${'valueClass' in card ? card.valueClass : 'text-black'}`}>
                  {card.value}
                </p>
                <p className={`flex items-center gap-2 text-sm ${card.subClass}`}>
                  {'delta' in card && card.delta && <TrendingUp size={16} />}
                  <span>{'subValues' in card ? t(card.subKey as any, card.subValues) : t(card.subKey as any)}</span>
                </p>
                {'viewModal' in card && card.viewModal ? (
                  <button
                    type="button"
                    onClick={() => setDelayedOpen(true)}
                    className="inline-flex w-fit items-center gap-1.5 self-end rounded-full bg-[#026F4F]/10 px-4 py-1.5 text-sm font-medium text-[#026F4F] transition-colors hover:bg-[#026F4F] hover:text-white"
                  >
                    {tc('view')}
                    <span aria-hidden="true">→</span>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('revenueChart')}</h3>
            <div className="h-[273px] w-full mt-4">
              <SelectableAreaChart
                data={REVENUE_OVER_TIME.map((d) => ({ label: isAr ? (MONTH_AR[d.month] ?? d.month) : d.month, value: d.value }))}
                formatValue={(v) => `$${v}K`}
                yDomain={[0, 30]}
                yTicks={[0, 10, 20, 30]}
                formatTick={(v) => (v === 0 ? '0' : `${v}K`)}
                gradientId="revOverTimeFill"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('revenueBreakdown')}</h3>
            <div className="flex gap-2 mt-4 h-[273px]">
              <div className="flex flex-col justify-between text-end text-[rgba(0,0,0,0.4)] text-xs py-1">
                {['30K', '20K', '10K', '0'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="relative flex-1">
                  <div className="absolute inset-0 flex flex-col justify-between py-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span key={i} className="block h-px bg-[#E9E9E9]" />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-stretch justify-around px-6">
                    {REVENUE_BY_PLAN.map((bar) => {
                      const selected = selectedPlan === bar.plan;
                      const dimmed = selectedPlan !== null && !selected;
                      const heightPct = (bar.value / 30) * 100;
                      return (
                        <button
                          key={bar.plan}
                          type="button"
                          onClick={() => setSelectedPlan((prev) => (prev === bar.plan ? null : bar.plan))}
                          title={`${isAr ? (PLAN_AR[bar.plan] ?? bar.plan) : bar.plan}: $${bar.value}K`}
                          className={`w-16 sm:w-20 relative transition-opacity cursor-pointer ${dimmed ? 'opacity-30' : 'opacity-100'}`}
                        >
                          <span
                            className="absolute bottom-0 start-0 end-0 rounded-t-lg pointer-events-none"
                            style={{ height: `${heightPct}%`, backgroundColor: bar.color }}
                          />
                          {selected && (
                            <span
                              className="absolute start-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#2D2F33] text-white text-xs font-semibold px-2.5 py-1.5 shadow-lg pointer-events-none"
                              style={{ bottom: `calc(${heightPct}% + 10px)` }}
                            >
                              ${bar.value}K
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-around px-6 pt-2">
                  {REVENUE_BY_PLAN.map((bar) => (
                    <span key={bar.plan} className="w-16 sm:w-20 text-center text-[#2D2F33] text-xs font-medium">
                      {isAr ? (PLAN_AR[bar.plan] ?? bar.plan) : bar.plan}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-[22px] lg:col-span-2 xl:col-span-1">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('expiringChart')}</h3>
            <div className="h-[273px] w-full mt-4">
              <SelectableAreaChart
                data={EXPIRING_OVER_TIME.map((d) => ({ label: isAr ? (MONTH_AR[d.month] ?? d.month) : d.month, value: d.value }))}
                formatValue={(v) => `${v}`}
                yDomain={[0, 15]}
                yTicks={[0, 5, 10, 15]}
                formatTick={(v) => `${v}`}
                gradientId="expiringFill"
              />
            </div>
          </div>
        </div>

        {/* Detailed Report + Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('detailedReport')}</h3>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-start border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
                    <th className="py-3 px-4 text-start rounded-s-lg">
                      <span className="inline-flex items-center gap-1">
                        {t('columns.date')}
                        <ChevronUp size={13} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-start">{t('columns.restaurant')}</th>
                    <th className="py-3 px-4 text-start">{t('columns.revenue')}</th>
                    <th className="py-3 px-4 text-start">{t('columns.orders')}</th>
                    <th className="py-3 px-4 text-start rounded-e-lg">{t('columns.planTier')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {DETAILED_REPORT.map((row, i) => (
                    <tr key={i}>
                      <td className="py-4 px-4 text-[#686868]">{isAr ? row.date_ar : row.date}</td>
                      <td className="py-4 px-4 font-semibold text-[#2D2F33]">{isAr ? row.restaurant_ar : row.restaurant}</td>
                      <td className="py-4 px-4 text-[#2D2F33]"><bdi dir="ltr">{row.revenue}</bdi></td>
                      <td className="py-4 px-4 text-[#2D2F33]">{row.orders}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md ${tierPill(row.tier)}`}>
                          {isAr ? row.tier_ar : row.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('topPerformers')}</h3>
            <div className="mt-4 divide-y divide-gray-100">
              {TOP_PERFORMERS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-4">
                  <span className="text-[#026F4F] font-black italic text-sm tracking-tight">EMSA7</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-[#2D2F33] text-[15px]">{isAr ? p.name_ar : p.name}</span>
                    <span className="block text-xs text-[#989898]">{isAr ? p.orders_ar : p.orders}</span>
                  </span>
                  <span className="text-end">
                    <span className="block font-bold text-[#2D2F33]">{p.revenue}</span>
                    <span className="flex items-center justify-end gap-1 text-xs text-[#158F15]">
                      <TrendingUp size={12} />
                      14%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delayed Payments — who is delayed (Bug-20). TODO(api): GET /billing/delayed. */}
        <div id="delayed" className="scroll-mt-6 rounded-xl bg-white p-[22px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('delayedPayments')}</h3>
            <span className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700">
              13 {t('actionRequired')}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#989898]">Showing the 6 most overdue accounts.</p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-start border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
                  <th className="py-3 px-4 text-start rounded-s-lg">{t('columns.restaurant')}</th>
                  <th className="py-3 px-4 text-start">{t('columns.planTier')}</th>
                  <th className="py-3 px-4 text-start">{t('columns.revenue')}</th>
                  <th className="py-3 px-4 text-start">Overdue</th>
                  <th className="py-3 px-4 text-start rounded-e-lg">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {DELAYED_ROWS.map((row, i) => (
                  <tr key={i}>
<td className="py-4 px-4 whitespace-nowrap font-semibold text-[#2D2F33]">{row.restaurant}</td>
                    <td className="py-4 px-4 text-[#686868]">{row.plan}</td>
                    <td className="py-4 px-4 font-semibold text-[#E52B2B]"><bdi dir="ltr">{row.amount}</bdi></td>
                    <td className="py-4 px-4">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">{row.overdue}</span>
                    </td>
                    <td className="py-4 px-4 text-[#686868]"><bdi dir="ltr">{row.contact}</bdi></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Updates + Revenue Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('recentUpdates')}</h3>
            <div className="mt-2">
              {RECENT_UPDATES.map((row, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between gap-4 py-5">
                    <p className="text-[#989898] text-[15px] truncate">
                      {t('newRestaurantAdded', { name: isAr ? row.name_ar : row.name })}
                    </p>
                    <p className="text-[#686868] text-sm whitespace-nowrap flex-shrink-0">{t('minutesAgo')}</p>
                  </div>
                  {i < RECENT_UPDATES.length - 1 && <div className="h-px bg-[#E9E9E9]" />}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('revenueSnapshot')}</h3>
            <div className="mt-10 lg:mt-[60px] space-y-9">
              {REVENUE_SNAPSHOT.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4">
                  <p className="text-[#989898] text-[15px]">{t(row.key as any)}</p>
                  <p className="font-semibold text-[#026F4F] text-xl">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">{t('invoices')}</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setExportOpen(true)}
                className="h-12 px-5 rounded-full bg-white hover:bg-gray-100 border border-gray-100 text-sm font-medium text-[#2D2F33] flex items-center gap-2 transition-colors"
              >
                <ListFilter size={16} className="text-[#989898]" />
                <span>{tc('viewAllExport')}</span>
                <Download size={16} className="text-[#989898]" />
              </button>
              <button
                onClick={() => setEntryOpen(true)}
                className="h-12 px-5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-medium flex items-center gap-2 transition-all"
              >
                <Plus size={18} />
                <span>{tc('addEntry')}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[minmax(120px,1fr)_minmax(180px,1.4fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_64px] gap-4 px-6 py-4 bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
                  <span>{t('invoiceId')}</span>
                  <span>{t('columns.restaurant')}</span>
                  <span>{t('plan')}</span>
                  <span>{t('amount')}</span>
                  <span>{t('columns.date')}</span>
                  <span>{t('status')}</span>
                  <span>{t('actions')}</span>
                </div>
                {ledger.map((tx) => {
                  const pill = planPill(locField(locale, tx, 'planName') || tx.planName, locale);
                  const branches = branchCount(tx.restaurantName);
                  return (
                    <div
                      key={tx.id}
                      className="grid grid-cols-[minmax(120px,1fr)_minmax(180px,1.4fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_64px] gap-4 px-6 py-4 items-center border-t border-gray-100 first:border-t-0"
                    >
                      <span className="font-mono text-sm font-medium text-[#026F4F]" dir="ltr">{tx.invoiceId}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#2D2F33] text-[15px] truncate">{locField(locale, tx, 'restaurantName')}</span>
                        {branches !== undefined && (
                          <span className="block text-xs text-[#989898]">{t('branchesCountLabel', { count: branches })}</span>
                        )}
                      </span>
                      <span>
                        <span className={`text-xs font-medium px-3.5 py-1.5 rounded-full ${pill.classes}`}>
                          {pill.label}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-[#2D2F33]" dir="ltr">${tx.amount.toFixed(2)}</span>
                      <span className="text-sm text-[#2D2F33]">{locField(locale, tx, 'date')}</span>
                      <span>
                        <span className={`text-sm font-medium px-4 py-1.5 rounded-full ${statusPill(tx.status)}`}>
                          {tx.status === 'Paid' ? ts('paid') : tx.status === 'Pending' ? ts('pending') : ts('failed')}
                        </span>
                      </span>
                      <button
                        onClick={() => downloadCSV(`invoice_${tx.invoiceId}.csv`, [tx])}
                        aria-label={`${t('downloadInvoice', { id: tx.invoiceId })}`}
                        className="w-11 h-11 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ExportLedgerModal
        isOpen={exportOpen}
        placement="right"
        onClose={() => setExportOpen(false)}
        onExport={(start, end) => downloadCSV(`ecosystem_ledger_${start}_to_${end}.csv`, ledger)}
      />

      {entryOpen && (
        <LogEntryModal onClose={() => setEntryOpen(false)} onSave={handleSaveEntry} />
      )}

      {delayedOpen && <DelayedPaymentsModal onClose={() => setDelayedOpen(false)} />}
    </div>
  );
}
