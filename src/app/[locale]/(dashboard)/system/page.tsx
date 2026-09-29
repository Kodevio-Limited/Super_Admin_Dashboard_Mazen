'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Topbar from '@/components/Topbar';
import { Server, HeartPulse, Database, Users, Gauge } from 'lucide-react';

// Figma 🗑️ Dump → Group 14 "SIDEBAR NAVIGATION" (node 1230:3225) specifies a
// "7. System Monitoring" section with the sub-sections below. No visual design
// for this screen exists in the file, so this page only wires the navigation
// and lists the specified scope until designs are provided.
const SECTIONS = [
  { key: 'serverStatus', icon: Server },
  { key: 'systemHealth', icon: HeartPulse },
  { key: 'databaseStatus', icon: Database },
  { key: 'activeUsers', icon: Users },
  { key: 'performanceMetrics', icon: Gauge },
] as const;

export default function SystemMonitoringPage() {
  const t = useTranslations('sa.system');

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title={t('title')} subtitle={t('subtitle')} />

      <main className="flex-1 p-8 space-y-8 max-w-[1920px] mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.key}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#F2F2F2] flex items-center justify-center text-[#989898]">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-[#2D2F33] mt-4">{t(`sections.${section.key}`)}</h3>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
