'use client';

import React from 'react';
import Topbar from '../../../components/Topbar';
import { Settings, SlidersHorizontal, Flag, Bell, ShieldCheck, Database } from 'lucide-react';

// Figma 🗑️ Dump → Group 14 "SIDEBAR NAVIGATION" (node 1230:3225) specifies an
// "8. Settings" section with the sub-sections below. No visual design for this
// screen exists in the file, so this page only wires the navigation and lists
// the specified scope until designs are provided.
const SECTIONS = [
  { name: 'Platform Settings', icon: SlidersHorizontal },
  { name: 'Feature Flags', icon: Flag },
  { name: 'Notifications', icon: Bell },
  { name: 'Security', icon: ShieldCheck },
  { name: 'Backup Management', icon: Database },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Settings"
        subtitle="Platform configuration, access controls, and operational preferences"
      />

      <main className="flex-1 p-8 space-y-8 max-w-[1920px] mx-auto w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-3">
          <Settings size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-[#2D2F33] text-sm">Design pending</h3>
            <p className="text-xs text-[#6E727A] mt-1">
              Figma only defines this section&apos;s information architecture (Dump → Group 14).
              No forms, toggles, or settings components are specified yet — this placeholder
              holds the navigation slot until designs are provided.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.name}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs opacity-80"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#F2F2F2] flex items-center justify-center text-[#989898]">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-[#2D2F33] mt-4">{section.name}</h3>
                <p className="text-xs text-[#989898] mt-1">No design specified</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
