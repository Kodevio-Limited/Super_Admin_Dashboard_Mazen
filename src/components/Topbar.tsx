'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Bell } from 'lucide-react';

interface TopbarProps {
  // Kept so existing pages don't change; the Figma topbar (frame 1224:1934)
  // shows no page title — search left, notification + profile right.
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title: _title, subtitle: _subtitle }: TopbarProps) {
  void _title;
  void _subtitle;

  return (
    <header className="sticky top-4 z-30 mx-4 sm:mx-6 xl:mx-8 mt-4 bg-white rounded-2xl border border-gray-100/80 shadow-sm pl-16 pr-4 sm:px-6 py-4 flex items-center justify-between gap-4">
      {/* Left: Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
        <input
          type="text"
          placeholder="Search..."
          aria-label="Search"
          className="w-full h-12 pl-12 pr-4 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all"
        />
      </div>

      {/* Right: Notification + Profile with name */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          title="Notifications"
          aria-label="Notifications"
          className="relative w-12 h-12 rounded-full bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-[#E52B2B]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer">
            <Image
              src="/images/avatar.png"
              alt="Elena Rostova"
              fill
              className="object-cover"
            />
          </div>
          <div className="leading-tight hidden min-[400px]:block">
            <p className="text-[15px] font-semibold text-[#2D2F33] whitespace-nowrap">
              Elena Rostova
            </p>
            <p className="text-xs text-[#6E727A] whitespace-nowrap hidden sm:block">
              elena@superadmin.com
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
