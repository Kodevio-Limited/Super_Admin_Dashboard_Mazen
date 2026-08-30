'use client';

import React, { useState } from 'react';
import Topbar from '../../../components/Topbar';
import {
  CreditCard,
  Check,
  Plus,
  ShieldCheck,
  Gift,
  Building2,
  Store,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { mockPlans, mockRestaurants } from '../../../data/mockData';
import { SubscriptionPlan } from '../../../types/admin';
import CreatePlanModal from '../../../components/modals/CreatePlanModal';
import ManualActivationModal from '../../../components/modals/ManualActivationModal';
import ActivateWithoutPaymentModal from '../../../components/modals/ActivateWithoutPaymentModal';
import ActionNotAllowedModal from '../../../components/modals/ActionNotAllowedModal';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(mockPlans);
  const [activeTab, setActiveTab] = useState<'Restaurant' | 'Branch'>('Restaurant');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');

  // Modals state
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isManualActOpen, setIsManualActOpen] = useState(false);
  const [isCompActOpen, setIsCompActOpen] = useState(false);
  const [isActionNotAllowedOpen, setIsActionNotAllowedOpen] = useState(false);

  const displayedPlans = plans.filter((p) => p.type === activeTab);

  const handleSaveNewPlan = (newPlan: SubscriptionPlan) => {
    setPlans([...plans, newPlan]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="SaaS Subscriptions & Licensing"
        subtitle="Manage overarching franchise tiers, branch add-ons, and direct administrator overrides"
      />

      <main className="flex-1 p-8 space-y-8 max-w-[1920px] mx-auto w-full">
        {/* Top Actions & Scope Switcher */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-6">
          {/* Plan Scope Switcher */}
          <div className="flex items-center bg-[#F2F2F2] p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('Restaurant')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'Restaurant'
                  ? 'bg-white text-[#026F4F] shadow-xs'
                  : 'text-[#686868] hover:text-[#2D2F33]'
              }`}
            >
              <Store size={16} />
              <span>Restaurant Plans (Unified)</span>
            </button>
            <button
              onClick={() => setActiveTab('Branch')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'Branch'
                  ? 'bg-white text-[#026F4F] shadow-xs'
                  : 'text-[#686868] hover:text-[#2D2F33]'
              }`}
            >
              <Building2 size={16} />
              <span>Branch Add-on Plans</span>
            </button>
          </div>

          {/* Billing Cycle & Overrides */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center bg-[#F2F2F2] p-1 rounded-full text-xs font-bold mr-2">
              <button
                type="button"
                onClick={() => setBillingCycle('Monthly')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  billingCycle === 'Monthly' ? 'bg-white text-[#026F4F] shadow-xs' : 'text-[#686868]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('Yearly')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  billingCycle === 'Yearly' ? 'bg-white text-[#026F4F] shadow-xs' : 'text-[#686868]'
                }`}
              >
                Yearly (-20%)
              </button>
            </div>

            {/* Manual Activation */}
            <button
              onClick={() => setIsManualActOpen(true)}
              className="h-11 px-4 rounded-full border border-gray-200 hover:border-[#026F4F] text-xs font-bold text-[#2D2F33] flex items-center gap-1.5 bg-white transition-colors"
            >
              <ShieldCheck size={15} className="text-[#026F4F]" />
              <span>Manual Activation</span>
            </button>

            {/* Activate Without Payment */}
            <button
              onClick={() => setIsCompActOpen(true)}
              className="h-11 px-4 rounded-full border border-gray-200 hover:border-[#158F15] text-xs font-bold text-[#2D2F33] flex items-center gap-1.5 bg-white transition-colors"
            >
              <Gift size={15} className="text-[#158F15]" />
              <span>Complimentary Trial</span>
            </button>

            {/* Create New Plan */}
            <button
              onClick={() => setIsCreatePlanOpen(true)}
              className="h-11 px-5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
            >
              <Plus size={16} />
              <span>Create New Plan</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {displayedPlans.map((plan) => {
            const price = billingCycle === 'Monthly' ? plan.priceMonthly : plan.priceYearly;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-8 border-2 transition-all flex flex-col justify-between relative ${
                  plan.isPopular
                    ? 'border-[#026F4F] shadow-[0px_4px_24px_rgba(2,111,79,0.12)]'
                    : 'border-gray-100 shadow-xs hover:shadow-md'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3.5 left-8 bg-[#026F4F] text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[#2D2F33]">{plan.name}</h3>
                      <p className="text-xs text-[#6E727A] mt-1 line-clamp-2">{plan.description}</p>
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#2D2F33] tracking-tight">
                        ${price}
                      </span>
                      <span className="text-sm font-semibold text-[#989898]">
                        /{billingCycle === 'Monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {plan.maxBranches && (
                      <p className="text-xs text-[#026F4F] font-bold mt-1">
                        Includes up to {plan.maxBranches} branches & {plan.maxStaff} staff members
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-6 space-y-3">
                    <p className="text-xs font-bold text-[#2D2F33] uppercase tracking-wider">
                      Included Capabilities
                    </p>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#2D2F33]">
                        <div className="w-4 h-4 rounded-full bg-green-100 text-[#026F4F] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setIsManualActOpen(true)}
                    className="w-full h-12 rounded-full bg-gray-100 hover:bg-[#026F4F] hover:text-white text-[#2D2F33] font-bold text-xs transition-all"
                  >
                    Assign to Franchise
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modals */}
      <CreatePlanModal
        isOpen={isCreatePlanOpen}
        type={activeTab}
        onClose={() => setIsCreatePlanOpen(false)}
        onSavePlan={handleSaveNewPlan}
      />

      <ManualActivationModal
        isOpen={isManualActOpen}
        restaurant={mockRestaurants[0]}
        plans={plans}
        onClose={() => setIsManualActOpen(false)}
        onConfirm={(rId, pId, dur, note) => {
          alert(`Plan manually activated for 12 months!`);
        }}
      />

      <ActivateWithoutPaymentModal
        isOpen={isCompActOpen}
        restaurant={mockRestaurants[0]}
        onClose={() => setIsCompActOpen(false)}
        onConfirm={(rId, exp, reason) => {
          alert(`Zero-cost promotional access granted until ${exp}!`);
        }}
      />

      <ActionNotAllowedModal
        isOpen={isActionNotAllowedOpen}
        onClose={() => setIsActionNotAllowedOpen(false)}
      />
    </div>
  );
}
