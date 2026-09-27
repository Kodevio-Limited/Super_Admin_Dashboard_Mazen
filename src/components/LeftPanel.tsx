'use client';

import React from 'react';

// Shared slide-in panel shell (overlay + close behavior).
// All app modals slide in from the right.
interface SlidePanelProps {
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  widthClass?: string;
  side?: 'left' | 'right';
  // Gray canvas (Figma detail frames) keeps white cards visible.
  tone?: 'white' | 'gray';
}

export default function LeftPanel({
  onClose,
  children,
  labelledBy,
  widthClass = 'w-[min(560px,94vw)]',
  side = 'right',
  tone = 'white',
}: SlidePanelProps) {
  const right = side === 'right';
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
        className={`fixed inset-y-0 ${right ? 'right-0 rounded-l-3xl animate-in slide-in-from-right' : 'left-0 rounded-r-3xl animate-in slide-in-from-left'} ${widthClass} ${tone === 'gray' ? 'bg-[#F2F2F2]' : 'bg-white'} shadow-2xl overflow-y-auto p-6 sm:p-8 duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
