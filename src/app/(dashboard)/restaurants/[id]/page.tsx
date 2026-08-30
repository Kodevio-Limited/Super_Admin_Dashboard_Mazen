'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Topbar from '../../../../components/Topbar';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Store,
  Users,
  ShieldCheck,
  Activity,
  CreditCard,
  Plus,
  ArrowRight,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';
import { mockRestaurants, mockPlans } from '../../../../data/mockData';
import { Restaurant, Branch } from '../../../../types/admin';
import BranchDetailsDrawer from '../../../../components/drawers/BranchDetailsDrawer';
import BranchSubscriptionDrawer from '../../../../components/drawers/BranchSubscriptionDrawer';
import BranchActivityDrawer from '../../../../components/drawers/BranchActivityDrawer';
import ActionNotAllowedModal from '../../../../components/modals/ActionNotAllowedModal';

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const restaurantId = resolvedParams.id;

  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const restaurant = restaurants.find((r) => r.id === restaurantId) || restaurants[0];

  const [activeTab, setActiveTab] = useState<'Overview' | 'Branches'>('Overview');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Drawer states
  const [isBranchDetailsOpen, setIsBranchDetailsOpen] = useState(false);
  const [isBranchSubOpen, setIsBranchSubOpen] = useState(false);
  const [isBranchActOpen, setIsBranchActOpen] = useState(false);
  const [isActionNotAllowedOpen, setIsActionNotAllowedOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title={`${restaurant.name} • Details`}
        subtitle="Manage overarching franchise settings, branch locations, and staff permissions"
      />

      <main className="flex-1 p-8 space-y-8 max-w-[1920px] mx-auto w-full">
        {/* Navigation & Header Banner */}
        <div className="flex items-center justify-between">
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6E727A] hover:text-[#2D2F33] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to All Restaurants</span>
          </Link>
        </div>

        {/* Restaurant Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
              <Image src={restaurant.logo} alt={restaurant.name} fill className="object-cover" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-bold text-[#2D2F33]">
                  {restaurant.name}
                </h2>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  {restaurant.status}
                </span>
              </div>
              <p className="text-sm text-[#6E727A] flex items-center gap-2">
                <span>{restaurant.category}</span>
                <span>•</span>
                <span className="text-[#026F4F] font-semibold">{restaurant.branches.length} Active Locations</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsActionNotAllowedOpen(true)}
              className="px-5 py-3 rounded-full bg-red-50 hover:bg-red-100 text-[#E52B2B] text-xs font-bold transition-all"
            >
              Test Policy Alert
            </button>
            <Link
              href="/subscriptions"
              className="px-6 py-3 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <CreditCard size={15} />
              <span>Manage SaaS Tier</span>
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('Overview')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'Overview'
                ? 'bg-white shadow-xs text-[#026F4F] border border-gray-200'
                : 'text-[#686868] hover:text-[#2D2F33]'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('Branches')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'Branches'
                ? 'bg-white shadow-xs text-[#026F4F] border border-gray-200'
                : 'text-[#686868] hover:text-[#2D2F33]'
            }`}
          >
            <span>Branch Locations</span>
            <span className="bg-[#026F4F]/10 text-[#026F4F] text-xs px-2 py-0.5 rounded-full">
              {restaurant.branches.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                <p className="text-xs text-[#989898] font-bold uppercase">Total Lifetime GMV</p>
                <h3 className="text-2xl font-bold text-[#2D2F33] mt-1">${restaurant.totalRevenue.toLocaleString()}</h3>
                <p className="text-xs text-[#158F15] mt-1 font-semibold">+18% growth</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                <p className="text-xs text-[#989898] font-bold uppercase">Total Orders Served</p>
                <h3 className="text-2xl font-bold text-[#2D2F33] mt-1">{restaurant.totalOrders.toLocaleString()}</h3>
                <p className="text-xs text-[#6E727A] mt-1">Across all branches</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                <p className="text-xs text-[#989898] font-bold uppercase">Current License</p>
                <h3 className="text-2xl font-bold text-[#026F4F] mt-1">{restaurant.planName}</h3>
                <p className="text-xs text-[#6E727A] mt-1">Renews: {restaurant.planExpiry}</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                <p className="text-xs text-[#989898] font-bold uppercase">Staff Allocated</p>
                <h3 className="text-2xl font-bold text-[#2D2F33] mt-1">
                  {restaurant.branches.reduce((s, b) => s + b.staffCount, 0)} Members
                </h3>
                <p className="text-xs text-[#6E727A] mt-1">Managers, POS & KDS</p>
              </div>
            </div>

            {/* Owner & Organization Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#2D2F33]">
                  Franchise Owner Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#686868]">Full Name</span>
                    <span className="font-semibold text-[#2D2F33]">{restaurant.ownerName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#686868]">Email</span>
                    <span className="font-semibold text-[#2D2F33]">{restaurant.ownerEmail}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#686868]">Phone</span>
                    <span className="font-semibold text-[#2D2F33]">{restaurant.ownerPhone}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#686868]">Headquarters</span>
                    <span className="font-semibold text-[#2D2F33]">{restaurant.address}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#2D2F33]">
                  Subscription Agreement
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#686868]">Plan Type</span>
                    <span className="font-bold text-[#026F4F]">{restaurant.planType} Tier ({restaurant.planBilling})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#686868]">Billing Amount</span>
                    <span className="font-bold text-[#2D2F33]">${restaurant.planPrice} / {restaurant.planBilling}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#686868]">License Expiration</span>
                    <span className="font-semibold text-[#2D2F33]">{restaurant.planExpiry}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#686868]">Joined Platform</span>
                    <span className="font-semibold text-[#2D2F33]">{restaurant.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Branches List */}
        {activeTab === 'Branches' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#2D2F33]">
                  Branch Locations Directory
                </h3>
                <p className="text-xs text-[#6E727A]">
                  Click on any branch to view detailed operational telemetry, subscription, and live logs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {restaurant.branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-[#2D2F33]">{branch.name}</h4>
                        <p className="text-xs text-[#6E727A] flex items-center gap-1 mt-1">
                          <MapPin size={13} className="text-[#026F4F]" />
                          <span>{branch.address}</span>
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {branch.status}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-[#F8F9FA] rounded-2xl border border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="text-[#989898] font-bold">Staff</p>
                        <p className="text-sm font-bold text-[#2D2F33] mt-0.5">{branch.staffCount}</p>
                      </div>
                      <div>
                        <p className="text-[#989898] font-bold">Orders</p>
                        <p className="text-sm font-bold text-[#026F4F] mt-0.5">{branch.ordersToday}</p>
                      </div>
                      <div>
                        <p className="text-[#989898] font-bold">Sales</p>
                        <p className="text-sm font-bold text-[#2D2F33] mt-0.5">${branch.revenueToday}</p>
                      </div>
                    </div>
                  </div>

                  {/* Drawers Triggers */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setIsBranchDetailsOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#2D2F33] transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setIsBranchSubOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-xs font-bold text-[#026F4F] transition-colors"
                    >
                      Subscription
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setIsBranchActOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-700 transition-colors"
                    >
                      Activity
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Drawers */}
      <BranchDetailsDrawer
        isOpen={isBranchDetailsOpen}
        branch={selectedBranch}
        restaurantName={restaurant.name}
        onClose={() => setIsBranchDetailsOpen(false)}
      />

      <BranchSubscriptionDrawer
        isOpen={isBranchSubOpen}
        branch={selectedBranch}
        restaurantName={restaurant.name}
        onClose={() => setIsBranchSubOpen(false)}
        onModifyPlanClick={() => {
          setIsBranchSubOpen(false);
          setIsActionNotAllowedOpen(true);
        }}
      />

      <BranchActivityDrawer
        isOpen={isBranchActOpen}
        branch={selectedBranch}
        restaurantName={restaurant.name}
        onClose={() => setIsBranchActOpen(false)}
      />

      <ActionNotAllowedModal
        isOpen={isActionNotAllowedOpen}
        onClose={() => setIsActionNotAllowedOpen(false)}
        onCancelRestaurantPlan={() => {
          alert('Overarching restaurant plan cancelled. Individual branch tiers are now unlocked.');
        }}
      />
    </div>
  );
}
