'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Topbar from '../../../components/Topbar';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Eye,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { mockUsers } from '../../../data/mockData';
import { AdminUser, UserRole } from '../../../types/admin';
import UserDetailsDrawer from '../../../components/drawers/UserDetailsDrawer';
import DeleteUserModal from '../../../components/modals/DeleteUserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Modals / Drawers
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const roles = [
    'All',
    'Restaurant Owner',
    'Branch Manager',
    'Cashier',
    'Kitchen Staff',
    'Super Admin',
  ];

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.restaurantName && u.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  const handleDeleteConfirm = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="User & Staff Management"
        subtitle="Control system roles, restaurant staff allocations, and security privileges"
      />

      <main className="flex-1 p-8 space-y-8 max-w-[1920px] mx-auto w-full">
        {/* Top Controls */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#989898]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name, email, or restaurant..."
              className="w-full h-12 pl-11 pr-4 bg-[#F8F9FA] border border-gray-200 focus:border-[#026F4F] focus:bg-white rounded-full text-sm text-[#2D2F33] focus:outline-none transition-all"
            />
          </div>

          <div className="text-sm font-semibold text-[#6E727A]">
            Showing <strong className="text-[#2D2F33]">{filteredUsers.length}</strong> registered users
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedRole === role
                  ? 'bg-[#026F4F] text-white shadow-xs'
                  : 'bg-white text-[#686868] hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-[#989898] uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Assigned Entity</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#2D2F33]">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[#2D2F33]">{user.name}</p>
                          <p className="text-xs text-[#6E727A] flex items-center gap-1">
                            <Clock size={12} /> {user.lastActive}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="bg-[#026F4F]/10 text-[#026F4F] text-xs font-bold px-3 py-1 rounded-full">
                        {user.role}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-[#2D2F33]">
                        {user.restaurantName || 'Platform Headquarters'}
                      </p>
                      {user.branchName && (
                        <p className="text-xs text-[#6E727A]">{user.branchName}</p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-medium text-[#2D2F33]">{user.email}</p>
                      <p className="text-xs text-[#6E727A]">{user.phone}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : user.status === 'Suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailsDrawerOpen(true);
                          }}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-[#026F4F] hover:text-white text-[#686868] transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-red-50 hover:bg-[#E52B2B] hover:text-white text-[#E52B2B] transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* User Details Drawer */}
      <UserDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        user={selectedUser}
        onClose={() => setIsDetailsDrawerOpen(false)}
        onDeleteClick={(u) => {
          setIsDetailsDrawerOpen(false);
          setSelectedUser(u);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        user={selectedUser}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
