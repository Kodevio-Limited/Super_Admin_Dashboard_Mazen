'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Check, Copy, ArrowRight, ArrowLeft, Upload, Building2, User, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

interface CreateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRestaurant: any) => void;
}

// Plan tiers + billing cycles taken directly from Figma 🗑️ Dump →
// "Create new Restaurant 5" (node 1859:336). Prices are the Figma /mo figures;
// multi-month cycles apply Figma's stated discounts to derive the effective
// monthly rate (see open questions in report).
type FigmaTier = 'Basic' | 'Pro' | 'Enterprise';
type BillingCycle = 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Yearly';

const FIGMA_TIERS: {
  tier: FigmaTier;
  monthlyPrice: number;
  branchLimit: string;
  features: string[];
  isPopular?: boolean;
}[] = [
  {
    tier: 'Basic',
    monthlyPrice: 19,
    branchLimit: '1 Branch',
    features: ['Core POS', 'Basic Reporting'],
  },
  {
    tier: 'Pro',
    monthlyPrice: 63,
    branchLimit: 'Up to 5 Branches',
    features: ['Advanced Analytics', 'Online Ordering', 'Inventory'],
    isPopular: true,
  },
  {
    tier: 'Enterprise',
    monthlyPrice: 191,
    branchLimit: 'Unlimited Branches',
    features: ['Custom API', 'Dedicated Manager', 'Custom Roles'],
  },
];

const BILLING_CYCLES: {
  cycle: BillingCycle;
  label: string;
  saveLabel?: string;
  months: number;
  discount: number;
}[] = [
  { cycle: 'Monthly', label: 'Monthly', months: 1, discount: 0 },
  { cycle: 'Quarterly', label: 'Quarterly', saveLabel: 'Save 5%', months: 3, discount: 0.05 },
  { cycle: 'SemiAnnually', label: 'Semi Annually', saveLabel: 'Save 10%', months: 6, discount: 0.1 },
  { cycle: 'Yearly', label: 'Yearly', saveLabel: 'Save 20%', months: 12, discount: 0.2 },
];

export default function CreateRestaurantModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRestaurantModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Japanese & Ramen');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [branchName, setBranchName] = useState('');
  // Defaults mirror the Figma reference (Pro highlighted, Yearly selected).
  const [selectedTier, setSelectedTier] = useState<FigmaTier>('Pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Yearly');

  const activeBilling = BILLING_CYCLES.find((b) => b.cycle === billingCycle)!;
  const priceFor = (monthlyPrice: number) =>
    monthlyPrice * (1 - activeBilling.discount);
  const totalFor = (monthlyPrice: number) =>
    Math.round(priceFor(monthlyPrice) * activeBilling.months);
  const formatMonthly = (value: number) =>
    `$${Number.isInteger(value) ? value : value.toFixed(2)}`;

  // Generated credentials
  const [credentials, setCredentials] = useState({
    username: '',
    temporaryPassword: '',
  });

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName) setBranchName(`${name} - Main Branch`);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempPass = 'Echo#' + Math.floor(100000 + Math.random() * 900000);
    setCredentials({
      username: ownerEmail,
      temporaryPassword: tempPass,
    });

    const chosenTier = FIGMA_TIERS.find((p) => p.tier === selectedTier)!;
    const newRest = {
      id: `rest-${Date.now()}`,
      name,
      logo: '/images/food-41e5d7.png',
      category,
      ownerName,
      ownerEmail,
      ownerPhone,
      address,
      status: 'Active' as const,
      joinedDate: 'Just now',
      planName: `${chosenTier.tier} Plan`,
      planType: 'Restaurant',
      planBilling: billingCycle,
      planPrice: totalFor(chosenTier.monthlyPrice),
      planExpiry: 'Sep 30, 2027',
      totalBranches: 1,
      totalOrders: 0,
      totalRevenue: 0,
      branches: [
        {
          id: `br-${Date.now()}`,
          name: branchName || `${name} Main Branch`,
          address,
          phone: ownerPhone,
          managerName: ownerName,
          managerEmail: ownerEmail,
          staffCount: 1,
          ordersToday: 0,
          revenueToday: 0,
          status: 'Active' as const,
          planName: `${chosenTier.tier} Plan`,
          planExpiry: 'Sep 30, 2027',
          monthlyFee: 0,
        },
      ],
    };

    onSuccess(newRest);
    setStep(3);
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText(
      `Login URL: http://localhost:3000/login\nEmail: ${credentials.username}\nPassword: ${credentials.temporaryPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={step !== 3 ? onClose : undefined}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container — widened toward the 1119px Figma frame, responsive */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header — title + close like Figma, with 3-step indicator below */}
        <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#2D2F33] text-xl sm:text-2xl">
              {step === 3 ? 'Restaurant Created Successfully!' : 'Create New Restaurant'}
            </h3>
            {step !== 3 && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#2D2F33] transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* 3-step indicator (Figma: circles 1-2-3 joined by dashed lines) */}
          <div className="flex items-center mt-5 px-1" aria-hidden="true">
            {[1, 2, 3].map((n, i) => {
              const done = step > n;
              const current = step === n;
              return (
                <React.Fragment key={n}>
                  <span
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      done || current
                        ? 'bg-[#026F4F] text-white'
                        : 'bg-[#E9E9E9] text-[#989898]'
                    }`}
                  >
                    {done ? <Check size={18} /> : n}
                  </span>
                  {i < 2 && (
                    <span
                      className={`flex-1 mx-2 sm:mx-4 border-t-2 border-dashed ${
                        step > n + 1 || (step === n + 1)
                          ? 'border-[#026F4F]/40'
                          : 'border-[#E9E9E9]'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-xs text-[#6E727A] mt-4">
            {step === 1 && 'Step 1 of 3 — restaurant profile & owner contact (app flow; fields not specified in Figma)'}
            {step === 2 && 'Step 2 of 3 — billing cycle & subscription plan (per Figma)'}
            {step === 3 && 'Step 3 of 3 — credentials generated for restaurant administrator'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kyoto Ramen Bar"
                    className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                    Category / Cuisine *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:bg-white focus:outline-none transition-all"
                  >
                    <option>Japanese & Ramen</option>
                    <option>Italian & Pizzeria</option>
                    <option>American Burger & Grill</option>
                    <option>Mexican & Tacos</option>
                    <option>French Bistro & Cafe</option>
                    <option>Seafood & Fine Dining</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                    Owner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Alexander Wright"
                    className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="alexander@domain.com"
                    className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  Headquarters / Primary Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace, Springfield, OR"
                  className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Upload Logo area */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  Restaurant Logo / Brand Asset
                </label>
                <div className="border-2 border-dashed border-gray-200 hover:border-[#026F4F] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#F8F9FA]">
                  <Upload size={24} className="mx-auto text-[#989898] mb-1" />
                  <p className="text-xs text-[#2D2F33] font-medium">Click to upload PNG or JPG logo</p>
                  <p className="text-[11px] text-[#989898]">Recommended 400x400px (Max 5MB)</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold text-[#686868] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Next: Plan & Branch</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Branch & Plan Setup */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                  Initial Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Kyoto Ramen - Downtown Main"
                  className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Billing Toggle — 4 cycles per Figma (Monthly / Quarterly 5% / Semi Annually 10% / Yearly 20%) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                    Select Subscription Plan Tier
                  </label>
                  <div className="flex flex-wrap items-center bg-[#F2F2F2] p-1 rounded-full text-xs font-bold">
                    {BILLING_CYCLES.map((b) => (
                      <button
                        key={b.cycle}
                        type="button"
                        onClick={() => setBillingCycle(b.cycle)}
                        className={`px-3 sm:px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                          billingCycle === b.cycle
                            ? 'bg-white shadow text-[#2D2F33]'
                            : 'text-[#686868] hover:text-[#2D2F33]'
                        }`}
                      >
                        <span>{b.label}</span>
                        {b.saveLabel && (
                          <span className="text-[#158F15] font-semibold">{b.saveLabel}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Selection Cards — tiers, prices & features per Figma */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {FIGMA_TIERS.map((plan) => {
                    const isSelected = selectedTier === plan.tier;
                    const monthly = priceFor(plan.monthlyPrice);

                    return (
                      <div
                        key={plan.tier}
                        onClick={() => setSelectedTier(plan.tier)}
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col ${
                          isSelected
                            ? 'border-[#026F4F] bg-white shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {plan.isPopular && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#026F4F] text-white text-[11px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                            Popular
                          </span>
                        )}
                        {isSelected && (
                          <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#026F4F] text-white flex items-center justify-center shadow">
                            <Check size={14} />
                          </span>
                        )}
                        <h4 className="font-bold text-[#2D2F33]">{plan.tier}</h4>
                        <div className="text-3xl font-bold text-[#2D2F33] mt-1">
                          {formatMonthly(monthly)}
                          <span className="text-sm text-[#989898] font-normal"> /mo</span>
                        </div>
                        <span className="inline-flex w-fit mt-2 text-[11px] font-semibold text-[#026F4F] bg-[#026F4F]/10 px-2.5 py-1 rounded-full">
                          {plan.branchLimit}
                        </span>
                        <ul className="mt-3 space-y-1.5">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2 text-xs text-[#2D2F33]"
                            >
                              <Check size={14} className="text-[#158F15] flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        {activeBilling.months > 1 && (
                          <p className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-[#6E727A]">
                            Billed ${totalFor(plan.monthlyPrice).toLocaleString()} per{' '}
                            {activeBilling.label.toLowerCase()} cycle
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold text-[#686868] hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Complete & Activate</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation Modal */}
          {step === 3 && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 text-[#026F4F] flex items-center justify-center mx-auto animate-bounce">
                <Sparkles size={32} />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#2D2F33]">
                  Restaurant Created Successfully!
                </h3>
                <p className="text-sm text-[#6E727A] mt-1 max-w-md mx-auto">
                  <strong>{name}</strong> has been registered and provisioned on the ecosystem. Share the login credentials below with the restaurant owner.
                </p>
              </div>

              {/* Credentials Box */}
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-gray-200 text-left max-w-md mx-auto space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Portal:</span>
                  <span className="text-[#026F4F] font-bold">http://localhost:3000/login</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Username (Email):</span>
                  <span className="font-bold">{credentials.username}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Temporary Password:</span>
                  <span className="font-bold bg-white px-2 py-0.5 rounded border border-gray-300">
                    {credentials.temporaryPassword}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleCopyCredentials}
                  className="px-6 py-3 rounded-full border border-gray-200 hover:border-[#026F4F] hover:text-[#026F4F] text-sm font-semibold text-[#2D2F33] flex items-center gap-2 transition-all"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  Done & View Directory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
