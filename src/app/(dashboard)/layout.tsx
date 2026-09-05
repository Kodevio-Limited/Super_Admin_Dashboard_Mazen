import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F2F2F2] flex">
      {/* Fixed Sidebar Navigation */}
      <Sidebar />

      {/* Main Dynamic View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden max-md:pt-14">
        {children}
      </div>
    </div>
  );
}
