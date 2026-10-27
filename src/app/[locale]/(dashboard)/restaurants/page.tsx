'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, ChevronUp, ChevronDown, Building2, Search, ArrowUpDown, Filter, Check } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { getRestaurants, addRestaurant } from '@/data/restaurantStore';
import { getUsers } from '@/data/userStore';
import { Restaurant } from '@/types/admin';
import { planPill } from '@/data/figmaPlans';
import { locField } from '@/lib/localize';
import CreateRestaurantModal from '@/components/modals/CreateRestaurantModal';
import RestaurantFlowModal from '@/components/modals/RestaurantFlowModal';
import { useQueryModal, readQueryParam, writeQueryParam } from '@/lib/use-query-modal';

// Source of truth: Figma frame "Restaurants" (1856:1628) — grouped
// expandable restaurant/branch table. No search or filters in the frame.
const COLS = 'grid-cols-[minmax(220px,2fr)_minmax(120px,1fr)_minmax(110px,1fr)_minmax(100px,1fr)_minmax(110px,1fr)_minmax(110px,1fr)_64px]';

function Dash() {
  return <span className="text-[#989898]">—</span>;
}

export default function RestaurantsPage() {
  const t = useTranslations('sa.restaurants');
  const tc = useTranslations('common.actions');
  const ts = useTranslations('common.status');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [restaurants, setRestaurants] = useState<Restaurant[]>(getRestaurants);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(getRestaurants().map((r) => [r.id, false]))
  );
  // Query-driven overlays: ?modal=create-restaurant[&step=branches],
  // ?modal=restaurant&id=<restId>[&branch=<id>&tab=Overview|Subscription|Activity]
  const [createOpen, setCreateOpen] = useQueryModal('create-restaurant');
  // Single flow modal: restaurant edit views vs branch views open distinctly.
  const [flowOpen, setFlowOpen] = useQueryModal('restaurant');
  const [flow, setFlow] = useState<{
    restaurantId: string;
    branch?: { id: string; tab: 'Overview' | 'Subscription' | 'Activity' } | null;
  } | null>(null);

  const openFlow = (f: NonNullable<typeof flow>) => {
    setFlow(f);
    writeQueryParam('id', f.restaurantId, false);
    writeQueryParam('branch', f.branch?.id ?? null, false);
    writeQueryParam('tab', f.branch?.tab ?? null, false);
    setFlowOpen(true);
  };
  const closeFlowModal = () => {
    setFlow(null);
    setFlowOpen(false);
    writeQueryParam('id', null, false);
    writeQueryParam('branch', null, false);
    writeQueryParam('tab', null, false);
    setRestaurants(getRestaurants());
  };

  // Cold load: restore the flow modal from ?modal=restaurant&id=[&branch=&tab=]
  useEffect(() => {
    if (readQueryParam('modal') !== 'restaurant') return;
    const id = readQueryParam('id');
    if (!id) return;
    const rest = getRestaurants().find((r) => r.id === id);
    if (!rest) return;
    const branchId = readQueryParam('branch');
    const tab = readQueryParam('tab');
    const validTab = tab === 'Subscription' || tab === 'Activity' ? tab : 'Overview';
    if (branchId) {
      const branch = rest.branches.find((b) => b.id === branchId);
      if (!branch) return;
      setFlow({ restaurantId: id, branch: { id: branchId, tab: validTab } });
    } else {
      setFlow({ restaurantId: id });
    }
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !(prev[id] ?? false) }));

  // Bug-14: ?filter=expiring (from Dashboard Expiring card) shows the
  // expiring-soon list: restaurants sorted by expiry ascending with
  // days-left badges. TODO(api): GET /restaurants?expiringWithin=7d.
  const [expiringOnly, setExpiringOnly] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('filter') === 'expiring') {
        setExpiringOnly(true);
        setExpanded(Object.fromEntries(getRestaurants().map((r) => [r.id, true])));
      }
    } catch {
      // ignore — default to full list
    }
  }, []);

  const daysLeft = (expiry: string): number | null => {
    const ms = Date.parse(expiry);
    if (Number.isNaN(ms)) return null;
    return Math.ceil((ms - Date.now()) / 86400000);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'revenue' | 'users' | 'branches'>('none');
  const [planFilter, setPlanFilter] = useState<'all' | 'Basic' | 'Pro' | 'Enterprise' | 'Custom'>('all');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const userCounts = React.useMemo(() => {
    try {
      const allUsers = getUsers();
      const counts: Record<string, number> = {};
      for (const u of allUsers) {
        if (u.restaurantName) {
          counts[u.restaurantName] = (counts[u.restaurantName] || 0) + 1;
        }
      }
      return counts;
    } catch {
      return {};
    }
  }, []);

  const visibleRestaurants = React.useMemo(() => {
    let list = [...restaurants];

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        (r.name_ar && r.name_ar.toLowerCase().includes(q)) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.ownerEmail.toLowerCase().includes(q) ||
        r.branches.some((b) => b.name.toLowerCase().includes(q))
      );
    }

    // Plan filter
    if (planFilter !== 'all') {
      const pf = planFilter.toLowerCase();
      list = list.filter((r) => {
        const matchesRest = r.planName.toLowerCase().includes(pf);
        const matchesBranch = r.branches.some((b) => b.planName.toLowerCase().includes(pf));
        if (planFilter === 'Custom') {
          return matchesRest || matchesBranch ||
            r.planName.toLowerCase().includes('private') ||
            r.branches.some((b) => b.planName.toLowerCase().includes('private'));
        }
        return matchesRest || matchesBranch;
      });
    }

    // Sort by
    if (sortBy === 'revenue') {
      list.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (sortBy === 'users') {
      list.sort((a, b) => (userCounts[b.name] || 0) - (userCounts[a.name] || 0));
    } else if (sortBy === 'branches') {
      list.sort((a, b) => b.branches.length - a.branches.length);
    } else if (expiringOnly) {
      list.sort((a, b) => Date.parse(a.planExpiry) - Date.parse(b.planExpiry));
    }

    return list;
  }, [restaurants, searchQuery, planFilter, sortBy, expiringOnly, userCounts]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title={t('franchiseTitle')}
        subtitle={t('franchiseSubtitle')}
      />

      <main className="flex-1 p-4 sm:p-6 xl:p-8 space-y-6 max-w-[1920px] mx-auto w-full">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#2D2F33]">{t('title')}</h2>
            <p className="text-[#989898] mt-1">{t('subtitle')}</p>
          </div>
        </div>

        {/* Toolbar: Search, Sort by, Filter by plans, Create button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search size={18} className="absolute start-5 top-1/2 -translate-y-1/2 text-[#989898]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'البحث عن المطاعم والمالكين...' : 'Search restaurants, owners...'}
                className="w-full h-12 ps-12 pe-4 bg-white border border-gray-200 rounded-full text-sm text-[#2D2F33] placeholder:text-[#989898] focus:outline-none focus:ring-2 focus:ring-[#026F4F]/30 transition-all"
              />
            </div>

            {/* Sort by dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSortDropdownOpen(!sortDropdownOpen);
                  setFilterDropdownOpen(false);
                }}
                className={`h-12 px-5 rounded-full border text-sm font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer ${
                  sortBy !== 'none'
                    ? 'bg-[#026F4F]/10 border-[#026F4F]/30 text-[#026F4F]'
                    : 'bg-white border-gray-200 text-[#2D2F33] hover:bg-gray-50'
                }`}
              >
                <ArrowUpDown size={16} className={sortBy !== 'none' ? 'text-[#026F4F]' : 'text-[#686868]'} />
                <span>
                  {sortBy === 'none'
                    ? t('sortBy')
                    : sortBy === 'revenue'
                    ? t('sortRevenue')
                    : sortBy === 'users'
                    ? t('sortUsers')
                    : t('sortBranches')}
                </span>
                <ChevronDown size={16} className="text-[#989898]" />
              </button>

              {sortDropdownOpen && (
                <div className="absolute start-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('none');
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      sortBy === 'none' ? 'font-semibold text-[#026F4F]' : 'text-[#2D2F33]'
                    }`}
                  >
                    <span>{t('sortDefault')}</span>
                    {sortBy === 'none' && <Check size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('revenue');
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      sortBy === 'revenue' ? 'font-semibold text-[#026F4F]' : 'text-[#2D2F33]'
                    }`}
                  >
                    <span>{t('sortRevenue')}</span>
                    {sortBy === 'revenue' && <Check size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('users');
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      sortBy === 'users' ? 'font-semibold text-[#026F4F]' : 'text-[#2D2F33]'
                    }`}
                  >
                    <span>{t('sortUsers')}</span>
                    {sortBy === 'users' && <Check size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('branches');
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      sortBy === 'branches' ? 'font-semibold text-[#026F4F]' : 'text-[#2D2F33]'
                    }`}
                  >
                    <span>{t('sortBranches')}</span>
                    {sortBy === 'branches' && <Check size={16} />}
                  </button>
                </div>
              )}
            </div>

            {/* Filter by plans dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setFilterDropdownOpen(!filterDropdownOpen);
                  setSortDropdownOpen(false);
                }}
                className={`h-12 px-5 rounded-full border text-sm font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer ${
                  planFilter !== 'all'
                    ? 'bg-[#026F4F]/10 border-[#026F4F]/30 text-[#026F4F]'
                    : 'bg-white border-gray-200 text-[#2D2F33] hover:bg-gray-50'
                }`}
              >
                <Filter size={16} className={planFilter !== 'all' ? 'text-[#026F4F]' : 'text-[#686868]'} />
                <span>
                  {planFilter === 'all'
                    ? t('filterPlans')
                    : planFilter === 'Custom'
                    ? (isAr ? 'خطة خاصة' : 'Private Plan')
                    : `${planFilter} Plan`}
                </span>
                <ChevronDown size={16} className="text-[#989898]" />
              </button>

              {filterDropdownOpen && (
                <div className="absolute start-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
                  {(['all', 'Basic', 'Pro', 'Enterprise', 'Custom'] as const).map((pf) => (
                    <button
                      key={pf}
                      type="button"
                      onClick={() => {
                        setPlanFilter(pf);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                        planFilter === pf ? 'font-semibold text-[#026F4F]' : 'text-[#2D2F33]'
                      }`}
                    >
                      <span>
                        {pf === 'all'
                          ? t('allPlans')
                          : pf === 'Custom'
                          ? (isAr ? 'خطة خاصة' : 'Private Plan')
                          : `${pf} Plan`}
                      </span>
                      {planFilter === pf && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="h-12 px-6 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={20} />
            <span>{t('create')}</span>
          </button>
        </div>

        {expiringOnly && (
          <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => setExpiringOnly(false)}
              className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#026F4F] outline outline-1 outline-[#026F4F]/30 transition-colors hover:bg-[#026F4F] hover:text-white cursor-pointer"
            >
              Show all restaurants
            </button>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              {/* Header: Centered columns under PLANS, BRANCHES, STATUS, DATE OF SUB, SUB UNTIL */}
              <div className={`grid ${COLS} gap-4 px-6 py-4 bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide`}>
                <span>{t('columns.restaurantsOwners')}</span>
                <span className="text-center">{t('columns.plans')}</span>
                <span className="text-center">{t('columns.branches')}</span>
                <span className="text-center">{t('columns.status')}</span>
                <span className="text-center">{t('columns.dateOfSub')}</span>
                <span className="text-center">{t('columns.subUntil')}</span>
                <span className="sticky end-0 bg-[#F8F9FA] text-end">{t('columns.actions')}</span>
              </div>

              {visibleRestaurants.map((rest) => {
                const isOpen = expanded[rest.id] ?? false;
                return (
                  <div key={rest.id} className="border-t border-gray-100 first:border-t-0">
                    {/* Restaurant group row */}
                    <div className={`grid ${COLS} gap-4 px-6 py-5 items-center`}>
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggle(rest.id)}
                          aria-label={isOpen ? t('collapseBranches') : t('expandBranches')}
                          className="mt-1 text-[#2D2F33] hover:text-[#026F4F] transition-colors cursor-pointer"
                        >
                          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <div>
                          <p className="font-semibold text-[#2D2F33] text-[17px]">{locField(locale, rest, 'name')}</p>
                          <p className="text-sm text-[#989898] mt-0.5">
                            <bdi dir="ltr">{rest.ownerName}</bdi> <span className="ms-3"><bdi dir="ltr">{rest.ownerEmail}</bdi></span>
                          </p>
                          {/* Bug-1: owner's primary number under the email. */}
                          {rest.ownerPhone && (
                            <p className="text-sm text-[#989898] mt-0.5"><bdi dir="ltr">{rest.ownerPhone}</bdi></p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-center items-center"><Dash /></div>
                      <div className="flex items-center justify-center gap-1.5 text-sm text-[#686868]">
                        <Building2 size={16} />
                        {t('branchCountLabel', { count: rest.branches.length })}
                      </div>
                      <div className="flex justify-center items-center"><Dash /></div>
                      <div className="flex justify-center items-center"><Dash /></div>
                      <div className="flex justify-center items-center"><Dash /></div>
                      <span className="sticky end-0 bg-white flex justify-end">
                        <button
                          onClick={() => openFlow({ restaurantId: rest.id })}
                          aria-label={`${tc('edit')} ${locField(locale, rest, 'name')}`}
                          className="w-11 h-11 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors cursor-pointer"
                        >
                          <Image src="/images/figma/pencil.svg" alt="" width={18} height={18} className="size-[18px]" />
                        </button>
                      </span>
                    </div>

                    {/* Branch rows: full-width container matching table grid exactly */}
                    {isOpen && (
                      <div className="bg-[#F8F9FA]/80 divide-y divide-gray-200/60 border-t border-gray-100">
                        {rest.branches.map((branch) => {
                          const pill = planPill(locField(locale, branch, 'planName') || locField(locale, rest, 'planName'), locale);
                          return (
                            <div key={branch.id} className={`grid ${COLS} gap-4 px-6 py-4 items-center`}>
                              <div className="min-w-0 ps-6 sm:ps-8">
                                <p className="font-semibold text-[#2D2F33] uppercase text-[15px]">
                                  {locField(locale, branch, 'name')}
                                </p>
                                {/* Bug-5: branch email & phone right in the list. */}
                                {branch.managerEmail && (
                                  <p className="text-sm text-[#989898] mt-0.5 truncate"><bdi dir="ltr">{branch.managerEmail}</bdi></p>
                                )}
                                {branch.phone && (
                                  <p className="text-sm text-[#989898] mt-0.5"><bdi dir="ltr">{branch.phone}</bdi></p>
                                )}
                              </div>
                              <div className="flex flex-col items-center justify-center text-center">
                                <span className={`inline-block text-sm font-medium px-4 py-1.5 rounded-full ${pill.classes}`}>
                                  {pill.label}
                                </span>
                                <p className="text-[15px] font-bold text-[#2D2F33] mt-1.5">
                                  EGP {(branch.monthlyFee || rest.planPrice).toLocaleString()}{' '}
                                  <span className="text-xs font-normal text-[#989898]">
                                    {t('perMonthBilling', { billing: rest.planBilling.toLowerCase() })}
                                  </span>
                                </p>
                              </div>
                              <div className="flex justify-center items-center"><Dash /></div>
                              <div className="flex justify-center items-center">
                                <span
                                  className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                                    rest.status === 'Active'
                                      ? 'bg-[#D9F5D9] text-[#158F15]'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {rest.status === 'Active' ? ts('active') : rest.status === 'Pending' ? ts('pending') : ts('suspended')}
                                </span>
                              </div>
                              <div className="flex justify-center items-center text-center">
                                <span className="text-sm text-[#2D2F33]">{locField(locale, rest, 'joinedDate')}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center text-center gap-1">
                                <span className="text-sm text-[#2D2F33]">{locField(locale, rest, 'planExpiry')}</span>
                                {expiringOnly && (() => {
                                  const d = daysLeft(rest.planExpiry);
                                  if (d === null) return null;
                                  const label = d < 0 ? `Overdue ${Math.abs(d)}d` : d === 0 ? 'Expires today' : `${d}d left`;
                                  return (
                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${d <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {label}
                                    </span>
                                  );
                                })()}
                              </div>
                              {/* Bug-10: edit each branch directly — opens the
                                  branch Overview tab in the restaurant flow. */}
                              <span className="sticky end-0 bg-[#F8F9FA] flex justify-end">
                                <button
                                  onClick={() => openFlow({ restaurantId: rest.id, branch: { id: branch.id, tab: 'Overview' } })}
                                  aria-label={`${tc('edit')} ${locField(locale, branch, 'name')}`}
                                  className="w-11 h-11 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors cursor-pointer"
                                >
                                  <Image src="/images/figma/pencil.svg" alt="" width={18} height={18} className="size-[18px]" />
                                </button>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <CreateRestaurantModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(newRest) => {
          addRestaurant(newRest);
          setRestaurants(getRestaurants());
          setExpanded((prev) => ({ ...prev, [newRest.id]: true }));
        }}
        onViewRestaurant={(id) => {
          setCreateOpen(false);
          openFlow({ restaurantId: id });
        }}
      />

      {flowOpen && flow && (
        <RestaurantFlowModal
          key={`${flow.restaurantId}-${flow.branch?.id || 'rest'}`}
          restaurantId={flow.restaurantId}
          initialBranch={flow.branch || null}
          onClose={closeFlowModal}
        />
      )}
    </div>
  );
}
