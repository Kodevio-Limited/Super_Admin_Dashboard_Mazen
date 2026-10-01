// Plan catalog + billing cycles taken from Figma:
// - "Create new Restaurant 5" (1859:336), Modify Plan (1692:72598),
//   Manual Activation (1864:870).
// Prices are the Figma /mo figures; multi-month cycles derive the effective
// monthly rate from Figma's stated discounts (5/10/20%).

export type FigmaTier = 'Basic' | 'Pro' | 'Enterprise';
export type FigmaBillingCycle = 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Yearly';

export interface FigmaTierDef {
  tier: FigmaTier;
  tier_ar?: string;
  monthlyPrice: number;
  branchLimit: string;
  branchLimit_ar?: string;
  features: string[];
  features_ar?: string[];
  isPopular?: boolean;
}

export const FIGMA_TIERS: FigmaTierDef[] = [
  {
    tier: 'Basic',
    tier_ar: 'الأساسية',
    monthlyPrice: 19,
    branchLimit: '1 Branch',
    branchLimit_ar: 'فرع واحد',
    features: ['Core POS', 'Basic Reporting'],
    features_ar: ['نقطة بيع أساسية', 'تقارير أساسية'],
  },
  {
    tier: 'Pro',
    tier_ar: 'الاحترافية',
    monthlyPrice: 63,
    branchLimit: 'Up to 5 Branches',
    branchLimit_ar: 'حتى 5 فروع',
    features: ['Advanced Analytics', 'Online Ordering', 'Inventory'],
    features_ar: ['تحليلات متقدمة', 'طلب عبر الإنترنت', 'المخزون'],
    isPopular: true,
  },
  {
    tier: 'Enterprise',
    tier_ar: 'المؤسسية',
    monthlyPrice: 191,
    branchLimit: 'Unlimited Branches',
    branchLimit_ar: 'فروع غير محدودة',
    features: ['Custom API', 'Dedicated Manager', 'Custom Roles'],
    features_ar: ['واجهة برمجة مخصصة', 'مدير مخصص', 'أدوار مخصصة'],
  },
];

export interface FigmaCycleDef {
  cycle: FigmaBillingCycle;
  label: string;
  label_ar?: string;
  saveLabel?: string;
  saveLabel_ar?: string;
  months: number;
  discount: number;
}

export const FIGMA_CYCLES: FigmaCycleDef[] = [
  { cycle: 'Monthly', label: 'Monthly', label_ar: 'شهري', months: 1, discount: 0 },
  { cycle: 'Quarterly', label: 'Quarterly', label_ar: 'ربع سنوي', saveLabel: 'Save 5%', saveLabel_ar: 'وفّر 5%', months: 3, discount: 0.05 },
  { cycle: 'SemiAnnually', label: 'Semi Annually', label_ar: 'نصف سنوي', saveLabel: 'Save 10%', saveLabel_ar: 'وفّر 10%', months: 6, discount: 0.1 },
  { cycle: 'Yearly', label: 'Yearly', label_ar: 'سنوي', saveLabel: 'Save 20%', saveLabel_ar: 'وفّر 20%', months: 12, discount: 0.2 },
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
  /** Arabic plan name (Bug-53). */
  nameAr?: string;
  /** Plan description (Bug-53). */
  description?: string;
  /** Arabic plan description (Bug-53). */
  descriptionAr?: string;
  kind: 'Restaurant' | 'Branch';
  prices: { monthly: number; yearly: number; quarterly: number; semi: number };
  maxTables?: number;
  maxBranches?: number;
  maxStaff?: number;
  maxOrders?: number;
  modules: string[];
  isPrivate?: boolean;
  /** Hidden plans are only visible to super admins — customers can neither
      see nor subscribe to them from their dashboards (Bug-52). */
  hidden?: boolean;
}

// Arabic display labels for custom-plan module keys (stored in English).
export const MODULE_AR: Record<string, string> = {
  'Inventory Management': 'إدارة المخزون',
  'Kitchen Display System (KDS)': 'نظام شاشة المطبخ (KDS)',
  'Advanced Analytics': 'تحليلات متقدمة',
  'Online Ordering': 'طلب عبر الإنترنت',
};

export function moduleArLabel(module: string, locale = 'en'): string {
  if (locale === 'ar') return MODULE_AR[module] ?? module;
  return module;
}

export function customPlanBranchLimit(plan: CustomPlan, locale = 'en'): string {
  const ar = locale === 'ar';
  if (plan.maxBranches === undefined) return ar ? 'فروع غير محدودة' : 'Unlimited Branches';
  if (plan.maxBranches <= 1) return ar ? 'فرع واحد' : '1 Branch';
  return ar ? `حتى ${plan.maxBranches} فروع` : `Up to ${plan.maxBranches} Branches`;
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
// Pass locale='ar' to get the Arabic pill label (English stays untouched).
export function planPill(planName: string, locale = 'en'): {
  label: string;
  classes: string;
} {
  const ar = locale === 'ar';
  const n = planName.toLowerCase();
  if (n.includes('professional') || /(^|\s)pro(\s|$)/.test(n) || n.includes('الاحتراف'))
    return { label: ar ? 'الاحترافية' : 'Pro', classes: 'bg-[#D6EBFF] text-[#1573D1]' };
  if (n.includes('basic') || n.includes('trial') || n.includes('starter') || n.includes('الأساس') || n.includes('التجريب') || n.includes('المبتدئ'))
    return { label: ar ? 'الأساسية' : 'Basic', classes: 'bg-[#FFF3C0] text-[#9A7B00]' };
  return { label: ar ? 'مخصصة' : 'Custom', classes: 'bg-[#FBD9F9] text-[#B93DBE]' };
}

// Short tier description for the Subscription dark card. Only the Pro copy
// comes from Figma ("Perfect for growing restaurants managing high volumes.");
// the rest are neutral fallbacks.
export function tierBlurb(planName: string, locale = 'en'): string {
  const ar = locale === 'ar';
  const n = planName.toLowerCase();
  if (n.includes('professional') || n.includes('pro ') || n.includes('الاحتراف'))
    return ar ? 'مثالي للمطاعم المتنامية التي تدير أحجامًا مرتفعة.' : 'Perfect for growing restaurants managing high volumes.';
  if (n.includes('basic') || n.includes('trial') || n.includes('starter') || n.includes('الأساس') || n.includes('التجريب'))
    return ar ? 'مثالي لمطاعم الموقع الواحد التي تبدأ نشاطها.' : 'Perfect for single-location restaurants starting out.';
  return ar ? 'مصمم لسلاسل الامتياز متعددة الفروع واسعة النطاق.' : 'Built for multi-branch franchises operating at scale.';
}
