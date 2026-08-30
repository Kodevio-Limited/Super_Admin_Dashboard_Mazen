'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Check, Copy, ArrowRight, ArrowLeft, Upload, Building2, User, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { mockPlans } from '../../data/mockData';

interface CreateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRestaurant: any) => void;
}

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
  const [selectedPlanId, setSelectedPlanId] = useState(mockPlans[1].id); // Pro default
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');

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

    const chosenPlan = mockPlans.find((p) => p.id === selectedPlanId) || mockPlans[0];
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
      planName: chosenPlan.name,
      planType: chosenPlan.type,
      planBilling: billingCycle,
      planPrice: billingCycle === 'Monthly' ? chosenPlan.priceMonthly : chosenPlan.priceYearly,
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
          planName: chosenPlan.name,
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

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Step Indicator Header */}
        <div className="bg-[#F8F9FA] px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#026F4F] text-white flex items-center justify-center text-sm font-bold">
              {step}
            </span>
            <div>
              <h3 className="font-bold text-[#2D2F33] text-lg">
                {step === 1 && 'Create New Restaurant (Step 1/2)'}
                {step === 2 && 'Branch & Subscription Setup (Step 2/2)'}
                {step === 3 && 'Restaurant Created Successfully!'}
              </h3>
              <p className="text-xs text-[#6E727A]">
                {step === 1 && 'Enter restaurant profile & owner contact'}
                {step === 2 && 'Assign initial branch & select SaaS plan'}
                {step === 3 && 'Credentials generated for restaurant administrator'}
              </p>
            </div>
          </div>

          {step !== 3 && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-[#686868] transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-8">
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

              {/* Billing Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                    Select Subscription Plan Tier
                  </label>
                  <div className="flex items-center bg-[#F2F2F2] p-1 rounded-full text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('Monthly')}
                      className={`px-3 py-1 rounded-full transition-all ${
                        billingCycle === 'Monthly' ? 'bg-white shadow-xs text-[#026F4F]' : 'text-[#686868]'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('Yearly')}
                      className={`px-3 py-1 rounded-full transition-all ${
                        billingCycle === 'Yearly' ? 'bg-white shadow-xs text-[#026F4F]' : 'text-[#686868]'
                      }`}
                    >
                      Yearly (Save 20%)
                    </button>
                  </div>
                </div>

                {/* Plan Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mockPlans.filter((p) => p.type === 'Restaurant').map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const price = billingCycle === 'Monthly' ? plan.priceMonthly : plan.priceYearly;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#026F4F] bg-green-50/30 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-[#2D2F33] text-sm">{plan.name}</h4>
                            {isSelected && <Check size={16} className="text-[#026F4F]" />}
                          </div>
                          <div className="text-xl font-bold text-[#026F4F] my-1">
                            ${price}
                            <span className="text-xs text-[#989898] font-normal">
                              /{billingCycle === 'Monthly' ? 'mo' : 'yr'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6E727A] line-clamp-2">{plan.description}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-[#026F4F] font-semibold">
                          Max {plan.maxBranches} Branches • {plan.maxStaff} Staff
                        </div>
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
