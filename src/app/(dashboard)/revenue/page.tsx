'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import SelectableAreaChart from '../../../components/SelectableAreaChart';
import Topbar from '../../../components/Topbar';
import ExportLedgerModal from '../../../components/modals/ExportLedgerModal';
import LogEntryModal, { LedgerEntry } from '../../../components/modals/LogEntryModal';
import { mockLedger } from '../../../data/mockData';
import { getRestaurants } from '../../../data/restaurantStore';
import { planPill } from '../../../data/figmaPlans';
import { TransactionLedger } from '../../../types/admin';

// Source of truth: Figma frame "Revenue & Reports" (1939:1060).
// KPI figures, chart shapes, report rows, performers and snapshot values are
// static display values from the design (flagged in the report); the Invoices
// table runs on the app ledger so entries can be added and exported.

// --- KPI cards (Figma labels, values, sublabels) ---
const KPI_CARDS = [
  { label: 'Total Revenue', value: '$1,250', valueClass: 'text-[#026F4F]', sub: '12.5% from yesterday', subClass: 'text-[#158F15]', icon: Store, delta: true },
  { label: 'Active Restaurants', value: '155', sub: '+12 this month', subClass: 'text-[#989898]', icon: Receipt },
  { label: 'Total orders', value: '432', sub: '+12 this month', subClass: 'text-[#989898]', icon: UtensilsCrossed },
  { label: 'Paid Accounts', value: '142', sub: '91% of total', subClass: 'text-[#989898]', icon: Armchair },
  { label: 'Delayed Payments', value: '13', sub: 'Action Required', subClass: 'text-[#E52B2B]', icon: Clock },
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
const REVENUE_BY_PLAN = [
  { plan: 'Basic', value: 19, color: '#B9B9B9' },
  { plan: 'Pro', value: 26, color: '#026F4F' },
  { plan: 'Enterprise', value: 27, color: '#5B9BF5' },
];

// --- Detailed Report (verbatim Figma rows) ---
const DETAILED_REPORT = [
  { date: 'Aug 08, 2026', restaurant: 'El Gaucho Steakhouse', revenue: '$1,240.00', orders: 142, tier: 'ENTERPRISE' },
  { date: 'Aug 08, 2026', restaurant: 'The Rustic Spoon', revenue: '$890.50', orders: 89, tier: 'PRO' },
  { date: 'Aug 07, 2026', restaurant: 'Burger Haven', revenue: '$945.20', orders: 112, tier: 'BASIC' },
];

const TOP_PERFORMERS = [
  { name: 'El Gaucho', orders: '2,420 Orders', revenue: '$12.5k' },
  { name: 'El Gaucho', orders: '2,420 Orders', revenue: '$12.5k' },
  { name: 'El Gaucho', orders: '2,420 Orders', revenue: '$12.5k' },
];

const RECENT_UPDATES = [
  'Burger King',
  'Burger King',
  'Burger King',
  'Burger King',
];

const REVENUE_SNAPSHOT = [
  { label: 'Total Revenue', value: '$15.99' },
  { label: 'MRR', value: '$15.99' },
  { label: 'Failed Payments', value: '$15.99' },
];

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
  const [ledger, setLedger] = useState<TransactionLedger[]>(mockLedger);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
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
        restaurantId: '',
        planName: entry.category.trim() || '—',
        amount: isNaN(amount) ? 0 : amount,
        paymentMethod: 'Bank Transfer',
        date,
        status: entry.type === 'Revenue' ? 'Paid' : 'Pending',
      },
      ...prev,
    ]);
    setIsEntryOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Revenue & Reports" subtitle="Track financial performance and platform growth" />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#2D2F33]">Revenue & Reports</h2>
            <p className="text-[#989898] mt-1">Track financial performance and platform growth</p>
          </div>
          <span className="inline-flex items-center gap-1.5 border border-gray-200 bg-white rounded-full px-4 py-2 text-sm text-[#686868]">
            Per Month
            <ChevronDown size={15} />
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="relative bg-white rounded-xl p-5 min-h-[150px] flex flex-col justify-center gap-2.5 overflow-hidden">
                <span className="absolute top-[18px] right-5 w-[45px] h-[42px] bg-[#E9E9E9] rounded-md flex items-center justify-center text-[#2D2F33]">
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <p className="font-medium text-[#686868] text-[15px] leading-[1.4] pr-16">{card.label}</p>
                <p className={`font-semibold text-[32px] leading-[1.4] ${card.valueClass || 'text-black'}`}>
                  {card.value}
                </p>
                <p className={`flex items-center gap-2 text-sm ${card.subClass}`}>
                  {card.delta && <TrendingUp size={16} />}
                  <span>{card.sub}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">Revenue Over Time</h3>
            <div className="h-[273px] w-full mt-4">
              <SelectableAreaChart
                data={REVENUE_OVER_TIME.map((d) => ({ label: d.month, value: d.value }))}
                formatValue={(v) => `$${v}K`}
                yDomain={[0, 30]}
                yTicks={[0, 10, 20, 30]}
                formatTick={(v) => (v === 0 ? '0' : `${v}K`)}
                gradientId="revOverTimeFill"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">Revenue by plan</h3>
            <div className="flex gap-2 mt-4 h-[273px]">
              <div className="flex flex-col justify-between text-right text-[rgba(0,0,0,0.4)] text-xs py-1">
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
                          title={`${bar.plan}: $${bar.value}K`}
                          className={`w-16 sm:w-20 relative transition-opacity cursor-pointer ${dimmed ? 'opacity-30' : 'opacity-100'}`}
                        >
                          <span
                            className="absolute bottom-0 left-0 right-0 rounded-t-lg pointer-events-none"
                            style={{ height: `${heightPct}%`, backgroundColor: bar.color }}
                          />
                          {selected && (
                            <span
                              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#2D2F33] text-white text-xs font-semibold px-2.5 py-1.5 shadow-lg pointer-events-none"
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
                      {bar.plan}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Report + Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">Detailed Report</h3>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
                    <th className="py-3 px-4 rounded-l-lg">
                      <span className="inline-flex items-center gap-1">
                        Date
                        <ChevronUp size={13} />
                      </span>
                    </th>
                    <th className="py-3 px-4">Restaurant</th>
                    <th className="py-3 px-4">Revenue</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4 rounded-r-lg">Plan Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {DETAILED_REPORT.map((row, i) => (
                    <tr key={i}>
                      <td className="py-4 px-4 text-[#686868]">{row.date}</td>
                      <td className="py-4 px-4 font-semibold text-[#2D2F33]">{row.restaurant}</td>
                      <td className="py-4 px-4 text-[#2D2F33]">{row.revenue}</td>
                      <td className="py-4 px-4 text-[#2D2F33]">{row.orders}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md ${tierPill(row.tier)}`}>
                          {row.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">Top Performers</h3>
            <div className="mt-4 divide-y divide-gray-100">
              {TOP_PERFORMERS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-4">
                  <span className="text-[#026F4F] font-black italic text-sm tracking-tight">EMSA7</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-[#2D2F33] text-[15px]">{p.name}</span>
                    <span className="block text-xs text-[#989898]">{p.orders}</span>
                  </span>
                  <span className="text-right">
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

        {/* Recent Updates + Revenue Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">Recent Updates</h3>
            <div className="mt-2">
              {RECENT_UPDATES.map((name, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between gap-4 py-5">
                    <p className="text-[#989898] text-[15px] truncate">
                      New restaurant <span className="font-medium text-[#2D2F33]">{name}</span> added to platform
                    </p>
                    <p className="text-[#686868] text-sm whitespace-nowrap flex-shrink-0">2 mins ago</p>
                  </div>
                  {i < RECENT_UPDATES.length - 1 && <div className="h-px bg-[#E9E9E9]" />}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl p-[22px]">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">Revenue Snapshot</h3>
            <div className="mt-10 lg:mt-[60px] space-y-9">
              {REVENUE_SNAPSHOT.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <p className="text-[#989898] text-[15px]">{row.label}</p>
                  <p className="font-semibold text-[#026F4F] text-xl">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-semibold text-[#2D2F33] text-2xl">Invoices</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExportOpen(true)}
                className="h-12 px-5 rounded-full bg-white hover:bg-gray-100 border border-gray-100 text-sm font-medium text-[#2D2F33] flex items-center gap-2 transition-colors"
              >
                <ListFilter size={16} className="text-[#989898]" />
                <span>View All / Export</span>
              </button>
              <button
                onClick={() => setIsEntryOpen(true)}
                className="h-12 px-5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-medium flex items-center gap-2 transition-all"
              >
                <Plus size={18} />
                <span>Add Entry</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[minmax(120px,1fr)_minmax(180px,1.4fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_64px] gap-4 px-6 py-4 bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
                  <span>Invoice ID</span>
                  <span>Restaurant</span>
                  <span>Plan</span>
                  <span>Amount</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {ledger.map((tx) => {
                  const pill = planPill(tx.planName);
                  const branches = branchCount(tx.restaurantName);
                  return (
                    <div
                      key={tx.id}
                      className="grid grid-cols-[minmax(120px,1fr)_minmax(180px,1.4fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_minmax(110px,0.9fr)_minmax(90px,0.7fr)_64px] gap-4 px-6 py-4 items-center border-t border-gray-100 first:border-t-0"
                    >
                      <span className="font-mono text-sm font-medium text-[#026F4F]">{tx.invoiceId}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#2D2F33] text-[15px] truncate">{tx.restaurantName}</span>
                        {branches !== undefined && (
                          <span className="block text-xs text-[#989898]">{branches} Branches</span>
                        )}
                      </span>
                      <span>
                        <span className={`text-xs font-medium px-3.5 py-1.5 rounded-full ${pill.classes}`}>
                          {pill.label}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-[#2D2F33]">${tx.amount.toFixed(2)}</span>
                      <span className="text-sm text-[#2D2F33]">{tx.date}</span>
                      <span>
                        <span className={`text-sm font-medium px-4 py-1.5 rounded-full ${statusPill(tx.status)}`}>
                          {tx.status}
                        </span>
                      </span>
                      <button
                        onClick={() => downloadCSV(`invoice_${tx.invoiceId}.csv`, [tx])}
                        aria-label={`Download ${tx.invoiceId}`}
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
        isOpen={isExportOpen}
        placement="right"
        onClose={() => setIsExportOpen(false)}
        onExport={(start, end) => downloadCSV(`ecosystem_ledger_${start}_to_${end}.csv`, ledger)}
      />

      {isEntryOpen && (
        <LogEntryModal onClose={() => setIsEntryOpen(false)} onSave={handleSaveEntry} />
      )}
    </div>
  );
}
