'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import LeftPanel from '../LeftPanel';
import { CustomPlan, moduleArLabel } from '../../data/figmaPlans';

interface PlanFormModalProps {
  isOpen: boolean;
  kind: 'Restaurant' | 'Branch';
  editing?: CustomPlan | null;
  onClose: () => void;
  onSave: (plan: CustomPlan) => void;
}

// Source of truth: Figma 1525:3455 (Restaurant) / 1869:1845 (Branch).
const MODULES = [
  'Inventory Management',
  'Kitchen Display System (KDS)',
  'Advanced Analytics',
  'Online Ordering',
];

const pillInput =
  'w-full h-14 px-6 bg-[#F2F2F2] rounded-full text-[15px] text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all';

function LimitRow({
  label,
  enabled,
  value,
  placeholder,
  onToggle,
  onChange,
}: {
  label: string;
  enabled: boolean;
  value: string;
  placeholder: string;
  onToggle: (on: boolean) => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#2D2F33]">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={label}
          onClick={() => onToggle(!enabled)}
          className={`w-12 h-7 rounded-full p-1 transition-colors ${
            enabled ? 'bg-[#2563EB]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <input
        type="number"
        min={0}
        disabled={!enabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${pillInput} disabled:opacity-60`}
      />
    </div>
  );
}

export default function PlanFormModal({ isOpen, kind, editing, onClose, onSave }: PlanFormModalProps) {
  const t = useTranslations('sa.planForm');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [planName, setPlanName] = useState(editing?.name || '');
  const [monthly, setMonthly] = useState(editing ? String(editing.prices.monthly) : '');
  const [yearly, setYearly] = useState(editing ? String(editing.prices.yearly) : '');
  const [quarterly, setQuarterly] = useState(editing ? String(editing.prices.quarterly) : '');
  const [semi, setSemi] = useState(editing ? String(editing.prices.semi) : '');

  const [maxTables, setMaxTables] = useState(editing?.maxTables !== undefined ? String(editing.maxTables) : '');
  const [tablesOn, setTablesOn] = useState(editing?.maxTables !== undefined);
  const [maxBranches, setMaxBranches] = useState(editing?.maxBranches !== undefined ? String(editing.maxBranches) : '');
  const [branchesOn, setBranchesOn] = useState(editing?.maxBranches !== undefined);
  const [maxStaff, setMaxStaff] = useState(editing?.maxStaff !== undefined ? String(editing.maxStaff) : '');
  const [staffOn, setStaffOn] = useState(editing?.maxStaff !== undefined);
  const [maxOrders, setMaxOrders] = useState(editing?.maxOrders !== undefined ? String(editing.maxOrders) : '');
  const [ordersOn, setOrdersOn] = useState(editing?.maxOrders !== undefined);

  const [modules, setModules] = useState<string[]>(editing?.modules || [...MODULES]);
  const [isPrivate, setIsPrivate] = useState(editing?.isPrivate || false);

  if (!isOpen) return null;
  const kindLabel = kind === 'Restaurant' ? t('kindRestaurant') : t('kindBranch');

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };
  const limitVal = (on: boolean, v: string) => {
    if (!on) return undefined;
    const t = v.trim();
    if (t === '') return undefined;
    const n = parseInt(t, 10);
    return isNaN(n) ? undefined : n;
  };

  const handleSave = () => {
    onSave({
      id: editing?.id || `plan-${Date.now()}`,
      name: planName.trim() || (kind === 'Restaurant' ? 'Custom Restaurant Plan' : 'Custom Branch Plan'),
      kind,
      prices: { monthly: num(monthly), yearly: num(yearly), quarterly: num(quarterly), semi: num(semi) },
      maxTables: limitVal(tablesOn, maxTables),
      maxBranches: kind === 'Restaurant' ? limitVal(branchesOn, maxBranches) : undefined,
      maxStaff: limitVal(staffOn, maxStaff),
      maxOrders: limitVal(ordersOn, maxOrders),
      modules,
      isPrivate: kind === 'Branch' ? isPrivate : undefined,
    });
    onClose();
  };

  const toggleModule = (m: string) =>
    setModules((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  return (
    <LeftPanel onClose={onClose} labelledBy={kind === 'Restaurant' ? t('createRestaurantTitle') : t('createBranchTitle')}>
      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <button
          onClick={onClose}
          aria-label={t('back')}
          className="w-12 h-12 rounded-full bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#2D2F33] transition-colors"
        >
          <ArrowLeft size={20} className="rtl:scale-x-[-1]" />
        </button>
        <div className="text-center pe-12">
          <h3 className="text-2xl font-semibold text-[#2D2F33]">
            {editing ? t('edit') : t('createNew')}
            <br />
            {kindLabel} {t('planWord')}
          </h3>
          <p className="text-sm text-[#989898] mt-1">{t('tagline')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mt-6 space-y-4 border border-gray-100">
        <h4 className="text-lg font-semibold text-[#2D2F33]">{t('basicInfo')}</h4>
        <div className="space-y-1.5">
          <label className="block text-sm text-[#2D2F33]">{t('planName')}</label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder={t('planNamePlaceholder')}
            className={pillInput}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm text-[#2D2F33]">{t('monthlyPrice')}</label>
            <input type="number" min={0} value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder={t('pricePlaceholder')} className={pillInput} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-[#2D2F33]">{t('yearlyPrice')}</label>
            <input type="number" min={0} value={yearly} onChange={(e) => setYearly(e.target.value)} placeholder={t('pricePlaceholder')} className={pillInput} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-[#2D2F33]">{t('quarterlyPrice')}</label>
            <input type="number" min={0} value={quarterly} onChange={(e) => setQuarterly(e.target.value)} placeholder={t('pricePlaceholder')} className={pillInput} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-[#2D2F33]">{t('semiPrice')}</label>
            <input type="number" min={0} value={semi} onChange={(e) => setSemi(e.target.value)} placeholder={t('pricePlaceholder')} className={pillInput} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mt-4 space-y-5 border border-gray-100">
        <h4 className="text-lg font-semibold text-[#2D2F33]">{t('usageLimits')}</h4>
        <LimitRow label={t('maxTables')} enabled={tablesOn} value={maxTables} placeholder={t('limitPlaceholder')} onToggle={setTablesOn} onChange={setMaxTables} />
        {kind === 'Restaurant' && (
          <LimitRow label={t('maxBranches')} enabled={branchesOn} value={maxBranches} placeholder={t('limitPlaceholder')} onToggle={setBranchesOn} onChange={setMaxBranches} />
        )}
        <LimitRow label={t('maxStaff')} enabled={staffOn} value={maxStaff} placeholder={t('limitPlaceholder')} onToggle={setStaffOn} onChange={setMaxStaff} />
        <LimitRow label={t('maxOrders')} enabled={ordersOn} value={maxOrders} placeholder={t('limitPlaceholderBig')} onToggle={setOrdersOn} onChange={setMaxOrders} />
        <p className="text-xs text-[#989898]">
          {t('unlimitedHint')}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 mt-4 space-y-4 border border-gray-100">
        <h4 className="text-lg font-semibold text-[#2D2F33]">{t('moduleAccess')}</h4>
        {MODULES.map((m) => {
          const on = modules.includes(m);
          return (
            <div key={m} className="flex items-center justify-between">
              <span className="text-sm text-[#2D2F33]">{moduleArLabel(m, locale)}</span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={moduleArLabel(m, locale)}
                onClick={() => toggleModule(m)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${on ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          );
        })}
        {kind === 'Branch' && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[15px] font-medium text-[#2D2F33]">{t('privatePlan')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={isPrivate}
              aria-label={t('privatePlan')}
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${isPrivate ? 'bg-[#22C55E]' : 'bg-gray-300'}`}
            >
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${isPrivate ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={onClose}
          className="py-3.5 rounded-full border border-gray-300 text-[#2D2F33] font-medium hover:bg-gray-100 transition-all"
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleSave}
          className="py-3.5 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium transition-all"
        >
          {t('savePlan')}
        </button>
      </div>
    </LeftPanel>
  );
}
