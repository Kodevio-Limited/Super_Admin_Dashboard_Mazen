'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { SubscriptionPlan } from '../../types/admin';

interface CreatePlanModalProps {
  isOpen: boolean;
  type: 'Restaurant' | 'Branch';
  onClose: () => void;
  onSavePlan: (newPlan: SubscriptionPlan) => void;
}

export default function CreatePlanModal({
  isOpen,
  type,
  onClose,
  onSavePlan,
}: CreatePlanModalProps) {
  const [name, setName] = useState('');
  const [priceMonthly, setPriceMonthly] = useState('99');
  const [priceYearly, setPriceYearly] = useState('950');
  const [description, setDescription] = useState('');
  const [maxBranches, setMaxBranches] = useState('5');
  const [maxStaff, setMaxStaff] = useState('50');
  const [features, setFeatures] = useState<string[]>([
    'Full POS & Cashier Station support',
    'Real-time Kitchen Display System (KDS)',
    'Live Analytics & Sales Reports',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdPlan: SubscriptionPlan = {
      id: `plan-${type.toLowerCase()}-${Date.now()}`,
      name,
      type,
      priceMonthly: parseFloat(priceMonthly) || 0,
      priceYearly: parseFloat(priceYearly) || 0,
      description,
      maxBranches: type === 'Restaurant' ? parseInt(maxBranches) || 1 : 1,
      maxStaff: parseInt(maxStaff) || 10,
      features,
      status: 'Active',
    };
    onSavePlan(createdPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      <div className="relative bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-gray-100 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#026F4F]/10 text-[#026F4F] flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#2D2F33]">
                {type === 'Restaurant' ? 'Create New Restaurant Plan' : 'Create New Branch Plan'}
              </h3>
              <p className="text-xs text-[#6E727A]">
                Configure pricing, limits, and feature permissions for this tier
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#989898]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2D2F33] uppercase">Plan Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Growth Franchise"
                className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2D2F33] uppercase">Plan Scope</label>
              <input
                type="text"
                disabled
                value={type === 'Restaurant' ? 'All Restaurant Branches' : 'Single Branch Add-on'}
                className="w-full h-12 px-4 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2D2F33] uppercase">Monthly Price ($) *</label>
              <input
                type="number"
                required
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
                placeholder="99"
                className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2D2F33] uppercase">Annual Price ($) *</label>
              <input
                type="number"
                required
                value={priceYearly}
                onChange={(e) => setPriceYearly(e.target.value)}
                placeholder="950"
                className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
              />
            </div>
          </div>

          {type === 'Restaurant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2F33] uppercase">Max Included Branches</label>
                <input
                  type="number"
                  value={maxBranches}
                  onChange={(e) => setMaxBranches(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2F33] uppercase">Max Staff Accounts</label>
                <input
                  type="number"
                  value={maxStaff}
                  onChange={(e) => setMaxStaff(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D2F33] uppercase">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short plan summary displayed to restaurant owners..."
              className="w-full p-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:border-[#026F4F] focus:outline-none resize-none"
            />
          </div>

          {/* Features Builder */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2D2F33] uppercase">Feature Bullets</label>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-[#2D2F33]">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-[#026F4F]" />
                    <span>{feat}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Type feature name and click Add"
                className="flex-1 h-11 px-4 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs focus:border-[#026F4F] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 h-11 bg-gray-100 hover:bg-gray-200 text-[#2D2F33] font-semibold text-xs rounded-xl flex items-center gap-1"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-[#686868] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white text-sm font-semibold shadow-md flex items-center gap-2"
            >
              <span>Save & Publish Plan</span>
              <Check size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
