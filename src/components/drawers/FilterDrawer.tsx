'use client';

import React, { useState } from 'react';
import { X, Filter, Check, RotateCcw } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    status: string[];
    plan: string[];
    dateRange: string;
  }) => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  onApplyFilters,
}: FilterDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['Active']);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('All Time');

  if (!isOpen) return null;

  const toggleStatus = (st: string) => {
    if (selectedStatus.includes(st)) {
      setSelectedStatus(selectedStatus.filter((s) => s !== st));
    } else {
      setSelectedStatus([...selectedStatus, st]);
    }
  };

  const togglePlan = (pl: string) => {
    if (selectedPlans.includes(pl)) {
      setSelectedPlans(selectedPlans.filter((p) => p !== pl));
    } else {
      setSelectedPlans([...selectedPlans, pl]);
    }
  };

  const handleReset = () => {
    setSelectedStatus([]);
    setSelectedPlans([]);
    setDateRange('All Time');
  };

  const handleApply = () => {
    onApplyFilters({
      status: selectedStatus,
      plan: selectedPlans,
      dateRange,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        {/* Drawer - 619px from Figma #1535:769 */}
        <div className="w-screen max-w-[619px] bg-[#F2F2F2] shadow-2xl rounded-l-[24px] flex flex-col justify-between p-8 md:p-10 animate-in slide-in-from-right duration-300">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#026F4F]/10 text-[#026F4F] flex items-center justify-center">
                  <Filter size={20} />
                </div>
                <h2 className="text-[28px] font-bold text-[#2D2F33]">
                  Filters
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-[#686868]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-8 space-y-8">
              {/* Status Filter */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  Account Status
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {['Active', 'Pending', 'Suspended', 'Inactive'].map((st) => {
                    const active = selectedStatus.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStatus(st)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                          active
                            ? 'bg-[#026F4F] text-white shadow-xs'
                            : 'bg-[#F8F9FA] text-[#686868] hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {active && <Check size={14} />}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plan Tiers */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  Subscription Plan Tier
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {['Enterprise Plan', 'Professional Plan', 'Starter Restaurant', 'Basic Branch Plan'].map((pl) => {
                    const active = selectedPlans.includes(pl);
                    return (
                      <button
                        key={pl}
                        type="button"
                        onClick={() => togglePlan(pl)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                          active
                            ? 'bg-[#026F4F] text-white shadow-xs'
                            : 'bg-[#F8F9FA] text-[#686868] hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {active && <Check size={14} />}
                        <span>{pl}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Filter */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  Registration Timeframe
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
                >
                  <option>All Time</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Last 90 Days</option>
                  <option>This Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 h-14 rounded-full border border-gray-300 hover:bg-gray-200 text-sm font-semibold text-[#686868] flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 h-14 bg-[#026F4F] hover:bg-[#01533B] text-white font-semibold text-base rounded-full shadow-lg transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
