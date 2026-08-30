'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Topbar from '../../components/Topbar';
import {
  Store,
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { mockRevenueMetrics, mockRestaurants, mockUsers } from '../../data/mockData';
import CreateRestaurantModal from '../../components/modals/CreateRestaurantModal';

export default function SuperAdminDashboardPage() {
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const totalBranches = restaurants.reduce((sum, r) => sum + r.totalBranches, 0);
  const totalRevenue = restaurants.reduce((sum, r) => sum + r.totalRevenue, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Super Admin Dashboard"
        subtitle="Global platform overview, revenue intelligence, and multi-chain status"
      />

      <main className="flex-1 p-8 space-y-8 max-w-[1920px] mx-auto w-full">
        {/* Top Hero / Action Strip */}
        <div className="bg-[#026F4F] rounded-3xl p-8 text-white flex flex-wrap items-center justify-between gap-6 shadow-[0px_4px_24px_rgba(2,111,79,0.25)] relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          <div className="space-y-2 max-w-xl z-10">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={14} />
              Enterprise Platform Live
            </span>
            <h2 className="text-3xl font-bold font-satoshi">
              Welcome back, Elena
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              All 4 active franchise clusters and 7 live branch systems are operating normally. Real-time POS syncing and KDS routing are 100% healthy.
            </p>
          </div>

          <div className="flex items-center gap-4 z-10">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 h-13 bg-white hover:bg-gray-100 text-[#026F4F] font-bold text-sm rounded-full shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Plus size={18} />
              <span>Create New Restaurant</span>
            </button>
            <Link
              href="/revenue"
              className="px-6 h-13 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm rounded-full flex items-center gap-2 transition-all"
            >
              <span>Financial Ledger</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Restaurants */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#026F4F] flex items-center justify-center">
                <Store size={24} />
              </div>
              <span className="text-xs font-bold text-[#158F15] bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={14} />
                +12% mo
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-[#989898] font-bold uppercase tracking-wider">
                Total Restaurants
              </p>
              <h3 className="text-3xl font-bold text-[#2D2F33] mt-1">
                {restaurants.length} Chains
              </h3>
              <p className="text-xs text-[#6E727A] mt-1 font-medium">
                {totalBranches} Active Branch locations
              </p>
            </div>
          </div>

          {/* Card 2: Monthly Platform Revenue */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <span className="text-xs font-bold text-[#158F15] bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={14} />
                +18.4% MRR
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-[#989898] font-bold uppercase tracking-wider">
                Monthly Recurring (MRR)
              </p>
              <h3 className="text-3xl font-bold text-[#2D2F33] mt-1">
                $92,800
              </h3>
              <p className="text-xs text-[#6E727A] mt-1 font-medium">
                SaaS fees & Hardware add-ons
              </p>
            </div>
          </div>

          {/* Card 3: Platform GMV Volume */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={14} />
                +24.5%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-[#989898] font-bold uppercase tracking-wider">
                Platform GMV Volume
              </p>
              <h3 className="text-3xl font-bold text-[#2D2F33] mt-1">
                ${(totalRevenue / 1000).toFixed(1)}k
              </h3>
              <p className="text-xs text-[#6E727A] mt-1 font-medium">
                Processed across all cashier POS
              </p>
            </div>
          </div>

          {/* Card 4: Active Users */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-[#989898] font-bold uppercase tracking-wider">
                Registered Staff & Users
              </p>
              <h3 className="text-3xl font-bold text-[#2D2F33] mt-1">
                {mockUsers.length * 12} Users
              </h3>
              <p className="text-xs text-[#6E727A] mt-1 font-medium">
                Managers, Cashiers & Kitchen Staff
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Financial Growth Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#2D2F33]">
                  Revenue & Subscription Growth
                </h3>
                <p className="text-xs text-[#6E727A]">
                  Monthly SaaS recurring revenue vs platform transaction commissions
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#026F4F]" />
                  <span>SaaS Subscriptions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#158F15]" />
                  <span>Platform Fees</span>
                </div>
              </div>
            </div>

            <div className="h-[320px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E9E9" />
                  <XAxis dataKey="month" stroke="#989898" fontSize={12} tickLine={false} />
                  <YAxis stroke="#989898" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9' }}
                  />
                  <Bar dataKey="subscriptionRevenue" fill="#026F4F" radius={[6, 6, 0, 0]} barSize={22} name="Subscription Revenue" />
                  <Bar dataKey="platformFees" fill="#158F15" radius={[6, 6, 0, 0]} barSize={22} name="Platform Fees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscription Breakdown & Plan Status */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#2D2F33]">
                Plan Distribution
              </h3>
              <p className="text-xs text-[#6E727A]">
                Breakdown of active restaurant subscriptions
              </p>

              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#2D2F33]">Enterprise Plan ($299/mo)</span>
                    <span className="text-[#026F4F]">50% (2 Chains)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#026F4F] rounded-full w-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#2D2F33]">Professional Plan ($149/mo)</span>
                    <span className="text-[#158F15]">25% (1 Chain)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#158F15] rounded-full w-1/4" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#2D2F33]">Basic Branch Tier ($49/mo)</span>
                    <span className="text-blue-600">25% (1 Chain)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-1/4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#989898] font-bold">Monthly Target</p>
                <p className="text-lg font-bold text-[#026F4F]">$100k MRR</p>
              </div>
              <Link
                href="/subscriptions"
                className="text-xs font-bold text-[#026F4F] hover:underline flex items-center gap-1"
              >
                Manage Plans <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Restaurants Table */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2F33]">
                Registered Restaurant Franchises
              </h3>
              <p className="text-xs text-[#6E727A]">
                Overview of multi-location restaurant chains and current subscription tiers
              </p>
            </div>
            <Link
              href="/restaurants"
              className="text-sm font-bold text-[#026F4F] hover:underline flex items-center gap-1"
            >
              <span>View All Restaurants</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-[#989898] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Owner Contact</th>
                  <th className="py-3.5 px-4">Branches</th>
                  <th className="py-3.5 px-4">SaaS Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {restaurants.map((rest) => (
                  <tr key={rest.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#2D2F33]">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={rest.logo} alt={rest.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[#2D2F33]">{rest.name}</p>
                          <p className="text-xs text-[#6E727A]">{rest.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-[#2D2F33]">{rest.ownerName}</p>
                      <p className="text-xs text-[#6E727A]">{rest.ownerEmail}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#026F4F]">
                      {rest.totalBranches} Locations
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-[#F8F9FA] border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-[#2D2F33]">
                        {rest.planName}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          rest.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {rest.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/restaurants/${rest.id}`}
                        className="text-xs font-bold text-[#026F4F] hover:bg-green-50 px-3.5 py-1.5 rounded-full border border-[#026F4F]/20 hover:border-[#026F4F] transition-all inline-flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Restaurant Modal */}
      <CreateRestaurantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newRest) => setRestaurants([newRest, ...restaurants])}
      />
    </div>
  );
}
