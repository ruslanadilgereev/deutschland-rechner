import { PROVIDERS, VERTICALS, type Provider, type VerticalKey } from '../data/affiliates';

const AWIN_AFFID = (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_AWIN_AFFID) || '<AWIN_AFFID>';

export type SlotName = 'primary' | 'secondary' | 'sidebar' | 'sticky';

// Generiert eine Subid im Format: <pageSlug><Vertical><Slot>
// Alphanumerisch only (Check24-Constraint), max 50 Chars.
export function generateSubid(pagePath: string, vertical: VerticalKey, slot: SlotName): string {
  const pageSlug = pagePath
    .replace(/^\/+/, '')
    .replace(/-rechner$/, '')
    .replace(/[-_/]/g, '');
  const verticalSlug = vertical.replace(/[-_]/g, '');
  const slotSlug = slot.charAt(0).toUpperCase() + slot.slice(1);
  const raw = `${pageSlug}${verticalSlug}${slotSlug}`;
  return raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 50);
}

interface BuildOptions {
  vertical: VerticalKey;
  pagePath: string;
  slot: SlotName;
}

// Baut die Affiliate-URL je nach Provider + Network.
export function buildAffiliateUrl({ vertical, pagePath, slot }: BuildOptions): string {
  const config = VERTICALS[vertical];
  const provider = PROVIDERS[config.provider];
  const subid = generateSubid(pagePath, vertical, slot);

  // ─── AWIN (WISO, smartsteuer, Taxfix) ───
  if (provider.network === 'awin' && config.awinTargetUrl) {
    const url = new URL('https://www.awin1.com/cread.php');
    url.searchParams.set('awinmid', String(provider.awinMid));
    url.searchParams.set('awinaffid', AWIN_AFFID);
    url.searchParams.set('clickref', subid);
    url.searchParams.set('p', config.awinTargetUrl);
    return url.toString();
  }

  // ─── Check24-Inhouse (Direktlink über a.check24.net) ───
  if (provider.network === 'inhouse-check24' && config.check24) {
    const url = new URL('https://a.check24.net/misc/click.php');
    url.searchParams.set('pid', provider.partnerId);
    url.searchParams.set('aid', String(config.check24.aid));
    if (config.check24.cat !== undefined) url.searchParams.set('cat', String(config.check24.cat));
    if (config.check24.deep) url.searchParams.set('deep', config.check24.deep);
    if (config.check24.productId !== undefined) url.searchParams.set('product_id', String(config.check24.productId));
    url.searchParams.set('tid', subid);
    return url.toString();
  }

  // ─── Tarifcheck-Inhouse (verifiziertes Schema via a.partner-versicherung.de) ───
  // partner_id + ad_id + deep + tracking als Subid-Parameter
  if (provider.network === 'inhouse-tarifcheck' && config.tarifcheck) {
    const url = new URL('https://a.partner-versicherung.de/click.php');
    url.searchParams.set('partner_id', provider.partnerId);
    url.searchParams.set('ad_id', String(config.tarifcheck.adId));
    if (config.tarifcheck.deep) url.searchParams.set('deep', config.tarifcheck.deep);
    url.searchParams.set('tracking', subid);
    return url.toString();
  }

  // Fallback: AWIN-Format wenn Tarifcheck noch keine ad_id hat
  if (provider.network === 'inhouse-tarifcheck' && config.tarifcheckTargetUrl) {
    const url = new URL('https://www.awin1.com/cread.php');
    url.searchParams.set('awinmid', String(provider.awinMid));
    url.searchParams.set('awinaffid', AWIN_AFFID);
    url.searchParams.set('clickref', subid);
    url.searchParams.set('p', config.tarifcheckTargetUrl);
    return url.toString();
  }

  // Fallback: ziel-URL direkt (sollte nie passieren bei gepflegter Config)
  return config.awinTargetUrl || config.tarifcheckTargetUrl || 'https://www.deutschland-rechner.de';
}
