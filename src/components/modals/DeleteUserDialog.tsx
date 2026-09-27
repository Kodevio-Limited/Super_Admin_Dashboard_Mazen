'use client';

import React from 'react';
import { TriangleAlert } from 'lucide-react';
import LeftPanel from '../LeftPanel';

// Source of truth: Figma frame "Delete User" (2008:359).
export default function DeleteUserDialog({
  userName,
  onClose,
  onConfirm,
}: {
  userName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <LeftPanel onClose={onClose} labelledBy="Delete User" widthClass="w-[min(480px,94vw)]">
      <div className="text-center py-4">
        <div className="relative w-28 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 bg-[#FFD60A]"
            style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
          />
          <TriangleAlert
            size={44}
            className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 text-[#E52B2B]"
            strokeWidth={2.4}
          />
        </div>
        <h3 className="text-[28px] font-bold text-[#2D2F33]">Delete User</h3>
        <p className="text-[16px] text-[#989898] leading-relaxed max-w-sm mx-auto mt-3">
          You are about to delete {userName ? <strong>{userName}</strong> : 'this user'}. This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full bg-[#F2F2F2] hover:bg-gray-200 text-[#2D2F33] font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-full bg-[#E52B2B] hover:bg-red-700 text-white font-medium transition-all"
          >
            Delete User
          </button>
        </div>
      </div>
    </LeftPanel>
  );
}
