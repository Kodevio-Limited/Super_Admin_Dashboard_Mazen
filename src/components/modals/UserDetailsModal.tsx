'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Trash2, User as UserIcon, Phone, Mail, ChevronDown, ShieldCheck } from 'lucide-react';
import LeftPanel from '../LeftPanel';
import { AdminUser, UserRole } from '../../types/admin';

// Source of truth: Figma frame "View Details" (1537:1210).
export const FILTER_ROLES = ['Admin', 'Manager', 'Cashier', 'Kitchen Staff'] as const;

// Figma role labels ↔ data roles (ambiguous mapping — flagged in report).
export function figmaRoleToData(role: string): UserRole {
  switch (role) {
    case 'Admin':
      return 'Super Admin';
    case 'Manager':
      return 'Branch Manager';
    case 'Cashier':
      return 'Cashier';
    default:
      return 'Kitchen Staff';
  }
}

export function dataRoleToFigma(role: UserRole): string {
  switch (role) {
    case 'Super Admin':
    case 'Restaurant Owner':
      return 'Admin';
    case 'Branch Manager':
      return 'Manager';
    case 'Cashier':
      return 'Cashier';
    default:
      return 'Kitchen Staff';
  }
}

export function rolePill(role: UserRole): string {
  switch (role) {
    case 'Super Admin':
    case 'Restaurant Owner':
      return 'bg-[#FBD9F9] text-[#B93DBE]';
    case 'Branch Manager':
      return 'bg-[#D6EBFF] text-[#1573D1]';
    default:
      return 'bg-[#F2F2F2] text-[#686868]';
  }
}

export function roleShort(role: UserRole): string {
  switch (role) {
    case 'Super Admin':
      return 'ADMIN';
    case 'Restaurant Owner':
      return 'OWNER';
    case 'Branch Manager':
      return 'MANAGER';
    case 'Cashier':
      return 'CASHIER';
    default:
      return 'KITCHEN';
  }
}

const PERMISSIONS = [
  { title: 'Manage Menu', desc: 'Add, edit, or remove menu items and categories' },
  { title: 'Manage Orders', desc: 'Accept, update, and complete active orders' },
  { title: 'Manage Tables', desc: 'Update table status, seat guests, and clear tables' },
  { title: 'Access Reports', desc: 'View financial and performance analytics' },
  { title: 'Handle Payments', desc: 'Process transactions, mark orders paid, and issue refunds' },
  { title: 'Manage Staff', desc: 'Add, edit, or remove staff members and permissions' },
];

const pillInput =
  'w-full h-14 px-6 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all disabled:opacity-70';

const iconInput =
  'w-full h-14 pl-12 pr-4 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all disabled:opacity-70';

interface UserDetailsModalProps {
  user: AdminUser;
  isNew?: boolean;
  mode?: 'view' | 'edit';
  restaurants: { name: string; branches: { name: string }[] }[];
  onClose: () => void;
  onSave: (user: AdminUser) => void;
  onDeleteRequest: () => void;
}

export default function UserDetailsModal({
  user,
  isNew = false,
  mode = 'edit',
  restaurants,
  onClose,
  onSave,
  onDeleteRequest,
}: UserDetailsModalProps) {
  const [viewOnly, setViewOnly] = useState(mode === 'view' && !isNew);
  const [fullName, setFullName] = useState(isNew ? '' : user.name);
  const [phone, setPhone] = useState(isNew ? '' : user.phone);
  const [figmaRole, setFigmaRole] = useState(isNew ? 'Manager' : dataRoleToFigma(user.role));
  const [restaurantName, setRestaurantName] = useState(isNew ? '' : user.restaurantName || '');
  const [branchName, setBranchName] = useState(isNew ? '' : user.branchName || '');
  const [email, setEmail] = useState(isNew ? '' : user.email);
  const [password, setPassword] = useState('');
  const [perms, setPerms] = useState<string[]>(PERMISSIONS.map((p) => p.title));
  const [error, setError] = useState('');

  const branchOptions = restaurants.find((r) => r.name === restaurantName)?.branches || [];

  const togglePerm = (title: string) =>
    setPerms((prev) => (prev.includes(title) ? prev.filter((p) => p !== title) : [...prev, title]));

  const handleSave = () => {
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (password && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    onSave({
      ...user,
      id: isNew ? `usr-${Date.now()}` : user.id,
      name: fullName.trim(),
      email: email.trim(),
      phone,
      avatar: user.avatar || '/images/avatar.png',
      role: figmaRoleToData(figmaRole),
      restaurantName: restaurantName || undefined,
      branchName: branchName || undefined,
      status: user.status || 'Active',
      joinedDate: user.joinedDate || 'Just now',
      lastActive: user.lastActive || 'Just now',
    });
  };

  return (
    <LeftPanel onClose={onClose} labelledBy={isNew ? 'Add user' : 'User details'} widthClass="w-[min(640px,94vw)]">
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
        <button
          onClick={onClose}
          aria-label="Back"
          className="w-12 h-12 rounded-full bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#2D2F33] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <Image src={user.avatar || '/images/avatar.png'} alt={fullName || 'User'} fill className="object-cover rounded-full" />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-white" />
          </div>
          <h3 className="text-2xl font-semibold text-[#2D2F33] mt-3">{fullName || (isNew ? 'New User' : user.name)}</h3>
          <span className={`inline-block mt-2 text-xs font-bold px-4 py-1.5 rounded-full ${rolePill(figmaRoleToData(figmaRole))}`}>
            {figmaRole.toUpperCase()}
          </span>
        </div>
        {!isNew && (
          <button
            onClick={onDeleteRequest}
            aria-label="Delete user"
            title="Delete user"
            className="w-12 h-12 rounded-full bg-[#FBD9F9] hover:bg-[#f5c2f5] flex items-center justify-center text-[#E52B2B] transition-colors"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 mt-6 space-y-4 border border-gray-100">
        <h4 className="text-lg font-semibold text-[#2D2F33]">About</h4>
        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Full Name</label>
          <div className="relative">
            <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
            <input type="text" disabled={viewOnly} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your Name..." className={iconInput} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Phone Number</label>
          <div className="relative">
            <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
            <input type="tel" disabled={viewOnly} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your number" className={iconInput} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Role Assignment</label>
          <div className="relative">
            <select disabled={viewOnly} value={figmaRole} onChange={(e) => setFigmaRole(e.target.value)} className={`${pillInput} appearance-none pr-12`}>
              {FILTER_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#686868] pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Assigned Restaurant</label>
          <div className="relative">
            <select
              disabled={viewOnly}
              value={restaurantName}
              onChange={(e) => { setRestaurantName(e.target.value); setBranchName(''); }}
              className={`${pillInput} appearance-none pr-12 ${restaurantName ? '' : 'text-[#989898]'}`}
            >
              <option value="">7 heaven</option>
              {restaurants.map((r) => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#686868] pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Branch Access</label>
          <div className="relative">
            <select
              disabled={viewOnly}
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className={`${pillInput} appearance-none pr-12 ${branchName ? '' : 'text-[#989898]'}`}
            >
              <option value="">All Branch</option>
              {branchOptions.map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#686868] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mt-4 space-y-4 border border-gray-100">
        <h4 className="text-lg font-semibold text-[#2D2F33]">Login Credentials</h4>
        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
            <input type="email" disabled={viewOnly} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com." className={iconInput} />
          </div>
        </div>
        {!viewOnly && (
          <div className="space-y-1.5">
            <label className="block text-sm text-[#2D2F33]">Set Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className={pillInput} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 mt-4 border border-gray-100">
        <h4 className="text-lg font-semibold text-[#2D2F33] flex items-center gap-2">
          <ShieldCheck size={20} />
          Permission
        </h4>
        <p className="text-sm text-[#989898] mt-1">Control what this team member can access.</p>
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3 mt-4">
          {PERMISSIONS.map((p) => {
            const on = perms.includes(p.title);
            return (
              <button
                key={p.title}
                type="button"
                disabled={viewOnly}
                onClick={() => togglePerm(p.title)}
                className={`text-left rounded-xl border-2 p-3.5 transition-all ${
                  on ? 'border-[#026F4F] bg-white' : 'border-gray-200 bg-white opacity-70'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[#2D2F33]">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold ${on ? 'bg-[#026F4F]' : 'bg-gray-300'}`}>
                    {on ? '✓' : ''}
                  </span>
                  {p.title}
                </span>
                <span className="block text-xs text-[#989898] mt-1.5 leading-relaxed">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-[#E52B2B] mt-4">{error}</p>}

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={onClose}
          className="py-3.5 rounded-full border border-gray-300 text-[#2D2F33] font-medium hover:bg-gray-100 transition-all"
        >
          Cancel
        </button>
        {viewOnly ? (
          <button
            onClick={() => setViewOnly(false)}
            className="py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
          >
            Edit Details
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
          >
            Save Profile
          </button>
        )}
      </div>
    </LeftPanel>
  );
}
