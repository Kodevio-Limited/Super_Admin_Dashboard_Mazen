import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';

type Messages = Record<string, unknown>;

function pick(messages: Messages, path: string): string | undefined {
  return path
    .split('.')
    .reduce<unknown>((node, key) => (node && typeof node === 'object' ? (node as Messages)[key] : undefined), messages) as string | undefined;
}

/**
 * Localized title/description from `meta.<namespace>` + hreflang alternates.
 * Pass `canonicalPath` to override the derived canonical (defaults to `/${namespace}`).
 */
export async function routeMetadata(
  locale: string,
  namespace: string,
  canonicalPath?: string,
): Promise<Metadata> {
  const messages = (await getMessages()) as Messages;
  const title = pick(messages, `meta.${namespace}.title`) ?? 'Restaurant Ecosystem';
  const description = pick(messages, `meta.${namespace}.description`) ?? '';

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${canonicalPath ? `/${canonicalPath}` : `/${namespace}`}`,
      languages: {
        en: `/en${canonicalPath ? `/${canonicalPath}` : `/${namespace}`}`,
        ar: `/ar${canonicalPath ? `/${canonicalPath}` : `/${namespace}`}`,
      },
    },
  };
}
