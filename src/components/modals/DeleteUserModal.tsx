'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { AdminUser } from '../../types/admin';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string) => void;
}

export default function DeleteUserModal({
  isOpen,
  user,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Modal Card - 526px x 421px from Figma #2008:359 */}
      <div className="relative bg-white w-full max-w-[526px] rounded-[22px] p-8 shadow-2xl border border-gray-100 z-10 text-center animate-in zoom-in-95 duration-200">
        {/* Warning Icon Graphic */}
        <div className="w-20 h-20 rounded-full bg-red-50 text-[#E52B2B] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-[28px] font-bold text-[#2D2F33] tracking-tight mb-2">
          Delete User
        </h3>

        {/* Description */}
        <p className="text-[17px] text-[#989898] leading-relaxed max-w-sm mx-auto mb-8">
          You are about to delete user <strong className="text-[#2D2F33]">{user.name}</strong>. This action cannot be undone.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[59px] rounded-full bg-[#E9E9E9] hover:bg-gray-300 text-[#2D2F33] font-semibold text-[17px] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(user.id);
              onClose();
            }}
            className="flex-1 h-[59px] rounded-full bg-[#E52B2B] hover:bg-[#c92020] text-white font-semibold text-[17px] shadow-[0px_4px_16px_rgba(229,43,43,0.3)] transition-all cursor-pointer"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
