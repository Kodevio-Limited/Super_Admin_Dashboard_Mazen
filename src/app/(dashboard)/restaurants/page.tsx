'use client';

import React, { useState } from 'react';
import { Plus, ChevronUp, ChevronDown, Building2, SquarePen } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import { getRestaurants, addRestaurant } from '../../../data/restaurantStore';
import { Restaurant, Branch } from '../../../types/admin';
import { planPill } from '../../../data/figmaPlans';
import CreateRestaurantModal from '../../../components/modals/CreateRestaurantModal';
import RestaurantFlowModal from '../../../components/modals/RestaurantFlowModal';

// Source of truth: Figma frame "Restaurants" (1856:1628) — grouped
// expandable restaurant/branch table. No search or filters in the frame.
const COLS = 'grid-cols-[minmax(220px,2fr)_minmax(120px,1fr)_minmax(110px,1fr)_minmax(100px,1fr)_minmax(110px,1fr)_minmax(110px,1fr)_64px]';

function Dash() {
  return <span className="text-[#989898]">—</span>;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(getRestaurants);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(getRestaurants().map((r) => [r.id, false]))
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Single flow modal: restaurant edit views vs branch views open distinctly.
  const [flow, setFlow] = useState<{
    restaurantId: string;
    branch?: { id: string; tab: 'Overview' | 'Subscription' | 'Activity' } | null;
  } | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !(prev[id] ?? false) }));

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Restaurant Franchises"
        subtitle="Manage multi-chain restaurant licenses, branch locations, and owner credentials"
      />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#2D2F33]">Restaurants</h2>
            <p className="text-[#989898] mt-1">Manage all restaurants on the platform</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-12 px-6 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md flex items-center gap-2 transition-all"
          >
            <Plus size={20} />
            <span>Create</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              {/* Header */}
              <div className={`grid ${COLS} gap-4 px-6 py-4 bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide`}>
                <span>Restaurants & Owners</span>
                <span>Plans</span>
                <span>Branches</span>
                <span>Status</span>
                <span>Date of Sub</span>
                <span>Sub Until</span>
                <span className="sticky right-0 bg-[#F8F9FA] shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)]">Actions</span>
              </div>

              {restaurants.map((rest) => {
                const isOpen = expanded[rest.id] ?? false;
                return (
                  <div key={rest.id} className="border-t border-gray-100 first:border-t-0">
                    {/* Restaurant group row */}
                    <div className={`grid ${COLS} gap-4 px-6 py-5 items-center`}>
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggle(rest.id)}
                          aria-label={isOpen ? 'Collapse branches' : 'Expand branches'}
                          className="mt-1 text-[#2D2F33] hover:text-[#026F4F] transition-colors"
                        >
                          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <div>
                          <p className="font-semibold text-[#2D2F33] text-[17px]">{rest.name}</p>
                          <p className="text-sm text-[#989898] mt-0.5">
                            {rest.ownerName} <span className="ml-3">{rest.ownerEmail}</span>
                          </p>
                        </div>
                      </div>
                      <Dash />
                      <span className="flex items-center gap-1.5 text-sm text-[#686868]">
                        <Building2 size={16} />
                        {rest.branches.length} Branches
                      </span>
                      <Dash />
                      <Dash />
                      <Dash />
                      <span className="sticky right-0 bg-white shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)] flex justify-end">
                        <button
                          onClick={() => setFlow({ restaurantId: rest.id })}
                          aria-label={`Edit ${rest.name}`}
                          className="w-11 h-11 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors"
                        >
                          <SquarePen size={18} />
                        </button>
                      </span>
                    </div>

                    {/* Branch rows */}
                    {isOpen && (
                      <div className="mx-4 sm:mx-6 mb-4 bg-[#F8F9FA] rounded-2xl px-6 py-2 divide-y divide-gray-200/70">
                        {rest.branches.map((branch) => {
                          const pill = planPill(rest.planName);
                          return (
                            <div key={branch.id} className={`grid ${COLS} gap-4 py-4 items-center`}>
                              <p className="font-semibold text-[#2D2F33] uppercase text-[15px]">
                                {branch.name}
                              </p>
                              <div>
                                <span className={`inline-block text-sm font-medium px-4 py-1.5 rounded-full ${pill.classes}`}>
                                  {pill.label}
                                </span>
                                <p className="text-[15px] font-bold text-[#2D2F33] mt-1.5">
                                  ${rest.planPrice.toLocaleString()}{' '}
                                  <span className="text-xs font-normal text-[#989898]">
                                    / {rest.planBilling.toLowerCase()}
                                  </span>
                                </p>
                              </div>
                              <Dash />
                              <span>
                                <span
                                  className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                                    rest.status === 'Active'
                                      ? 'bg-[#D9F5D9] text-[#158F15]'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {rest.status}
                                </span>
                              </span>
                              <span className="text-sm text-[#2D2F33]">{rest.joinedDate}</span>
                              <span className="text-sm text-[#2D2F33]">{rest.planExpiry}</span>
                              <span className="sticky right-0 bg-[#F8F9FA] shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)] flex justify-end">
                                <button
                                  onClick={() =>
                                    setFlow({
                                      restaurantId: rest.id,
                                      branch: { id: branch.id, tab: 'Overview' },
                                    })
                                  }
                                  aria-label={`Edit ${branch.name}`}
                                  className="w-11 h-11 rounded-lg bg-[#E9E9E9] hover:bg-gray-300 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors"
                                >
                                  <SquarePen size={18} />
                                </button>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <CreateRestaurantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newRest) => {
          addRestaurant(newRest);
          setRestaurants(getRestaurants());
          setExpanded((prev) => ({ ...prev, [newRest.id]: true }));
        }}
        onViewRestaurant={(id) => setFlow({ restaurantId: id })}
      />

      {flow && (
        <RestaurantFlowModal
          key={`${flow.restaurantId}-${flow.branch?.id || 'rest'}`}
          restaurantId={flow.restaurantId}
          initialBranch={flow.branch || null}
          onClose={() => {
            setFlow(null);
            setRestaurants(getRestaurants());
          }}
        />
      )}
    </div>
  );
}
