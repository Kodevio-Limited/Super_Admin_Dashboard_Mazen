'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, SquarePen, Check } from 'lucide-react';
import Topbar from '../../../components/Topbar';

// Source of truth: Figma 1546:4027 (My Profile) / 1546:4388 (Security).
// Prefilled from the mock Super Admin user; saves show an inline
// confirmation only (no backend) — flagged in the report.
export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  const [firstName, setFirstName] = useState('Elena');
  const [lastName, setLastName] = useState('Rostova');
  const [email, setEmail] = useState('elena@superadmin.com');
  const [phone, setPhone] = useState('+1 (555) 901-2345');
  const [avatarPreview, setAvatarPreview] = useState('/images/avatar.png');
  const [profileNote, setProfileNote] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwNote, setPwNote] = useState<{ ok: boolean; text: string } | null>(null);

  const pillInput =
    'w-full h-14 pl-12 pr-4 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all';

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = () => {
    if (!firstName.trim() || !email.trim()) {
      setProfileNote('First name and email are required.');
      return;
    }
    setProfileNote('Profile saved.');
    setTimeout(() => setProfileNote(''), 3000);
  };

  const handleUpdatePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwNote({ ok: false, text: 'Please fill in all password fields.' });
      return;
    }
    if (newPw.length < 8) {
      setPwNote({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwNote({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    setPwNote({ ok: true, text: 'Password updated.' });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setTimeout(() => setPwNote(null), 3000);
  };

  const pwField = (
    label: string,
    value: string,
    set: (v: string) => void,
    key: 'current' | 'next' | 'confirm',
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm text-[#2D2F33]">{label}</label>
      <div className="relative">
        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
        <input
          type={showPw[key] ? 'text' : 'password'}
          value={value}
          onChange={(e) => set(value)}
          placeholder="*********"
          className={`${pillInput} pr-12`}
        />
        <button
          type="button"
          aria-label={showPw[key] ? 'Hide password' : 'Show password'}
          onClick={() => setShowPw((prev) => ({ ...prev, [key]: !prev[key] }))}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#989898] hover:text-[#2D2F33] transition-colors"
        >
          {showPw[key] ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Settings" subtitle="Manage your account & apps" />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        <div>
          <h2 className="text-3xl font-bold text-[#2D2F33]">Settings</h2>
          <p className="text-[#989898] mt-1">Manage your account & apps</p>
        </div>

        <div className="inline-flex items-center bg-[#E9E9E9] p-1.5 rounded-full text-[15px] font-medium">
          {(['profile', 'security'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-8 py-2.5 rounded-full transition-all ${
                tab === t ? 'bg-white shadow text-[#026F4F] font-semibold' : 'text-[#989898] hover:text-[#2D2F33]'
              }`}
            >
              {t === 'profile' ? 'My Profile' : 'Security'}
            </button>
          ))}
        </div>

        {tab === 'profile' ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex justify-center">
              <div className="relative w-28 h-28">
                <Image src={avatarPreview} alt="Profile" fill className="object-cover rounded-full" />
                <label
                  title="Change photo"
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#F5A623] hover:bg-[#e0951a] flex items-center justify-center text-white cursor-pointer transition-colors shadow"
                >
                  <SquarePen size={16} />
                  <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">First Name</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Sarah Jessie" className={pillInput} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-[#2D2F33]">Last Name</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sarah Jessie" className={pillInput} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-[#2D2F33]">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Sarah Jessie" className={pillInput} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-[#2D2F33]">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+00888888" className={pillInput} />
              </div>
            </div>

            {profileNote && (
              <p className={`flex items-center gap-1.5 text-sm ${profileNote === 'Profile saved.' ? 'text-[#158F15]' : 'text-[#E52B2B]'}`}>
                {profileNote === 'Profile saved.' && <Check size={15} />}
                {profileNote}
              </p>
            )}

            <button
              onClick={handleSaveProfile}
              className="w-full py-4 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-5">
            {pwField('Current Password', currentPw, setCurrentPw, 'current')}
            {pwField('New Password', newPw, setNewPw, 'next')}
            {pwField('Confirm Password', confirmPw, setConfirmPw, 'confirm')}

            {pwNote && (
              <p className={`flex items-center gap-1.5 text-sm ${pwNote.ok ? 'text-[#158F15]' : 'text-[#E52B2B]'}`}>
                {pwNote.ok && <Check size={15} />}
                {pwNote.text}
              </p>
            )}

            <button
              onClick={handleUpdatePassword}
              className="w-full py-4 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md transition-all"
            >
              Update Password
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
