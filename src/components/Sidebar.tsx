'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  CreditCard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Restaurants', href: '/restaurants', icon: Store },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Revenue & Reports', href: '/revenue', icon: BarChart3 },
    { name: 'Subscription', href: '/subscriptions', icon: CreditCard },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Brand & Navigation */}
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="relative w-[130px] h-[38px]">
            <Image
              src="/images/logo-69e842.png"
              alt="Restaurant Ecosystem"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="bg-[#026F4F]/10 text-[#026F4F] text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Admin
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-[16px] font-medium transition-all group ${
                  active
                    ? 'bg-[#026F4F] text-white shadow-[0px_4px_12px_rgba(2,111,79,0.2)]'
                    : 'text-[#686868] hover:text-[#2D2F33] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={22}
                    className={active ? 'text-white' : 'text-[#989898] group-hover:text-[#2D2F33] transition-colors'}
                  />
                  <span>{item.name}</span>
                </div>
                {active && <ChevronRight size={16} className="text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3.5 p-2 bg-[#F8F9FA] rounded-2xl border border-gray-100">
          <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
            <Image
              src="/images/avatar.png"
              alt="Elena Rostova"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#2D2F33] truncate">
              Elena Rostova
            </h4>
            <p className="text-xs text-[#026F4F] font-medium flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Super Admin</span>
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#E52B2B] hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100"
      >
        <Menu size={20} className="text-[#2D2F33]" />
      </button>

      {/* Desktop sidebar (≥1024px: full, 768-1024px: collapsed icon-only) */}
      <aside className="hidden lg:flex w-[280px] bg-white h-screen flex-col justify-between p-6 border-r border-gray-100/80 sticky top-0 z-40 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Tablet sidebar (768-1024px: icon-only collapsed) */}
      <aside className="hidden md:flex lg:hidden w-[76px] bg-white h-screen flex-col items-center justify-between py-6 border-r border-gray-100/80 sticky top-0 z-40 flex-shrink-0">
        {/* Logo only */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-[40px] h-[40px]">
            <Image
              src="/images/logo-69e842.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <nav className="flex flex-col items-center gap-3">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    active
                      ? 'bg-[#026F4F] text-white shadow-md'
                      : 'text-[#989898] hover:bg-gray-50 hover:text-[#2D2F33]'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          href="/login"
          title="Sign Out"
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#E52B2B] hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
        </Link>
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-white flex flex-col justify-between p-6 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <X size={16} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
