'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Topbar from '../../../components/Topbar';
import {
  Store,
  Plus,
  Search,
  Filter as FilterIcon,
  ArrowRight,
  MapPin,
  Users,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { mockRestaurants } from '../../../data/mockData';
import { Restaurant } from '../../../types/admin';
import CreateRestaurantModal from '../../../components/modals/CreateRestaurantModal';
import FilterDrawer from '../../../components/drawers/FilterDrawer';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ status: string[]; plan: string[]; dateRange: string }>({
    status: [],
    plan: [],
    dateRange: 'All Time',
  });

  const filteredRestaurants = restaurants.filter((rest) => {
    const matchesSearch =
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      activeFilters.status.length === 0 || activeFilters.status.includes(rest.status);

    const matchesPlan =
      activeFilters.plan.length === 0 || activeFilters.plan.includes(rest.planName);

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Restaurant Franchises"
        subtitle="Manage multi-chain restaurant licenses, branch locations, and owner credentials"
      />

      <main className="flex-1 p-8 space-y-8 max-w-[1920px] mx-auto w-full">
        {/* Controls Header */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#989898]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant name, owner, or email..."
              className="w-full h-12 pl-11 pr-4 bg-[#F8F9FA] border border-gray-200 focus:border-[#026F4F] focus:bg-white rounded-full text-sm text-[#2D2F33] focus:outline-none transition-all"
            />
          </div>

          {/* Filter & Add Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="h-12 px-5 rounded-full border border-gray-200 hover:border-[#026F4F] text-[#2D2F33] text-sm font-semibold flex items-center gap-2 transition-colors bg-white"
            >
              <FilterIcon size={16} />
              <span>Filters</span>
              {(activeFilters.status.length > 0 || activeFilters.plan.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-[#026F4F]" />
              )}
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-12 px-6 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Plus size={18} />
              <span>Add Restaurant</span>
            </button>
          </div>
        </div>

        {/* Restaurants Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRestaurants.map((rest) => (
            <div
              key={rest.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                      <Image src={rest.logo} alt={rest.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2D2F33]">{rest.name}</h3>
                      <p className="text-xs text-[#6E727A]">{rest.category}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      rest.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {rest.status}
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-[#686868]">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#026F4F] flex-shrink-0" />
                    <span className="truncate">{rest.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#026F4F] flex-shrink-0" />
                    <span>Owner: <strong>{rest.ownerName}</strong> ({rest.ownerEmail})</span>
                  </div>
                </div>

                {/* Branches Preview Pill */}
                <div className="mt-5 p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#6E727A]">Active Branches</span>
                  <span className="text-[#026F4F] font-bold">{rest.branches.length} Locations</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#989898] font-bold uppercase">Plan Tier</span>
                  <p className="text-sm font-bold text-[#2D2F33]">{rest.planName}</p>
                </div>

                <Link
                  href={`/restaurants/${rest.id}`}
                  className="px-5 py-2.5 rounded-full bg-green-50 hover:bg-[#026F4F] text-[#026F4F] hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>Manage Details</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals & Drawers */}
      <CreateRestaurantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newRest) => setRestaurants([newRest, ...restaurants])}
      />

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApplyFilters={setActiveFilters}
      />
    </div>
  );
}
