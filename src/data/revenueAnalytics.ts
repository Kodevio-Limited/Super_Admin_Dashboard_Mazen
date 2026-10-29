// Growth & retention analytics for Revenue & Reports — MRR/ARR, NRR, CAC,
// LTV:CAC, ROAS, churn, CAC payback, trial→paid, ARPU, customer movement and
// active free trials.
//
// Frontend-only: every figure is a static display value shaped like the future
// API payload. Numbers are intentionally derived from a single set of drivers
// so the cards, drawers and period toggles stay consistent.
// TODO(api): GET /analytics/growth?window=30d|12m.

import {
  ChurnedCustomer,
  CustomerMovementPeriod,
  CustomerMovementPoint,
  FreeTrial,
} from '@/types/admin';

const int = (n: number) => Math.round(n).toLocaleString('en-US');
const money = (n: number) => `EGP ${int(n)}`;
const money2 = (n: number) =>
  `EGP ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

// --- Drivers (current billing month) --------------------------------------

const MRR = 8_940;
const PAID_ACCOUNTS = 142;
const ACTIVE_ACCOUNTS = 155;
const GROSS_MARGIN = 0.85;

// MRR movement this month — starting MRR + new + expansion − contraction −
// churned = closing MRR (the NRR waterfall).
const MRR_START = 7_900;
const MRR_NEW = 570;
const MRR_EXPANSION = 860;
const MRR_CONTRACTION = 140;
const MRR_CHURNED = 250;

// Acquisition — last 30 days.
const NEW_CUSTOMERS = 12;
const SALES_MARKETING_SPEND = 2_400;
const AD_SPEND = 2_100;

// Trials — last 30 days.
const TRIALS_STARTED = 64;
const TRIALS_CONVERTED = 17;

// --- Derived metrics ------------------------------------------------------

export const ARR = MRR * 12;
export const MRR_MOM = (MRR - MRR_START) / MRR_START;
export const NRR = (MRR_START + MRR_EXPANSION - MRR_CONTRACTION - MRR_CHURNED) / MRR_START;
export const GRR = (MRR_START - MRR_CONTRACTION - MRR_CHURNED) / MRR_START;
export const ARPU = MRR / PAID_ACCOUNTS;
export const CAC = SALES_MARKETING_SPEND / NEW_CUSTOMERS;
/** Monthly gross profit per paid account — the payback denominator. */
export const CONTRIBUTION_PER_ACCOUNT = ARPU * GROSS_MARGIN;

export const CHURN_ACCOUNTS = 13;
export const CHURN_RATE = CHURN_ACCOUNTS / ACTIVE_ACCOUNTS;
/** Average paid lifetime in months, derived from the annual logo churn rate. */
export const AVG_LIFETIME_MONTHS = 1 / CHURN_RATE;
export const LTV = CONTRIBUTION_PER_ACCOUNT * AVG_LIFETIME_MONTHS;
export const LTV_CAC = LTV / CAC;
export const PAYBACK_MONTHS = CAC / CONTRIBUTION_PER_ACCOUNT;
export const ATTRIBUTED_REVENUE = NEW_CUSTOMERS * ARPU * 12;
export const ROAS = ATTRIBUTED_REVENUE / AD_SPEND;
export const TRIAL_CONVERSION = TRIALS_CONVERTED / TRIALS_STARTED;

// --- MRR trend (EGP) ------------------------------------------------------

export const MRR_TREND = [
  { month: 'Jan', month_ar: 'يناير', value: 5_240 },
  { month: 'Feb', month_ar: 'فبراير', value: 5_780 },
  { month: 'Mar', month_ar: 'مارس', value: 6_150 },
  { month: 'Apr', month_ar: 'أبريل', value: 6_600 },
  { month: 'May', month_ar: 'مايو', value: 7_020 },
  { month: 'Jun', month_ar: 'يونيو', value: 7_410 },
  { month: 'Jul', month_ar: 'يوليو', value: 7_900 },
  { month: 'Aug', month_ar: 'أغسطس', value: MRR },
];

// --- Churned customers (trailing 12 months) -------------------------------
// `mrrLost` sums to the "MRR lost" figure on the churn card.

export const CHURNED_CUSTOMERS: ChurnedCustomer[] = [
  {
    id: 'ch-01',
    restaurant: 'El Gaucho Steakhouse',
    restaurant_ar: 'مطعم إل غاوتشو',
    ownerEmail: 'hector@elgaucho.com',
    plan: 'Enterprise',
    churnedOn: 'Aug 02, 2026',
    churnedOn_ar: '2 أغسطس 2026',
    tenureMonths: 22,
    mrrLost: 191,
    reason: 'competitor',
  },
  {
    id: 'ch-02',
    restaurant: 'Tokyo Ramen House',
    restaurant_ar: 'طوكيو رامن هاوس',
    ownerEmail: 'alexander@tokyodining.com',
    plan: 'Pro',
    churnedOn: 'Jul 18, 2026',
    churnedOn_ar: '18 يوليو 2026',
    tenureMonths: 14,
    mrrLost: 63,
    reason: 'budget',
  },
  {
    id: 'ch-03',
    restaurant: 'Casa Mia Italian',
    restaurant_ar: 'كازا ميا الإيطالي',
    ownerEmail: 'marcus@casamiapizza.com',
    plan: 'Pro',
    churnedOn: 'Jul 09, 2026',
    churnedOn_ar: '9 يوليو 2026',
    tenureMonths: 9,
    mrrLost: 63,
    reason: 'closed',
  },
  {
    id: 'ch-04',
    restaurant: 'The Shamrock Pub',
    restaurant_ar: 'ذا شامروك بب',
    ownerEmail: 'liam@dublinpub.com',
    plan: 'Pro',
    churnedOn: 'Jun 27, 2026',
    churnedOn_ar: '27 يونيو 2026',
    tenureMonths: 11,
    mrrLost: 63,
    reason: 'competitor',
  },
  {
    id: 'ch-05',
    restaurant: 'Bistro Belle',
    restaurant_ar: 'بيسترو بيل',
    ownerEmail: 'chloe@bistrobelle.com',
    plan: 'Basic',
    churnedOn: 'Jun 15, 2026',
    churnedOn_ar: '15 يونيو 2026',
    tenureMonths: 6,
    mrrLost: 19,
    reason: 'noEngagement',
  },
  {
    id: 'ch-06',
    restaurant: "L'Étoile Grill",
    restaurant_ar: 'مطعم ليتوال جريل',
    ownerEmail: 'tariq@grilletoile.com',
    plan: 'Pro',
    churnedOn: 'May 30, 2026',
    churnedOn_ar: '30 مايو 2026',
    tenureMonths: 16,
    mrrLost: 63,
    reason: 'consolidated',
  },
  {
    id: 'ch-07',
    restaurant: 'Burger Haven',
    restaurant_ar: 'برجر هافن',
    ownerEmail: 'omar@burgerhaven.com',
    plan: 'Pro',
    churnedOn: 'May 12, 2026',
    churnedOn_ar: '12 مايو 2026',
    tenureMonths: 8,
    mrrLost: 63,
    reason: 'paymentFailures',
  },
  {
    id: 'ch-08',
    restaurant: 'Saffron & Sage',
    restaurant_ar: 'سافرون آند سيج',
    ownerEmail: 'rana@saffronsage.com',
    plan: 'Private Plan',
    churnedOn: 'Apr 24, 2026',
    churnedOn_ar: '24 أبريل 2026',
    tenureMonths: 19,
    mrrLost: 120,
    reason: 'downgraded',
  },
  {
    id: 'ch-09',
    restaurant: 'Noodle Theory',
    restaurant_ar: 'نودل ثيري',
    ownerEmail: 'kenji@noodleth.com',
    plan: 'Basic',
    churnedOn: 'Apr 03, 2026',
    churnedOn_ar: '3 أبريل 2026',
    tenureMonths: 5,
    mrrLost: 19,
    reason: 'closed',
  },
  {
    id: 'ch-10',
    restaurant: 'Blue Harbor Seafood',
    restaurant_ar: 'بلو هاربر للمأكولات البحرية',
    ownerEmail: 'nadia@blueharbor.com',
    plan: 'Pro',
    churnedOn: 'Mar 21, 2026',
    churnedOn_ar: '21 مارس 2026',
    tenureMonths: 12,
    mrrLost: 63,
    reason: 'competitor',
  },
  {
    id: 'ch-11',
    restaurant: 'Verde Taqueria',
    restaurant_ar: 'فيردي تاكيريا',
    ownerEmail: 'diego@verdetaco.com',
    plan: 'Basic',
    churnedOn: 'Mar 08, 2026',
    churnedOn_ar: '8 مارس 2026',
    tenureMonths: 7,
    mrrLost: 19,
    reason: 'noEngagement',
  },
  {
    id: 'ch-12',
    restaurant: 'Paper Lantern Sushi',
    restaurant_ar: 'بيبر لانترن سوشي',
    ownerEmail: 'mina@paperlantern.com',
    plan: 'Pro',
    churnedOn: 'Feb 17, 2026',
    churnedOn_ar: '17 فبراير 2026',
    tenureMonths: 10,
    mrrLost: 63,
    reason: 'budget',
  },
  {
    id: 'ch-13',
    restaurant: 'Copper Pot Diner',
    restaurant_ar: 'كوبر بوت داينر',
    ownerEmail: 'sami@copperpot.com',
    plan: 'Private Plan',
    churnedOn: 'Jan 29, 2026',
    churnedOn_ar: '29 يناير 2026',
    tenureMonths: 24,
    mrrLost: 85,
    reason: 'merged',
  },
];

export const CHURNED_MRR = CHURNED_CUSTOMERS.reduce((sum, c) => sum + c.mrrLost, 0);
export const REVENUE_CHURN = CHURNED_MRR / MRR;

// --- Active free trials ---------------------------------------------------

export const FREE_TRIALS: FreeTrial[] = [
  {
    id: 'tr-01',
    restaurant: 'Cairo Grill House',
    restaurant_ar: 'بيت الشواء القاهري',
    plan: 'Enterprise',
    ownerName: 'Mostafa Adel',
    ownerName_ar: 'مصطفى عادل',
    ownerEmail: 'mostafa@cairogrill.com',
    startedOn: 'Aug 14, 2026',
    startedOn_ar: '14 أغسطس 2026',
    daysLeft: 2,
    branches: 4,
    lastActive: 'Today, 09:12',
    lastActive_ar: 'اليوم 09:12',
  },
  {
    id: 'tr-02',
    restaurant: 'The Green Fork',
    restaurant_ar: 'ذا جرين فورك',
    plan: 'Pro',
    ownerName: 'Yasmin Hany',
    ownerName_ar: 'ياسمين هاني',
    ownerEmail: 'yasmin@greenfork.com',
    startedOn: 'Aug 13, 2026',
    startedOn_ar: '13 أغسطس 2026',
    daysLeft: 3,
    branches: 2,
    lastActive: 'Today, 08:40',
    lastActive_ar: 'اليوم 08:40',
  },
  {
    id: 'tr-03',
    restaurant: 'Nile Bites',
    restaurant_ar: 'نايل بايتس',
    plan: 'Basic',
    ownerName: 'Ahmed Fouad',
    ownerName_ar: 'أحمد فؤاد',
    ownerEmail: 'ahmed@nilebites.com',
    startedOn: 'Aug 12, 2026',
    startedOn_ar: '12 أغسطس 2026',
    daysLeft: 5,
    branches: 1,
    lastActive: 'Yesterday, 21:05',
    lastActive_ar: 'أمس 21:05',
  },
  {
    id: 'tr-04',
    restaurant: 'Anatolia Kitchen',
    restaurant_ar: 'مطبخ الأناضول',
    plan: 'Pro',
    ownerName: 'Selin Demir',
    ownerName_ar: 'سلين دمير',
    ownerEmail: 'selin@anatoliakitchen.com',
    startedOn: 'Aug 11, 2026',
    startedOn_ar: '11 أغسطس 2026',
    daysLeft: 6,
    branches: 3,
    lastActive: 'Yesterday, 18:22',
    lastActive_ar: 'أمس 18:22',
  },
  {
    id: 'tr-05',
    restaurant: 'Salt & Smoke BBQ',
    restaurant_ar: 'سولت آند سموك باربكيو',
    plan: 'Pro',
    ownerName: 'Karim Nabil',
    ownerName_ar: 'كريم نبيل',
    ownerEmail: 'karim@saltandsmoke.com',
    startedOn: 'Aug 09, 2026',
    startedOn_ar: '9 أغسطس 2026',
    daysLeft: 8,
    branches: 2,
    lastActive: 'Today, 07:58',
    lastActive_ar: 'اليوم 07:58',
  },
  {
    id: 'tr-06',
    restaurant: 'Mango Tree Cafe',
    restaurant_ar: 'مانجو تري كافيه',
    plan: 'Basic',
    ownerName: 'Farah Selim',
    ownerName_ar: 'فرح سليم',
    ownerEmail: 'farah@mangotree.com',
    startedOn: 'Aug 07, 2026',
    startedOn_ar: '7 أغسطس 2026',
    daysLeft: 9,
    branches: 1,
    lastActive: 'Aug 25, 16:31',
    lastActive_ar: '25 أغسطس 16:31',
  },
  {
    id: 'tr-07',
    restaurant: "Aladdin's Oven",
    restaurant_ar: 'فرن علاء الدين',
    plan: 'Pro',
    ownerName: 'Hassan Rady',
    ownerName_ar: 'حسن راضي',
    ownerEmail: 'hassan@aladdinsoven.com',
    startedOn: 'Aug 05, 2026',
    startedOn_ar: '5 أغسطس 2026',
    daysLeft: 11,
    branches: 2,
    lastActive: 'Aug 25, 12:10',
    lastActive_ar: '25 أغسطس 12:10',
  },
  {
    id: 'tr-08',
    restaurant: 'Luna Beach Club',
    restaurant_ar: 'لونا بيتش كلوب',
    plan: 'Enterprise',
    ownerName: 'Dina Sherif',
    ownerName_ar: 'دينا شريف',
    ownerEmail: 'dina@lunabeach.com',
    startedOn: 'Aug 04, 2026',
    startedOn_ar: '4 أغسطس 2026',
    daysLeft: 12,
    branches: 5,
    lastActive: 'Aug 24, 19:47',
    lastActive_ar: '24 أغسطس 19:47',
  },
  {
    id: 'tr-09',
    restaurant: 'Taco Loco',
    restaurant_ar: 'تاكو لوكو',
    plan: 'Basic',
    ownerName: 'Rami Ezz',
    ownerName_ar: 'رامي عز',
    ownerEmail: 'rami@tacoloco.com',
    startedOn: 'Aug 03, 2026',
    startedOn_ar: '3 أغسطس 2026',
    daysLeft: 13,
    branches: 1,
    lastActive: 'Aug 24, 10:15',
    lastActive_ar: '24 أغسطس 10:15',
  },
  {
    id: 'tr-10',
    restaurant: 'Sushi Ya',
    restaurant_ar: 'سوشي يا',
    plan: 'Pro',
    ownerName: 'Nour El Din',
    ownerName_ar: 'نور الدين',
    ownerEmail: 'nour@sushiya.com',
    startedOn: 'Aug 02, 2026',
    startedOn_ar: '2 أغسطس 2026',
    daysLeft: 14,
    branches: 2,
    lastActive: 'Aug 23, 22:03',
    lastActive_ar: '23 أغسطس 22:03',
  },
  {
    id: 'tr-11',
    restaurant: 'Falafel Factory',
    restaurant_ar: 'مصنع الفلافل',
    plan: 'Basic',
    ownerName: 'Tamer Sabry',
    ownerName_ar: 'تامر صبري',
    ownerEmail: 'tamer@falafelfactory.com',
    startedOn: 'Aug 01, 2026',
    startedOn_ar: '1 أغسطس 2026',
    daysLeft: 15,
    branches: 1,
    lastActive: 'Aug 23, 14:38',
    lastActive_ar: '23 أغسطس 14:38',
  },
  {
    id: 'tr-12',
    restaurant: 'Olive & Thyme',
    restaurant_ar: 'أوليف آند تايم',
    plan: 'Pro',
    ownerName: 'Mariam Zaki',
    ownerName_ar: 'مريم زكي',
    ownerEmail: 'mariam@oliveandthyme.com',
    startedOn: 'Jul 31, 2026',
    startedOn_ar: '31 يوليو 2026',
    daysLeft: 16,
    branches: 3,
    lastActive: 'Aug 22, 20:26',
    lastActive_ar: '22 أغسطس 20:26',
  },
  {
    id: 'tr-13',
    restaurant: 'Zaytoun Lebanese',
    restaurant_ar: 'زيتون اللبناني',
    plan: 'Enterprise',
    ownerName: 'Wael Hakim',
    ownerName_ar: 'وائل حكيم',
    ownerEmail: 'wael@zaytoun.com',
    startedOn: 'Jul 29, 2026',
    startedOn_ar: '29 يوليو 2026',
    daysLeft: 18,
    branches: 6,
    lastActive: 'Aug 22, 11:49',
    lastActive_ar: '22 أغسطس 11:49',
  },
];

export const TRIALS_ACTIVE = FREE_TRIALS.length;
export const TRIALS_EXPIRED = TRIALS_STARTED - TRIALS_CONVERTED - TRIALS_ACTIVE;
export const TRIALS_ENDING_SOON = FREE_TRIALS.filter((tr) => tr.daysLeft <= 7);
export const TRIALS_AVG_DAYS_LEFT =
  FREE_TRIALS.reduce((sum, tr) => sum + tr.daysLeft, 0) / TRIALS_ACTIVE;
/** Raw funnel numbers for the stacked trial bar. */
export const TRIAL_FUNNEL = {
  started: TRIALS_STARTED,
  converted: TRIALS_CONVERTED,
  active: TRIALS_ACTIVE,
  expired: TRIALS_EXPIRED,
};

// --- New vs. lost customers ----------------------------------------------
// Monthly points aggregate into quarters, halves and the year-to-date view so
// every period toggle tells the same story.

const MONTHLY_MOVEMENT = [
  { month: 'Jan', month_ar: 'يناير', year: 2026, quarter: 1, half: 1, newCustomers: 9, lostCustomers: 1 },
  { month: 'Feb', month_ar: 'فبراير', year: 2026, quarter: 1, half: 1, newCustomers: 8, lostCustomers: 2 },
  { month: 'Mar', month_ar: 'مارس', year: 2026, quarter: 1, half: 1, newCustomers: 10, lostCustomers: 1 },
  { month: 'Apr', month_ar: 'أبريل', year: 2026, quarter: 2, half: 1, newCustomers: 11, lostCustomers: 2 },
  { month: 'May', month_ar: 'مايو', year: 2026, quarter: 2, half: 1, newCustomers: 14, lostCustomers: 1 },
  { month: 'Jun', month_ar: 'يونيو', year: 2026, quarter: 2, half: 1, newCustomers: 13, lostCustomers: 2 },
  { month: 'Jul', month_ar: 'يوليو', year: 2026, quarter: 3, half: 2, newCustomers: 12, lostCustomers: 1 },
  { month: 'Aug', month_ar: 'أغسطس', year: 2026, quarter: 3, half: 2, newCustomers: 12, lostCustomers: 3 },
];

const QUARTER_AR: Record<number, string> = {
  1: 'الربع الأول',
  2: 'الربع الثاني',
  3: 'الربع الثالث',
  4: 'الربع الرابع',
};

function bucket(
  keyOf: (m: (typeof MONTHLY_MOVEMENT)[number]) => string,
  labelOf: (m: (typeof MONTHLY_MOVEMENT)[number]) => { label: string; label_ar: string },
): CustomerMovementPoint[] {
  const out: CustomerMovementPoint[] = [];
  for (const m of MONTHLY_MOVEMENT) {
    const key = keyOf(m);
    const last = out[out.length - 1];
    if (last && last.label === key) {
      last.newCustomers += m.newCustomers;
      last.lostCustomers += m.lostCustomers;
    } else {
      const { label, label_ar } = labelOf(m);
      out.push({ label, label_ar, newCustomers: m.newCustomers, lostCustomers: m.lostCustomers });
    }
  }
  return out;
}

export function customerMovement(period: CustomerMovementPeriod): CustomerMovementPoint[] {
  switch (period) {
    case 'quarterly':
      return bucket(
        (m) => `Q${m.quarter} ${m.year}`,
        (m) => ({ label: `Q${m.quarter} ${m.year}`, label_ar: `${QUARTER_AR[m.quarter]} ${m.year}` }),
      );
    case 'semiAnnual':
      return bucket(
        (m) => `H${m.half} ${m.year}`,
        (m) => ({
          label: `H${m.half} ${m.year}`,
          label_ar: `${m.half === 1 ? 'النصف الأول' : 'النصف الثاني'} ${m.year}`,
        }),
      );
    case 'annual':
      return bucket(
        (m) => `${m.year}`,
        (m) => ({ label: `${m.year} (YTD)`, label_ar: `${m.year} (حتى الآن)` }),
      );
    default:
      return bucket(
        (m) => `${m.month} ${m.year}`,
        (m) => ({ label: `${m.month} ${m.year}`, label_ar: `${m.month_ar} ${m.year}` }),
      );
  }
}

// --- Display helpers used by the page ------------------------------------

export const GROWTH_DISPLAY = {
  mrr: money(MRR),
  arr: money(ARR),
  mrrMom: `${MRR_MOM >= 0 ? '+' : '−'}${pct(Math.abs(MRR_MOM))}`,
  nrr: pct(NRR, 1),
  grr: pct(GRR, 1),
  mrrStart: money(MRR_START),
  expansion: `+${money(MRR_EXPANSION)}`,
  contraction: `−${money(MRR_CONTRACTION)}`,
  mrrChurned: `−${money(MRR_CHURNED)}`,
  mrrEnding: money(MRR_START + MRR_EXPANSION - MRR_CONTRACTION - MRR_CHURNED),
  arpu: money2(ARPU),
  paidAccounts: int(PAID_ACCOUNTS),
  contribution: money2(CONTRIBUTION_PER_ACCOUNT),
  grossMargin: pct(GROSS_MARGIN, 0),
  cac: money(CAC),
  smSpend: money(SALES_MARKETING_SPEND),
  newCustomers: int(NEW_CUSTOMERS),
  churnRate: pct(CHURN_RATE, 1),
  churnAccounts: int(CHURN_ACCOUNTS),
  revenueChurn: pct(REVENUE_CHURN, 1),
  churnedMrr: money(CHURNED_MRR),
  ltv: money(LTV),
  ltvCac: `${LTV_CAC.toFixed(1)}x`,
  lifetimeMonths: `${AVG_LIFETIME_MONTHS.toFixed(1)}`,
  roas: `${ROAS.toFixed(1)}x`,
  adSpend: money(AD_SPEND),
  attributedRevenue: money(ATTRIBUTED_REVENUE),
  payback: `${PAYBACK_MONTHS.toFixed(1)}`,
  trialConversion: pct(TRIAL_CONVERSION, 1),
  trialsStarted: int(TRIALS_STARTED),
  trialsConverted: int(TRIALS_CONVERTED),
  trialsExpired: int(TRIALS_EXPIRED),
  trialsActive: int(TRIALS_ACTIVE),
  trialsEndingSoon: int(TRIALS_ENDING_SOON.length),
  trialsAvgDaysLeft: TRIALS_AVG_DAYS_LEFT.toFixed(1),
  mrrTrend: MRR_TREND.map((d) => d.value),
};
