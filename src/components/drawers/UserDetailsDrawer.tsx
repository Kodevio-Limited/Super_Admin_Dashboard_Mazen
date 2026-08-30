'use client';

import React from 'react';
import Image from 'next/image';
import { X, Mail, Phone, Calendar, Clock, Shield, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { AdminUser } from '../../types/admin';

interface UserDetailsDrawerProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onDeleteClick?: (user: AdminUser) => void;
}

export default function UserDetailsDrawer({
  isOpen,
  user,
  onClose,
  onDeleteClick,
}: UserDetailsDrawerProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        {/* Drawer - 619px from Figma #1537:1210 */}
        <div className="w-screen max-w-[619px] bg-[#F2F2F2] shadow-2xl rounded-l-[24px] flex flex-col justify-between p-8 md:p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <h2 className="text-[28px] font-bold text-[#2D2F33]">
                User Details
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-[#686868]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs mt-6 flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#026F4F]/20 flex-shrink-0 bg-gray-100">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-xl font-bold text-[#2D2F33] truncate">
                  {user.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#026F4F]/10 text-[#026F4F] text-xs font-bold px-2.5 py-1 rounded-md">
                    {user.role}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : user.status === 'Suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  Contact & Organization
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </span>
                    <span className="font-semibold text-[#2D2F33]">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Phone size={16} />
                      Phone
                    </span>
                    <span className="font-semibold text-[#2D2F33]">{user.phone}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Shield size={16} />
                      Restaurant
                    </span>
                    <span className="font-semibold text-[#026F4F]">
                      {user.restaurantName || 'Platform Headquarters'}
                    </span>
                  </div>

                  {user.branchName && (
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-[#686868] flex items-center gap-2">
                        <Shield size={16} />
                        Assigned Branch
                      </span>
                      <span className="font-semibold text-[#2D2F33]">{user.branchName}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Calendar size={16} />
                      Joined Date
                    </span>
                    <span className="font-semibold text-[#2D2F33]">{user.joinedDate}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Clock size={16} />
                      Last Active
                    </span>
                    <span className="font-semibold text-[#2D2F33]">{user.lastActive}</span>
                  </div>
                </div>
              </div>

              {/* Permissions Summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  Assigned Capabilities
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#026F4F] bg-green-50 p-2 rounded-lg font-medium">
                    <CheckCircle2 size={15} />
                    <span>POS Terminal Access</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#026F4F] bg-green-50 p-2 rounded-lg font-medium">
                    <CheckCircle2 size={15} />
                    <span>KDS Station Control</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#026F4F] bg-green-50 p-2 rounded-lg font-medium">
                    <CheckCircle2 size={15} />
                    <span>Orders Audit History</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#026F4F] bg-green-50 p-2 rounded-lg font-medium">
                    <CheckCircle2 size={15} />
                    <span>Menu Price Management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (onDeleteClick) onDeleteClick(user);
              }}
              className="px-6 h-14 rounded-full bg-red-50 hover:bg-red-100 text-[#E52B2B] text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              <span>Delete User</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 bg-[#026F4F] hover:bg-[#01533B] text-white font-semibold text-base rounded-full shadow-lg transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
