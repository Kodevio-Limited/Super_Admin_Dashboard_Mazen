'use client';

import React from 'react';
import Image from 'next/image';
import { X, Mail, Phone, Calendar, Clock, Shield, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { AdminUser } from '../../types/admin';
import { locField } from '@/lib/localize';

interface UserDetailsDrawerProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onDeleteClick?: (user: AdminUser) => void;
}

export default function UserDetailsDrawer({
  isOpen,
  user,
  onClose,
  onDeleteClick,
}: UserDetailsDrawerProps) {
  const t = useTranslations('sa.userDrawer');
  const ts = useTranslations('common.status');
  const tr = useTranslations('common.roles');
  const locale = useLocale();
  if (!isOpen || !user) return null;
  const roleLabel =
    user.role === 'Super Admin' ? tr('superAdmin')
    : user.role === 'Restaurant Owner' ? tr('restaurantOwner')
    : user.role === 'Branch Manager' ? tr('branchManager')
    : user.role === 'Cashier' ? tr('cashier')
    : tr('kitchenStaff');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" />

      <div className="fixed inset-y-0 end-0 max-w-full flex">
        {/* Drawer - 619px from Figma #1537:1210 */}
        <div className="w-screen max-w-[619px] bg-[#F2F2F2] shadow-2xl rounded-s-[24px] flex flex-col justify-between p-8 md:p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <h2 className="text-[28px] font-bold text-[#2D2F33]">
                {t('title')}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-[#686868]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs mt-6 flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#026F4F]/20 flex-shrink-0 bg-gray-100">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-xl font-bold text-[#2D2F33] truncate">
                  <bdi>{locField(locale, user, 'name')}</bdi>
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#026F4F]/10 text-[#026F4F] text-xs font-bold px-2.5 py-1 rounded-md">
                    {roleLabel}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : user.status === 'Suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.status === 'Active' ? ts('active') : user.status === 'Suspended' ? ts('suspended') : ts('inactive')}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  {t('contactTitle')}
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Mail size={16} />
                      {t('email')}
                    </span>
                    <span className="font-semibold text-[#2D2F33]"><bdi dir="ltr">{user.email}</bdi></span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Phone size={16} />
                      {t('phone')}
                    </span>
                    <span className="font-semibold text-[#2D2F33]"><bdi dir="ltr">{user.phone}</bdi></span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Shield size={16} />
                      {t('restaurant')}
                    </span>
                    <span className="font-semibold text-[#026F4F]">
                      {locField(locale, user, 'restaurantName') || t('headquarters')}
                    </span>
                  </div>

                  {user.branchName && (
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-[#686868] flex items-center gap-2">
                        <Shield size={16} />
                        {t('assignedBranch')}
                      </span>
                      <span className="font-semibold text-[#2D2F33]">{locField(locale, user, 'branchName')}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Calendar size={16} />
                      {t('joinedDate')}
                    </span>
                    <span className="font-semibold text-[#2D2F33]">{locField(locale, user, 'joinedDate')}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#686868] flex items-center gap-2">
                      <Clock size={16} />
                      {t('lastActive')}
                    </span>
                    <span className="font-semibold text-[#2D2F33]">{locField(locale, user, 'lastActive')}</span>
                  </div>
                </div>
              </div>

              {/* Permissions Summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  {t('capabilitiesTitle')}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#026F4F] bg-green-50 p-2 rounded-lg font-medium">
                    <CheckCircle2 size={15} />
                    <span>{t('permPos')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#026F4F] bg-green-50 p-2 rounded-lg font-medium">
                    <CheckCircle2 size={15} />
                    <span>{t('permKds')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#026F4F] bg-green-50 p-2 rounded-lg font-medium">
                    <CheckCircle2 size={15} />
                    <span>{t('permOrders')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#026F4F] bg-green-50 p-2 rounded-lg font-medium">
                    <CheckCircle2 size={15} />
                    <span>{t('permMenu')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (onDeleteClick) onDeleteClick(user);
              }}
              className="px-6 h-14 rounded-full bg-red-50 hover:bg-red-100 text-[#E52B2B] text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              <span>{t('deleteUser')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 bg-[#026F4F] hover:bg-[#01533B] text-white font-semibold text-base rounded-full shadow-lg transition-all"
            >
              {t('closeDetails')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
