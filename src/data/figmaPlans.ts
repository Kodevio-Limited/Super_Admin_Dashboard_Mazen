// Plan catalog + billing cycles taken from Figma:
// - "Create new Restaurant 5" (1859:336), Modify Plan (1692:72598),
//   Manual Activation (1864:870).
// Prices are the Figma /mo figures; multi-month cycles derive the effective
// monthly rate from Figma's stated discounts (5/10/20%).

export type FigmaTier = 'Basic' | 'Pro' | 'Enterprise';
export type FigmaBillingCycle = 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Yearly';

export interface FigmaTierDef {
  tier: FigmaTier;
  monthlyPrice: number;
  branchLimit: string;
  features: string[];
  isPopular?: boolean;
}

export const FIGMA_TIERS: FigmaTierDef[] = [
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

export interface FigmaCycleDef {
  cycle: FigmaBillingCycle;
  label: string;
  saveLabel?: string;
  months: number;
  discount: number;
}

export const FIGMA_CYCLES: FigmaCycleDef[] = [
  { cycle: 'Monthly', label: 'Monthly', months: 1, discount: 0 },
  { cycle: 'Quarterly', label: 'Quarterly', saveLabel: 'Save 5%', months: 3, discount: 0.05 },
  { cycle: 'SemiAnnually', label: 'Semi Annually', saveLabel: 'Save 10%', months: 6, discount: 0.1 },
  { cycle: 'Yearly', label: 'Yearly', saveLabel: 'Save 20%', months: 12, discount: 0.2 },
];

export function effectiveMonthly(monthlyPrice: number, cycle: FigmaBillingCycle): number {
  const def = FIGMA_CYCLES.find((c) => c.cycle === cycle)!;
  return monthlyPrice * (1 - def.discount);
}

export function cycleTotal(monthlyPrice: number, cycle: FigmaBillingCycle): number {
  const def = FIGMA_CYCLES.find((c) => c.cycle === cycle)!;
  return Math.round(effectiveMonthly(monthlyPrice, cycle) * def.months);
}

export function formatMonthly(value: number): string {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

// Custom plans created through the Subscriptions plan-form frames
// (1525:3455 restaurant / 1869:1845 branch). Limits left blank/off mean
// unlimited, per the Figma note.
export interface CustomPlan {
  id: string;
  name: string;
  kind: 'Restaurant' | 'Branch';
  prices: { monthly: number; yearly: number; quarterly: number; semi: number };
  maxTables?: number;
  maxBranches?: number;
  maxStaff?: number;
  maxOrders?: number;
  modules: string[];
  isPrivate?: boolean;
}

export function customPlanBranchLimit(plan: CustomPlan): string {
  if (plan.maxBranches === undefined) return 'Unlimited Branches';
  if (plan.maxBranches <= 1) return '1 Branch';
  return `Up to ${plan.maxBranches} Branches`;
}

export function customPlanPrice(plan: CustomPlan, cycle: FigmaBillingCycle): number {
  switch (cycle) {
    case 'Monthly':
      return plan.prices.monthly;
    case 'Yearly':
      return plan.prices.yearly;
    case 'Quarterly':
      return plan.prices.quarterly;
    case 'SemiAnnually':
      return plan.prices.semi;
  }
}
// Maps legacy mock plan names onto the Figma pill vocabulary.
export function planPill(planName: string): {
  label: string;
  classes: string;
} {
  const n = planName.toLowerCase();
  if (n.includes('professional') || /(^|\s)pro(\s|$)/.test(n))
    return { label: 'Pro', classes: 'bg-[#D6EBFF] text-[#1573D1]' };
  if (n.includes('basic') || n.includes('trial') || n.includes('starter'))
    return { label: 'Basic', classes: 'bg-[#FFF3C0] text-[#9A7B00]' };
  return { label: 'Custom', classes: 'bg-[#FBD9F9] text-[#B93DBE]' };
}

// Short tier description for the Subscription dark card. Only the Pro copy
// comes from Figma ("Perfect for growing restaurants managing high volumes.");
// the rest are neutral fallbacks.
export function tierBlurb(planName: string): string {
  const n = planName.toLowerCase();
  if (n.includes('professional') || n.includes('pro '))
    return 'Perfect for growing restaurants managing high volumes.';
  if (n.includes('basic') || n.includes('trial') || n.includes('starter'))
    return 'Perfect for single-location restaurants starting out.';
  return 'Built for multi-branch franchises operating at scale.';
}
