'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import LeftPanel from '../LeftPanel';
import { FILTER_ROLES } from './UserDetailsModal';

export interface UserFilters {
  roles: string[];
  restaurant: string;
  activeOnly: boolean;
}

// Source of truth: Figma frame "Filters" (1535:769).
export default function UserFilterModal({
  initial,
  restaurants,
  onClose,
  onApply,
}: {
  initial: UserFilters;
  restaurants: string[];
  onClose: () => void;
  onApply: (filters: UserFilters) => void;
}) {
  const [roles, setRoles] = useState<string[]>(initial.roles);
  const [restaurant, setRestaurant] = useState(initial.restaurant);
  const [activeOnly, setActiveOnly] = useState(initial.activeOnly);

  const toggleRole = (r: string) =>
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  return (
    <LeftPanel onClose={onClose} labelledBy="Filters">
      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <button
          onClick={onClose}
          aria-label="Back"
          className="w-12 h-12 rounded-full bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#2D2F33] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="text-2xl font-semibold text-[#2D2F33] text-center pr-12">Filters</h3>
      </div>

      <div className="bg-white rounded-2xl p-5 mt-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-[#2D2F33]">Role</h4>
        <div className="mt-4 space-y-4">
          {FILTER_ROLES.map((r) => (
            <label key={r} className="flex items-center gap-3 cursor-pointer text-[15px] text-[#686868]">
              <input
                type="checkbox"
                checked={roles.includes(r)}
                onChange={() => toggleRole(r)}
                className="w-5 h-5 rounded-md accent-[#026F4F]"
              />
              {r}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mt-4 border border-gray-100 space-y-5">
        <div>
          <h4 className="text-[15px] font-medium text-[#686868]">Restaurant</h4>
          <div className="relative mt-2.5">
            <select
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              className="w-full h-14 px-6 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] appearance-none pr-12 focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30"
            >
              <option value="">All Restaurant</option>
              {restaurants.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#686868] pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-[#2D2F33]">Status</span>
          <button
            type="button"
            role="switch"
            aria-checked={activeOnly}
            aria-label="Active only"
            onClick={() => setActiveOnly(!activeOnly)}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${activeOnly ? 'bg-[#22C55E]' : 'bg-gray-300'}`}
          >
            <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${activeOnly ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => onApply({ roles: [], restaurant: '', activeOnly: false })}
          className="py-3.5 rounded-full border border-gray-300 text-[#2D2F33] font-medium hover:bg-gray-100 transition-all"
        >
          Reset
        </button>
        <button
          onClick={() => onApply({ roles, restaurant, activeOnly })}
          className="py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
        >
          Apply Filters
        </button>
      </div>
    </LeftPanel>
  );
}
