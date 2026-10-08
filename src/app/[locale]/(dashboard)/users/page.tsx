'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Search, ListFilter, Trash2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import UserDetailsModal, { rolePill, roleShort } from '@/components/modals/UserDetailsModal';
import UserFilterModal, { UserFilters } from '@/components/modals/UserFilterModal';
import DeleteUserDialog from '@/components/modals/DeleteUserDialog';
import { getUsers, addUser, updateUser, deleteUser } from '@/data/userStore';
import { getRestaurants } from '@/data/restaurantStore';
import { AdminUser } from '@/types/admin';
import { locField, pickAr } from '@/lib/localize';
import { useQueryModal, readQueryParam, writeQueryParam } from '@/lib/use-query-modal';

// Source of truth: Figma frame "Users" (1527:3912).
// Role checkboxes map onto data roles: Admin → Super Admin + Restaurant Owner.
function roleMatches(role: AdminUser['role'], selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.some((f) => {
    switch (f) {
      case 'Admin':
        return role === 'Super Admin' || role === 'Restaurant Owner';
      case 'Manager':
        return role === 'Branch Manager';
      case 'Cashier':
        return role === 'Cashier';
      case 'Kitchen Staff':
        return role === 'Kitchen Staff';
      default:
        return false;
    }
  });
}

const EMPTY_USER: AdminUser = {
  id: '',
  name: '',
  email: '',
  phone: '',
  avatar: '/images/avatar.png',
  role: 'Branch Manager',
  status: 'Active',
  joinedDate: 'Just now',
  joinedDate_ar: 'الآن',
  lastActive: 'Just now',
  lastActive_ar: 'الآن',
};

type DetailsState = { user: AdminUser; isNew: boolean; mode: 'view' | 'edit' } | null;

export default function UsersPage() {
  const t = useTranslations('sa.users');
  const tc = useTranslations('common.actions');
  const ts = useTranslations('common.status');
  const tr = useTranslations('common.roles');
  const locale = useLocale();
  const [users, setUsers] = useState<AdminUser[]>(getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ roles: [], restaurant: '', activeOnly: false });
  // Query-driven overlays: ?modal=user-filter, ?modal=user-details&id=, ?modal=delete-user&id=
  const [filterOpen, setFilterOpen] = useQueryModal('user-filter');
  const [detailsOpen, setDetailsOpen] = useQueryModal('user-details');
  const [deleteOpen, setDeleteOpen] = useQueryModal('delete-user');
  const [details, setDetails] = useState<DetailsState>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const openDetails = (user: AdminUser, isNew: boolean, mode: 'view' | 'edit') => {
    setDetails({ user, isNew, mode });
    writeQueryParam('id', user.id || null, false);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setDetails(null);
    setDetailsOpen(false);
    writeQueryParam('id', null, false);
  };
  const openDelete = (user: AdminUser) => {
    setDeleteTarget(user);
    writeQueryParam('id', user.id, false);
    setDeleteOpen(true);
  };
  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteOpen(false);
    writeQueryParam('id', null, false);
  };

  // Cold load: restore details/delete targets from ?modal=&id=
  useEffect(() => {
    const modal = readQueryParam('modal');
    if (modal !== 'user-details' && modal !== 'delete-user') return;
    const id = readQueryParam('id');
    if (!id) return;
    const found = getUsers().find((u) => u.id === id);
    if (!found) return;
    if (modal === 'user-details') setDetails({ user: found, isNew: false, mode: 'edit' });
    else setDeleteTarget(found);
  }, []);

  const restaurants = getRestaurants();

  const filtered = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q);
    const matchesRestaurant = filters.restaurant === '' || u.restaurantName === filters.restaurant;
    const matchesStatus = !filters.activeOnly || u.status === 'Active';
    return matchesSearch && roleMatches(u.role, filters.roles) && matchesRestaurant && matchesStatus;
  });

  const saveUser = (user: AdminUser) => {
    if (details?.isNew) addUser(user);
    else updateUser(user.id, user);
    setUsers(getUsers());
    closeDetails();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title={t('title')} subtitle={t('subtitle')} />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        <div>
          <h2 className="text-3xl font-bold text-[#2D2F33]">{t('title')}</h2>
          <p className="text-[#989898] mt-1">{t('subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="absolute start-5 top-1/2 -translate-y-1/2 text-[#989898]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('title')}
              className="w-full h-14 ps-12 pe-4 bg-white border border-gray-200 rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all"
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            aria-label={t('filterUser')}
            className="w-14 h-14 rounded-full bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors relative"
          >
            <ListFilter size={20} />
            {(filters.roles.length > 0 || filters.restaurant !== '' || filters.activeOnly) && (
              <span className="absolute top-3 end-3 w-2 h-2 rounded-full bg-[#026F4F]" />
            )}
          </button>
          <button
            onClick={() => openDetails(EMPTY_USER, true, 'edit')}
            className="h-14 px-6 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md flex items-center gap-2 transition-all ms-auto"
          >
            <Plus size={20} />
            <span>{t('addNewCta')}</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              <div className="grid grid-cols-[minmax(220px,1.6fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_minmax(120px,0.9fr)_minmax(100px,0.7fr)_120px] gap-4 px-6 py-4 bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
                <span>{t('columns.userDetails')}</span>
                <span>{t('columns.role')}</span>
                <span>{t('columns.restaurant')}</span>
                <span>{t('columns.branch')}</span>
                <span>{t('columns.status')}</span>
                <span className="text-center">{t('columns.actions')}</span>
              </div>
              {filtered.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-[#989898]">{t('noUsersMatch')}</p>
              ) : (
                filtered.map((u) => (
                  <div
                    key={u.id}
                    className="grid grid-cols-[minmax(220px,1.6fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_minmax(120px,0.9fr)_minmax(100px,0.7fr)_120px] gap-4 px-6 py-4 items-center border-t border-gray-100 first:border-t-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={u.avatar || '/images/avatar.png'} alt={u.name} fill className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#2D2F33] text-[15px] truncate"><bdi dir={locale === 'ar' && u.name_ar && u.name_ar !== u.name ? undefined : 'ltr'}>{locField(locale, u, 'name')}</bdi></span>
                        <span className="block text-xs text-[#989898] truncate"><bdi dir="ltr">{u.email}</bdi></span>
                      </span>
                    </div>
                    <span>
                      <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full ${rolePill(u.role)}`}>
                        {roleShort(u.role, locale)}
                      </span>
                    </span>
                    <span className="text-sm text-[#2D2F33]">{locField(locale, u, 'restaurantName') || '—'}</span>
                    <span className="text-sm text-[#989898]">{locField(locale, u, 'branchName') || '—'}</span>
                    <span>
                      <span
                        className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                          u.status === 'Active'
                            ? 'bg-[#D9F5D9] text-[#158F15]'
                            : u.status === 'Suspended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-[#686868]'
                        }`}
                      >
                        {u.status === 'Active' ? ts('active') : u.status === 'Suspended' ? ts('suspended') : ts('inactive')}
                      </span>
                    </span>
                    <span className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openDetails(u, false, 'edit')}
                        aria-label={t('editUser', { name: u.name })}
                        className="w-11 h-11 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors"
                      >
                        <Image src="/images/figma/pencil.svg" alt="" width={18} height={18} className="size-[18px]" />
                      </button>
                      {/* Bug-19: row delete with confirm (action can't be undone). */}
                      <button
                        onClick={() => openDelete(u)}
                        aria-label={`${tc('delete')} ${u.name}`}
                        className="w-11 h-11 rounded-lg bg-[#FDECEC] hover:bg-[#E85E5E] flex items-center justify-center text-[#E85E5E] hover:text-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {filterOpen && (
        <UserFilterModal
          initial={filters}
          restaurants={restaurants.map((r) => ({ value: r.name, label: locField(locale, r, 'name') }))}
          onClose={() => setFilterOpen(false)}
          onApply={(f) => {
            setFilters(f);
            setFilterOpen(false);
          }}
        />
      )}

      {detailsOpen && details && (
        <UserDetailsModal
          key={`${details.user.id || 'new'}-${details.mode}`}
          user={details.user}
          isNew={details.isNew}
          mode={details.mode}
          restaurants={restaurants.map((r) => ({ name: r.name, name_ar: r.name_ar, branches: r.branches.map((b) => ({ name: b.name, name_ar: b.name_ar })) }))}
          onClose={closeDetails}
          onSave={saveUser}
          onDeleteRequest={() => {
            const target = details.user;
            closeDetails();
            openDelete(target);
          }}
        />
      )}

      {deleteOpen && deleteTarget && (
        <DeleteUserDialog
          userName={deleteTarget.name}
          onClose={closeDelete}
          onConfirm={() => {
            deleteUser(deleteTarget.id);
            setUsers(getUsers());
            closeDelete();
          }}
        />
      )}
    </div>
  );
}
