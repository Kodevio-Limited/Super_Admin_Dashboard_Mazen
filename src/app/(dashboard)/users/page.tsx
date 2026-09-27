'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Search, ListFilter, Eye, SquarePen } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import UserDetailsModal, { rolePill, roleShort } from '../../../components/modals/UserDetailsModal';
import UserFilterModal, { UserFilters } from '../../../components/modals/UserFilterModal';
import DeleteUserDialog from '../../../components/modals/DeleteUserDialog';
import { getUsers, addUser, updateUser, deleteUser } from '../../../data/userStore';
import { getRestaurants } from '../../../data/restaurantStore';
import { AdminUser } from '../../../types/admin';

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
  lastActive: 'Just now',
};

type DetailsState = { user: AdminUser; isNew: boolean; mode: 'view' | 'edit' } | null;

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ roles: [], restaurant: '', activeOnly: false });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [details, setDetails] = useState<DetailsState>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

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
    setDetails(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Users" subtitle="Manage all users and their access" />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        <div>
          <h2 className="text-3xl font-bold text-[#2D2F33]">Users</h2>
          <p className="text-[#989898] mt-1">Manage all users and their access</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone"
              aria-label="Search users"
              className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            aria-label="Filter users"
            className="w-14 h-14 rounded-full bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors relative"
          >
            <ListFilter size={20} />
            {(filters.roles.length > 0 || filters.restaurant !== '' || filters.activeOnly) && (
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#026F4F]" />
            )}
          </button>
          <button
            onClick={() => setDetails({ user: EMPTY_USER, isNew: true, mode: 'edit' })}
            className="h-14 px-6 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md flex items-center gap-2 transition-all ml-auto"
          >
            <Plus size={20} />
            <span>Add user</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              <div className="grid grid-cols-[minmax(220px,1.6fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_minmax(120px,0.9fr)_minmax(100px,0.7fr)_120px] gap-4 px-6 py-4 bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide">
                <span>User Details</span>
                <span>Role</span>
                <span>Restaurant</span>
                <span>Branch</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {filtered.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-[#989898]">No users match your search or filters.</p>
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
                        <span className="block font-semibold text-[#2D2F33] text-[15px] truncate">{u.name}</span>
                        <span className="block text-xs text-[#989898] truncate">{u.email}</span>
                      </span>
                    </div>
                    <span>
                      <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full ${rolePill(u.role)}`}>
                        {roleShort(u.role)}
                      </span>
                    </span>
                    <span className="text-sm text-[#2D2F33]">{u.restaurantName || '—'}</span>
                    <span className="text-sm text-[#989898]">{u.branchName || '—'}</span>
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
                        {u.status}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <button
                        onClick={() => setDetails({ user: u, isNew: false, mode: 'view' })}
                        aria-label={`View ${u.name}`}
                        className="w-11 h-11 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => setDetails({ user: u, isNew: false, mode: 'edit' })}
                        aria-label={`Edit ${u.name}`}
                        className="w-11 h-11 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors"
                      >
                        <SquarePen size={18} />
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {isFilterOpen && (
        <UserFilterModal
          initial={filters}
          restaurants={restaurants.map((r) => r.name)}
          onClose={() => setIsFilterOpen(false)}
          onApply={(f) => {
            setFilters(f);
            setIsFilterOpen(false);
          }}
        />
      )}

      {details && (
        <UserDetailsModal
          key={`${details.user.id || 'new'}-${details.mode}`}
          user={details.user}
          isNew={details.isNew}
          mode={details.mode}
          restaurants={restaurants.map((r) => ({ name: r.name, branches: r.branches.map((b) => ({ name: b.name })) }))}
          onClose={() => setDetails(null)}
          onSave={saveUser}
          onDeleteRequest={() => {
            setDeleteTarget(details.user);
            setDetails(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteUserDialog
          userName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteUser(deleteTarget.id);
            setUsers(getUsers());
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
