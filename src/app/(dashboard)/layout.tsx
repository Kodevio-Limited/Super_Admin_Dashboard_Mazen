'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Start collapsed on tablet widths so the first paint matches the
  // icon-rail layout (applied post-mount to avoid hydration mismatch).
  useEffect(() => {
    if (window.innerWidth < 1024) setCollapsed(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex">
      {/* Fixed Sidebar Navigation */}
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />

      {/* Main Dynamic View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden max-md:pt-14">
        {children}
      </div>
    </div>
  );
}
