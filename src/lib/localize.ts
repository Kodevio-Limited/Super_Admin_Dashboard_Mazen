// Locale-aware picker for parallel `_ar` mock fields.
// English source stays the source of truth; when `locale === 'ar'` and an
// `xxx_ar` value exists it wins, otherwise we fall back to English.

export function pickAr<T>(locale: string, en: T, ar: T | undefined): T {
  if (locale === 'ar' && ar !== undefined && ar !== null && ar !== '') return ar;
  return en;
}

/** Read `obj[key]` or `obj[key_ar]` depending on locale. */
export function locField<T extends object>(
  locale: string,
  obj: T,
  key: string,
): string {
  const rec = obj as Record<string, unknown>;
  const arKey = `${key}_ar`;
  if (locale === 'ar' && typeof rec[arKey] === 'string' && (rec[arKey] as string) !== '') {
    return rec[arKey] as string;
  }
  return String(rec[key] ?? '');
}

const EN_MONTH_AR: Record<string, string> = {
  Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل',
  May: 'مايو', Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس',
  Sep: 'سبتمبر', Sept: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر',
  January: 'يناير', February: 'فبراير', March: 'مارس', April: 'أبريل',
  June_: 'يونيو', July: 'يوليو', August: 'أغسطس',
  September: 'سبتمبر', October: 'أكتوبر', November: 'نوفمبر', December: 'ديسمبر',
};

/** Convert an English display date ("Sep 30, 2027", "Jan 12, 2027") to Arabic.
 *  Unknown formats pass through untouched. */
export function toArDate(enDate: string): string {
  if (!enDate) return enDate;
  let out = enDate;
  for (const [en, ar] of Object.entries(EN_MONTH_AR)) {
    out = out.replace(en, ar);
  }
  return out;
}

/** Arabic label for a Figma plan tier (falls back to the English tier). */
export function tierArLabel(tier: string): string {
  const n = tier.toLowerCase();
  if (n.includes('enterprise')) return 'المؤسسات';
  if (n.includes('professional') || /(^|\s)pro(\s|$)/.test(n)) return 'الاحترافية';
  if (n.includes('basic') || n.includes('trial') || n.includes('starter')) return 'الأساسية';
  return tier;
}

/** Full Arabic plan name for runtime-created plans ("Pro Plan" → "الخطة الاحترافية"). */
export function planNameAr(planName: string): string {
  const n = planName.toLowerCase();
  if (n.includes('enterprise')) return 'خطة المؤسسات';
  if (n.includes('professional') || /(^|\s)pro(\s|$)/.test(n)) return 'الخطة الاحترافية';
  if (n.includes('basic') || n.includes('trial') || n.includes('starter')) return 'الخطة الأساسية';
  return planName;
}

/** Arabic label for a billing cycle enum ("Quarterly" → "ربع سنوي"). */
export function billingCycleAr(cycle: string): string {
  const n = cycle.toLowerCase();
  if (n.startsWith('month')) return 'شهري';
  if (n.startsWith('quarter') || n.startsWith('quater')) return 'ربع سنوي';
  if (n.startsWith('semi')) return 'نصف سنوي';
  if (n.startsWith('year')) return 'سنوي';
  return cycle;
}

/** "/ Month" / "/ Monthly" style suffix for the dark price card. */
export function billingPerLabel(locale: string, per: string): string {
  if (locale === 'ar') return per === 'Month' ? 'شهر' : billingCycleAr(per);
  return per === 'Month' ? 'Month' : per;
}
