'use client';

import React from 'react';
import { X, MapPin, Phone, Mail, User, Users, Store, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { Branch } from '../../types/admin';

interface BranchDetailsDrawerProps {
  isOpen: boolean;
  branch: Branch | null;
  restaurantName: string;
  onClose: () => void;
}

export default function BranchDetailsDrawer({
  isOpen,
  branch,
  restaurantName,
  onClose,
}: BranchDetailsDrawerProps) {
  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        {/* Drawer - 619px from Figma #1867:1032 */}
        <div className="w-screen max-w-[619px] bg-[#F2F2F2] shadow-2xl rounded-l-[24px] flex flex-col justify-between p-8 md:p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-[28px] font-bold text-[#2D2F33]">
                  Branch Details
                </h2>
                <p className="text-xs text-[#6E727A] mt-0.5">{restaurantName}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-[#686868]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Overview Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs mt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-[#2D2F33]">
                    {branch.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#686868]">
                    <MapPin size={14} className="text-[#026F4F]" />
                    <span>{branch.address}</span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  {branch.status}
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-center">
                <div className="bg-[#F8F9FA] p-3 rounded-xl">
                  <p className="text-[11px] text-[#989898] font-bold uppercase">Staff Count</p>
                  <p className="text-lg font-bold text-[#2D2F33] mt-0.5">{branch.staffCount}</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-xl">
                  <p className="text-[11px] text-[#989898] font-bold uppercase">Orders Today</p>
                  <p className="text-lg font-bold text-[#026F4F] mt-0.5">{branch.ordersToday}</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-xl">
                  <p className="text-[11px] text-[#989898] font-bold uppercase">Revenue Today</p>
                  <p className="text-lg font-bold text-[#2D2F33] mt-0.5">${branch.revenueToday}</p>
                </div>
              </div>
            </div>

            {/* Management & Contact Information */}
            <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                Branch Manager & Contact
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-[#686868] flex items-center gap-2">
                    <User size={16} />
                    Manager Name
                  </span>
                  <span className="font-semibold text-[#2D2F33]">{branch.managerName}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-[#686868] flex items-center gap-2">
                    <Mail size={16} />
                    Manager Email
                  </span>
                  <span className="font-semibold text-[#2D2F33]">{branch.managerEmail}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#686868] flex items-center gap-2">
                    <Phone size={16} />
                    Branch Phone
                  </span>
                  <span className="font-semibold text-[#2D2F33]">{branch.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-14 bg-[#026F4F] hover:bg-[#01533B] text-white font-semibold text-base rounded-full shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
