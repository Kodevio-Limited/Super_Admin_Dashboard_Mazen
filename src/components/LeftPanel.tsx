'use client';

import React from 'react';

// Shared left slide-in panel shell (overlay + close behavior).
interface LeftPanelProps {
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  widthClass?: string;
}

export default function LeftPanel({
  onClose,
  children,
  labelledBy,
  widthClass = 'w-[min(560px,94vw)]',
}: LeftPanelProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 transition-opacity animate-in fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy}
        className={`fixed inset-y-0 left-0 ${widthClass} bg-white shadow-2xl rounded-r-3xl overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-left duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
