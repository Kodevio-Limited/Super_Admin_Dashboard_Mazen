'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Bell, Calendar, Sparkles } from 'lucide-react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="w-full bg-white px-8 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100/80 sticky top-0 z-30">
      {/* Left: Page Title / Breadcrumb */}
      <div>
        {title && (
          <h1 className="text-2xl font-bold text-[#2D2F33] tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-sm text-[#6E727A] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: Search, Date, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-72 md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#989898]" />
          <input
            type="text"
            placeholder="Search restaurants, users, ledger..."
            className="w-full h-11 pl-11 pr-4 bg-[#F8F9FA] border border-gray-200 focus:border-[#026F4F] focus:bg-white rounded-full text-sm text-[#2D2F33] focus:outline-none transition-all"
          />
        </div>

        {/* Date Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-[#F2F2F2] px-4 py-2 rounded-full text-xs font-semibold text-[#686868]">
          <Calendar size={14} className="text-[#026F4F]" />
          <span>{currentDate}</span>
        </div>

        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-[#DCFCE7] text-[#15803D] px-3.5 py-1.5 rounded-full text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15803D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803D]"></span>
          </span>
          <span>Ecosystem Online</span>
        </div>

        {/* Notification Icon */}
        <button
          title="Notifications"
          className="relative w-11 h-11 rounded-full bg-[#F8F9FA] hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-[#686868] transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E52B2B]" />
        </button>

        {/* Profile Avatar */}
        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#026F4F]/20 cursor-pointer">
          <Image
            src="/images/avatar.png"
            alt="Admin"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
}
