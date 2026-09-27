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
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Order + labels follow Figma 🗑️ Dump → Group 14 "SIDEBAR NAVIGATION" (node 1230:3225):
  // Dashboard, Restaurants, Subscriptions, Users, Revenue & Reports, System Monitoring, Settings.
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Restaurants', href: '/restaurants', icon: Store },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Revenue & Reports', href: '/revenue', icon: BarChart3 },
    { name: 'System Monitoring', href: '/system', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarContent = (inOverlay = false) => (
    <>
      {/* Brand & Navigation */}
      <div className="space-y-8">
        {/* Brand row with collapse toggle (Owner dashboard pattern) */}
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="relative w-[130px] h-[38px] flex-shrink-0">
            <Image
              src="/images/logo-69e842.png"
              alt="Restaurant Ecosystem"
              fill
              className="object-contain"
              priority
            />
          </div>
          <button
            onClick={inOverlay ? () => setMobileOpen(false) : onToggleCollapsed}
            aria-label={inOverlay ? 'Close menu' : 'Collapse sidebar'}
            title={inOverlay ? 'Close menu' : 'Collapse sidebar'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#989898] transition-colors hover:bg-[#F2F2F2] hover:text-[#2D2F33]"
          >
            <X size={18} />
          </button>
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

      {/* Bottom Logout */}
      <div className="pt-6 border-t border-gray-100">
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
      {/* Mobile hamburger button (tablet uses the icon rail instead) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100"
      >
        <Menu size={20} className="text-[#2D2F33]" />
      </button>

      {/* Collapsible sidebar (tablet + desktop) — full labels or icon rail */}
      <aside
        className={`hidden md:flex bg-white h-screen flex-col justify-between sticky top-0 z-40 flex-shrink-0 border-r border-gray-100/80 transition-all duration-300 ${
          collapsed ? 'w-[76px] items-center py-6' : 'w-[280px] p-6'
        }`}
      >
        {collapsed ? (
          <>
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-[40px] h-[40px]">
                <Image
                  src="/images/logo-69e842.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <button
                onClick={onToggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#989898] transition-colors hover:bg-[#F2F2F2] hover:text-[#2D2F33]"
              >
                <Menu size={18} />
              </button>
              <nav className="flex flex-col items-center gap-3 mt-4">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={item.name}
                      aria-label={item.name}
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
              aria-label="Sign Out"
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#E52B2B] hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
            </Link>
          </>
        ) : (
          sidebarContent()
        )}
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
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
