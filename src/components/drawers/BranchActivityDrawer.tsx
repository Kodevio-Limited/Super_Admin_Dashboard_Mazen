'use client';

import React from 'react';
import { X, Clock, Activity, User, CheckCircle2 } from 'lucide-react';
import { Branch } from '../../types/admin';

interface BranchActivityDrawerProps {
  isOpen: boolean;
  branch: Branch | null;
  restaurantName: string;
  onClose: () => void;
}

export default function BranchActivityDrawer({
  isOpen,
  branch,
  restaurantName,
  onClose,
}: BranchActivityDrawerProps) {
  if (!isOpen || !branch) return null;

  const activities = branch.activities || [
    { id: '1', time: '11:30 AM', description: 'Kitchen station active tickets cleared', user: 'Kitchen Team' },
    { id: '2', time: '10:00 AM', description: 'Cashier shift opened with $250 float', user: 'Cashier 01' },
    { id: '3', time: '09:00 AM', description: 'Branch opened for business', user: branch.managerName },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        {/* Drawer - 619px from Figma #1867:1244 */}
        <div className="w-screen max-w-[619px] bg-[#F2F2F2] shadow-2xl rounded-l-[24px] flex flex-col justify-between p-8 md:p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-[28px] font-bold text-[#2D2F33]">
                  Branch Activity Log
                </h2>
                <p className="text-xs text-[#6E727A] mt-0.5">{branch.name} • {restaurantName}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-[#686868]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Timeline */}
            <div className="mt-8 space-y-4">
              {activities.map((act, i) => (
                <div key={act.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#026F4F]/10 text-[#026F4F] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#026F4F] flex items-center gap-1">
                        <User size={12} />
                        {act.user}
                      </span>
                      <span className="text-xs text-[#989898] flex items-center gap-1">
                        <Clock size={12} />
                        {act.time}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#2D2F33] mt-1.5 leading-snug">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-14 bg-[#026F4F] hover:bg-[#01533B] text-white font-semibold text-base rounded-full shadow-lg transition-all"
            >
              Close Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
