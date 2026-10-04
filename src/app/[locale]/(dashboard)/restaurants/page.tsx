'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, ChevronUp, ChevronDown, Building2, SquarePen } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { getRestaurants, addRestaurant } from '@/data/restaurantStore';
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

  const visibleRestaurants = React.useMemo(() => {
    if (!expiringOnly) return restaurants;
    return [...restaurants].sort((a, b) => Date.parse(a.planExpiry) - Date.parse(b.planExpiry));
  }, [restaurants, expiringOnly]);

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
          <button
            onClick={() => setCreateOpen(true)}
            className="h-12 px-6 rounded-full bg-[#026F4F] hover:bg-[#01533B] text-white font-medium shadow-md flex items-center gap-2 transition-all"
          >
            <Plus size={20} />
            <span>{t('create')}</span>
          </button>
        </div>

        {expiringOnly && (
          <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => setExpiringOnly(false)}
              className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#026F4F] outline outline-1 outline-[#026F4F]/30 transition-colors hover:bg-[#026F4F] hover:text-white"
            >
              Show all restaurants
            </button>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              {/* Header */}
              <div className={`grid ${COLS} gap-4 px-6 py-4 bg-[#F8F9FA] text-xs font-semibold text-[#686868] uppercase tracking-wide`}>
                <span>{t('columns.restaurantsOwners')}</span>
                <span>{t('columns.plans')}</span>
                <span>{t('columns.branches')}</span>
                <span>{t('columns.status')}</span>
                <span>{t('columns.dateOfSub')}</span>
                <span>{t('columns.subUntil')}</span>
                <span className="sticky end-0 bg-[#F8F9FA] shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)] rtl:shadow-[8px_0_12px_-8px_rgba(0,0,0,0.15)]">{t('columns.actions')}</span>
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
                          className="mt-1 text-[#2D2F33] hover:text-[#026F4F] transition-colors"
                        >
                          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <div>
                          <p className="font-semibold text-[#2D2F33] text-[17px]">{locField(locale, rest, 'name')}</p>
                          <p className="text-sm text-[#989898] mt-0.5">
                            <bdi dir="ltr">{rest.ownerName}</bdi> <span className="ms-3"><bdi dir="ltr">{rest.ownerEmail}</bdi></span>
                          </p>
                        </div>
                      </div>
                      <Dash />
                      <span className="flex items-center gap-1.5 text-sm text-[#686868]">
                        <Building2 size={16} />
                        {t('branchCountLabel', { count: rest.branches.length })}
                      </span>
                      <Dash />
                      <Dash />
                      <Dash />
                      <span className="sticky end-0 bg-white shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)] rtl:shadow-[8px_0_12px_-8px_rgba(0,0,0,0.15)] flex justify-end">
                        <button
                          onClick={() => openFlow({ restaurantId: rest.id })}
                          aria-label={`${tc('edit')} ${locField(locale, rest, 'name')}`}
                          className="w-11 h-11 rounded-lg bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#686868] hover:text-[#2D2F33] transition-colors"
                        >
                          <SquarePen size={18} />
                        </button>
                      </span>
                    </div>

                    {/* Branch rows */}
                    {isOpen && (
                      <div className="mx-4 sm:mx-6 mb-4 bg-[#F8F9FA] rounded-2xl px-6 py-2 divide-y divide-gray-200/70">
                        {rest.branches.map((branch) => {
                          const pill = planPill(locField(locale, rest, 'planName') || rest.planName, locale);
                          return (
                            <div key={branch.id} className={`grid ${COLS} gap-4 py-4 items-center`}>
                              <p className="font-semibold text-[#2D2F33] uppercase text-[15px]">
                                {locField(locale, branch, 'name')}
                              </p>
                              <div>
                                <span className={`inline-block text-sm font-medium px-4 py-1.5 rounded-full ${pill.classes}`}>
                                  {pill.label}
                                </span>
                                <p className="text-[15px] font-bold text-[#2D2F33] mt-1.5">
                                  ${rest.planPrice.toLocaleString()}{' '}
                                  <span className="text-xs font-normal text-[#989898]">
                                    {t('perMonthBilling', { billing: rest.planBilling.toLowerCase() })}
                                  </span>
                                </p>
                              </div>
                              <Dash />
                              <span>
                                <span
                                  className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                                    rest.status === 'Active'
                                      ? 'bg-[#D9F5D9] text-[#158F15]'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {rest.status === 'Active' ? ts('active') : rest.status === 'Pending' ? ts('pending') : ts('suspended')}
                                </span>
                              </span>
                              <span className="text-sm text-[#2D2F33]">{locField(locale, rest, 'joinedDate')}</span>
                              <div className="flex flex-col items-start gap-1">
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
                              {/* Bug-16: no branch-level edit buttons — editing lives in the restaurant modal. */}
                              <span className="sticky end-0 bg-[#F8F9FA] shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)] rtl:shadow-[8px_0_12px_-8px_rgba(0,0,0,0.15)] flex justify-end">
                                <Dash />
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
