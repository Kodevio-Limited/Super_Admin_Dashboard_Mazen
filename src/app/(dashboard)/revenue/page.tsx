'use client';

import React, { useState } from 'react';
import Topbar from '../../../components/Topbar';
import {
  DollarSign,
  TrendingUp,
  Download,
  Filter as FilterIcon,
  Search,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { mockLedger, mockRevenueMetrics } from '../../../data/mockData';
import { TransactionLedger } from '../../../types/admin';
import ExportLedgerModal from '../../../components/modals/ExportLedgerModal';
import FilterDrawer from '../../../components/drawers/FilterDrawer';

export default function RevenueReportsPage() {
  const [ledger, setLedger] = useState<TransactionLedger[]>(mockLedger);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredLedger = ledger.filter((item) => {
    const matchesSearch =
      item.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.planName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const totalProcessed = ledger
    .filter((l) => l.status === 'Paid')
    .reduce((sum, l) => sum + l.amount, 0);

  // Figma 🗑️ Dump → Frame 2147225781 (node 1507:1219): "Payment Methods /
  // Breakdown by transaction type." with POS / Cash / Online (App) segments.
  // The design specifies no values or data source, so this uses a clearly
  // labeled sample distribution until the real mapping is confirmed.
  const paymentMethodBreakdown = [
    { name: 'POS', value: 45, color: '#7B7BF5' },
    { name: 'Cash', value: 25, color: '#FF9E8A' },
    { name: 'Online (App)', value: 30, color: '#45B7C7' },
  ];

  const handleExportCSV = (start: string, end: string) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Invoice ID,Restaurant,Plan,Amount,Method,Date,Status']
        .concat(
          ledger.map(
            (l) =>
              `${l.invoiceId},"${l.restaurantName}","${l.planName}",$${l.amount},${l.paymentMethod},${l.date},${l.status}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecosystem_ledger_${start}_to_${end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Revenue Intelligence & Financial Ledger"
        subtitle="Platform subscriptions, payment gateway reconciliations, and accounting ledgers"
      />

      <main className="flex-1 p-8 space-y-8 max-w-[1920px] mx-auto w-full">
        {/* Top Financial KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
            <p className="text-xs text-[#989898] font-bold uppercase">Total Platform Volume</p>
            <h3 className="text-3xl font-bold text-[#2D2F33] mt-1">$1,420,500</h3>
            <p className="text-xs text-[#158F15] mt-1 font-semibold">+24.5% year-to-date</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
            <p className="text-xs text-[#989898] font-bold uppercase">Monthly SaaS Revenue</p>
            <h3 className="text-3xl font-bold text-[#026F4F] mt-1">$92,800</h3>
            <p className="text-xs text-[#158F15] mt-1 font-semibold">+18.4% MRR growth</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
            <p className="text-xs text-[#989898] font-bold uppercase">Platform Take Rate (1.5%)</p>
            <h3 className="text-3xl font-bold text-[#2D2F33] mt-1">$21,307</h3>
            <p className="text-xs text-[#6E727A] mt-1">Transaction commission</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
            <p className="text-xs text-[#989898] font-bold uppercase">Net Payouts Dispatched</p>
            <h3 className="text-3xl font-bold text-[#2D2F33] mt-1">$67,200</h3>
            <p className="text-xs text-[#6E727A] mt-1">Direct wire to restaurant accounts</p>
          </div>
        </div>

        {/* Financial Growth Chart */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#2D2F33]">
                Cumulative Financial Growth Trajectory
              </h3>
              <p className="text-xs text-[#6E727A]">
                Comprehensive trend of gross revenue, subscription income, and merchant payouts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#026F4F]" />
                <span>Gross Volume</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#158F15]" />
                <span>SaaS Revenue</span>
              </div>
            </div>
          </div>

          <div className="h-[340px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueMetrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#026F4F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#026F4F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#158F15" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#158F15" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E9E9" />
                <XAxis dataKey="month" stroke="#989898" fontSize={12} tickLine={false} />
                <YAxis stroke="#989898" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#026F4F" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Gross Revenue" />
                <Area type="monotone" dataKey="subscriptionRevenue" stroke="#158F15" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" name="SaaS Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown (per Figma Dump → node 1507:1219) */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#2D2F33]">Payment Methods</h3>
            <p className="text-xs text-[#6E727A]">Breakdown by transaction type.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-[240px] w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="90%"
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {paymentMethodBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, '']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-3">
              {paymentMethodBreakdown.map((entry) => (
                <div key={entry.name} className="flex items-center gap-3 text-sm">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-semibold text-[#2D2F33]">{entry.name}</span>
                  <span className="ml-auto text-xs text-[#6E727A]">{entry.value}%</span>
                </div>
              ))}
              <p className="text-[11px] text-[#989898] pt-2">
                Sample distribution — Figma specifies the segments but no values or data source.
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Ledger Section */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#2D2F33]">
                Transactions Ledger
              </h3>
              <p className="text-xs text-[#6E727A]">
                Itemized invoice records for license subscriptions and platform services
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="h-11 px-4 rounded-full border border-gray-200 hover:border-[#026F4F] text-xs font-bold text-[#2D2F33] flex items-center gap-1.5 bg-white transition-colors"
              >
                <FilterIcon size={14} />
                <span>Filter</span>
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="h-11 px-5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
              >
                <Download size={14} />
                <span>Export Ledger (CSV)</span>
              </button>
            </div>
          </div>

          {/* Search Table */}
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#989898]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice number, restaurant..."
              className="w-full h-11 pl-10 pr-4 bg-[#F8F9FA] border border-gray-200 rounded-full text-xs text-[#2D2F33] focus:border-[#026F4F] focus:outline-none transition-all"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-[#989898] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice ID</th>
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Plan / Description</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredLedger.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#026F4F]">
                      {tx.invoiceId}
                    </td>

                    <td className="py-4 px-4 font-semibold text-[#2D2F33]">
                      {tx.restaurantName}
                      {tx.branchName && (
                        <span className="text-xs text-[#6E727A] block font-normal">{tx.branchName}</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-[#686868]">
                      {tx.planName}
                    </td>

                    <td className="py-4 px-4 font-bold text-[#2D2F33]">
                      ${tx.amount.toFixed(2)}
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-[#2D2F33]">
                      {tx.paymentMethod}
                    </td>

                    <td className="py-4 px-4 text-xs text-[#6E727A]">
                      {tx.date}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          tx.status === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Export Ledger Modal */}
      <ExportLedgerModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportCSV}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={() => {}}
      />
    </div>
  );
}
