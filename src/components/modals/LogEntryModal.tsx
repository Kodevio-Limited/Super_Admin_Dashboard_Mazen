'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import LeftPanel from '../LeftPanel';

export interface LedgerEntry {
  type: 'Revenue' | 'Expense';
  description: string;
  amount: string;
  date: string;
  category: string;
}

// Source of truth: Figma frame "Log New Entry" (1940:1580).
export default function LogEntryModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (entry: LedgerEntry) => void;
}) {
  const [type, setType] = useState<'Revenue' | 'Expense'>('Revenue');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-08-16');
  const [category, setCategory] = useState('');

  const reset = () => {
    setType('Revenue');
    setDescription('');
    setAmount('');
    setDate('2026-08-16');
    setCategory('');
  };

  const pillInput =
    'w-full h-14 px-6 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all';

  return (
    <LeftPanel onClose={onClose} labelledBy="Log New Entry">
      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <button
          onClick={onClose}
          aria-label="Back"
          className="w-12 h-12 rounded-full bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#2D2F33] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="text-2xl font-semibold text-[#2D2F33] text-center pr-12">Log New Entry</h3>
      </div>

      <div className="mt-6 space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Entry Type</label>
          <div className="grid grid-cols-2 gap-3">
            {(['Revenue', 'Expense'] as const).map((t) => {
              const selected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`h-14 rounded-full text-[15px] font-medium transition-all ${
                    selected
                      ? 'bg-[#026F4F]/10 border-2 border-[#026F4F] text-[#026F4F]'
                      : 'bg-[#F2F2F2] text-[#989898] hover:text-[#2D2F33]'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Cloud Hosting, The Rustic Spoke"
            className={pillInput}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm text-[#2D2F33]">Amount ($)</label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$ 0.00"
              className={pillInput}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-[#2D2F33]">Date</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${pillInput} pr-12 text-[#686868]`}
              />
              <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#686868] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">Category / Plan</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Software, Custom"
            className={pillInput}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button
          onClick={reset}
          className="py-3.5 rounded-full border border-gray-300 text-[#2D2F33] font-medium hover:bg-gray-100 transition-all"
        >
          Reset
        </button>
        <button
          onClick={() => onSave({ type, description, amount, date, category })}
          className="py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
        >
          Save Entry
        </button>
      </div>
    </LeftPanel>
  );
}
