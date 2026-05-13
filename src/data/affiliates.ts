// Affiliate-Config — Single Source of Truth für alle Welle-1-Pages.
// Generiert URLs + Subids für Check24/Tarifcheck (Inhouse) und WISO/smartsteuer/Taxfix (AWIN).
//
// Konvention: Subids sind alphanumerisch (Check24-Constraint, max 50 Chars, CamelCase).

export type Provider = 'check24' | 'tarifcheck' | 'wiso' | 'smartsteuer' | 'taxfix';
export type Network = 'inhouse-check24' | 'inhouse-tarifcheck' | 'awin';

export interface ProviderConfig {
  key: Provider;
  name: string;
  network: Network;
  awinMid?: number;
  partnerId: string;
  cookieDays: number;
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  check24: {
    key: 'check24',
    name: 'CHECK24',
    network: 'inhouse-check24',
    awinMid: 9364,
    partnerId: '1171454',
    cookieDays: 60,
  },
  tarifcheck: {
    key: 'tarifcheck',
    name: 'Tarifcheck',
    network: 'inhouse-tarifcheck',
    awinMid: 11202,
    partnerId: '201880',
    cookieDays: 30,
  },
  wiso: {
    key: 'wiso',
    name: 'WISO Steuer',
    network: 'awin',
    awinMid: 17387,
    partnerId: '',
    cookieDays: 30,
  },
  smartsteuer: {
    key: 'smartsteuer',
    name: 'smartsteuer',
    network: 'awin',
    awinMid: 15043,
    partnerId: '',
    cookieDays: 30,
  },
  taxfix: {
    key: 'taxfix',
    name: 'Taxfix',
    network: 'awin',
    awinMid: 0, // TBD — Ruslan muss MID aus AWIN-Dashboard nachtragen
    partnerId: '',
    cookieDays: 30,
  },
};

export type VerticalKey =
  // AWIN-Steuersoftware
  | 'wiso-steuer'
  | 'smartsteuer-tool'
  | 'taxfix-app'
  // Tarifcheck-Vorsorge (Welle 1: nur Links, keine iframes)
  | 'rentenvers'
  | 'ruerup'
  | 'riester'
  | 'bu'
  | 'lebensvers'
  | 'risikoleben'
  // Tarifcheck-Sach (Welle 1: nur Links)
  | 'wohngebaeude'
  | 'hausrat'
  | 'haftpflicht'
  | 'rechtsschutz'
  | 'kfz'
  // Tarifcheck-Finanz
  | 'baufi'
  // Check24-Direkt (Welle 1: nur Links)
  | 'strom'
  | 'gas'
  | 'dsl'
  | 'mobilfunk'
  | 'c24bank';

export interface VerticalConfig {
  key: VerticalKey;
  label: string;
  shortLabel: string;
  provider: Provider;
  // AWIN: targetUrl bei Steuer-Software
  awinTargetUrl?: string;
  // Check24-Inhouse: aid/cat/deep
  check24?: { aid: number; cat?: number; deep?: string; productId?: number };
  // Tarifcheck-Inhouse: ad_id + deep (echtes Schema via a.partner-versicherung.de/click.php)
  tarifcheck?: { adId: number; deep: string };
  // Tarifcheck-Fallback (AWIN) wenn ad_id noch nicht im Backend geholt
  tarifcheckTargetUrl?: string;
  // Display-Daten
  provision: { model: 'CPL' | 'CPO' | 'CPO-percent'; amount: number; stornofrei?: boolean };
}

export const VERTICALS: Record<VerticalKey, VerticalConfig> = {
  // ─── AWIN Steuer-Software ───
  'wiso-steuer': {
    key: 'wiso-steuer',
    label: 'WISO Steuer',
    shortLabel: 'WISO',
    provider: 'wiso',
    awinTargetUrl: 'https://www.buhl.de/steuer/',
    provision: { model: 'CPO', amount: 15 },
  },
  'smartsteuer-tool': {
    key: 'smartsteuer-tool',
    label: 'smartsteuer',
    shortLabel: 'smartsteuer',
    provider: 'smartsteuer',
    awinTargetUrl: 'https://www.smartsteuer.de/',
    provision: { model: 'CPO', amount: 20 },
  },
  'taxfix-app': {
    key: 'taxfix-app',
    label: 'Taxfix',
    shortLabel: 'Taxfix',
    provider: 'taxfix',
    awinTargetUrl: 'https://taxfix.de/',
    provision: { model: 'CPL', amount: 15 },
  },

  // ─── Tarifcheck Vorsorge (Inhouse) ───
  rentenvers: {
    key: 'rentenvers',
    label: 'Private Rentenversicherung',
    shortLabel: 'Rente',
    provider: 'tarifcheck',
    tarifcheck: { adId: 857, deep: 'rentenversicherung' },
    provision: { model: 'CPL', amount: 25, stornofrei: true },
  },
  ruerup: {
    key: 'ruerup',
    label: 'Rürup-Rente',
    shortLabel: 'Rürup',
    provider: 'tarifcheck',
    tarifcheck: { adId: 15, deep: 'ruerup-rente' },
    provision: { model: 'CPL', amount: 25, stornofrei: true },
  },
  riester: {
    key: 'riester',
    label: 'Riester-Rente',
    shortLabel: 'Riester',
    provider: 'tarifcheck',
    tarifcheck: { adId: 15, deep: 'riester-rente' },
    provision: { model: 'CPL', amount: 25, stornofrei: true },
  },
  bu: {
    key: 'bu',
    label: 'Berufsunfähigkeits-Versicherung',
    shortLabel: 'BU',
    provider: 'tarifcheck',
    tarifcheck: { adId: 15, deep: 'berufsunfaehigkeitsversicherung' },
    provision: { model: 'CPL', amount: 25, stornofrei: true },
  },
  lebensvers: {
    key: 'lebensvers',
    label: 'Lebensversicherung',
    shortLabel: 'Leben',
    provider: 'tarifcheck',
    tarifcheck: { adId: 15, deep: 'lebensversicherung' },
    provision: { model: 'CPL', amount: 25, stornofrei: true },
  },
  risikoleben: {
    key: 'risikoleben',
    label: 'Risikolebensversicherung',
    shortLabel: 'Risikoleben',
    provider: 'tarifcheck',
    tarifcheck: { adId: 15, deep: 'risikolebensversicherung' },
    provision: { model: 'CPL', amount: 25, stornofrei: true },
  },

  // ─── Tarifcheck Sach (Inhouse) ───
  wohngebaeude: {
    key: 'wohngebaeude',
    label: 'Wohngebäudeversicherung',
    shortLabel: 'Wohngebäude',
    provider: 'tarifcheck',
    tarifcheckTargetUrl: 'https://www.tarifcheck.de/wohngebaeudeversicherung/',
    provision: { model: 'CPO', amount: 75 },
  },
  hausrat: {
    key: 'hausrat',
    label: 'Hausratversicherung',
    shortLabel: 'Hausrat',
    provider: 'tarifcheck',
    tarifcheckTargetUrl: 'https://www.tarifcheck.de/hausratversicherung/',
    provision: { model: 'CPO', amount: 30 },
  },
  haftpflicht: {
    key: 'haftpflicht',
    label: 'Privathaftpflicht',
    shortLabel: 'Haftpflicht',
    provider: 'tarifcheck',
    tarifcheckTargetUrl: 'https://www.tarifcheck.de/haftpflichtversicherung/',
    provision: { model: 'CPO', amount: 16.5 },
  },
  rechtsschutz: {
    key: 'rechtsschutz',
    label: 'Rechtsschutzversicherung',
    shortLabel: 'Rechtsschutz',
    provider: 'tarifcheck',
    tarifcheckTargetUrl: 'https://www.tarifcheck.de/rechtsschutzversicherung/',
    provision: { model: 'CPO', amount: 50 },
  },
  kfz: {
    key: 'kfz',
    label: 'KFZ-Versicherung',
    shortLabel: 'KFZ',
    provider: 'tarifcheck',
    tarifcheckTargetUrl: 'https://www.tarifcheck.de/kfz-versicherung/',
    provision: { model: 'CPO', amount: 70 },
  },
  baufi: {
    key: 'baufi',
    label: 'Baufinanzierung',
    shortLabel: 'Baufi',
    provider: 'tarifcheck',
    tarifcheckTargetUrl: 'https://www.tarifcheck.de/baufinanzierung/',
    provision: { model: 'CPL', amount: 7.5 },
  },

  // ─── Check24 Direkt (Inhouse) ───
  strom: {
    key: 'strom',
    label: 'Strom-Vergleich',
    shortLabel: 'Strom',
    provider: 'check24',
    check24: { aid: 18, cat: 1, productId: 1, deep: 'stromanbieter-wechseln' },
    provision: { model: 'CPL', amount: 20, stornofrei: true },
  },
  gas: {
    key: 'gas',
    label: 'Gas-Vergleich',
    shortLabel: 'Gas',
    provider: 'check24',
    check24: { aid: 18, cat: 3, productId: 2, deep: 'gasanbieter-wechseln' },
    provision: { model: 'CPL', amount: 20, stornofrei: true },
  },
  dsl: {
    key: 'dsl',
    label: 'DSL-Vergleich',
    shortLabel: 'DSL',
    provider: 'check24',
    check24: { aid: 18, cat: 4, deep: 'dsl-vergleich' },
    provision: { model: 'CPO', amount: 60 },
  },
  mobilfunk: {
    key: 'mobilfunk',
    label: 'Mobilfunk-Vergleich',
    shortLabel: 'Mobilfunk',
    provider: 'check24',
    check24: { aid: 18, cat: 7, deep: 'handytarife' },
    provision: { model: 'CPO', amount: 30 },
  },
  c24bank: {
    key: 'c24bank',
    label: 'C24 Smart-Konto',
    shortLabel: 'C24 Bank',
    provider: 'check24',
    check24: { aid: 18, cat: 14, deep: 'c24bank' },
    provision: { model: 'CPO', amount: 50 },
  },
};

// Page → Welche Verticals primary/secondary anzeigen
// Konvention: max 2 Cards pro Page (primary + secondary) im Welle-1-Launch
export interface PageAffiliateConfig {
  primary?: VerticalKey;
  secondary?: VerticalKey;
}

export const PAGE_AFFILIATES: Record<string, PageAffiliateConfig> = {
  // ─── Renten-/Vorsorge-Cluster (Tarifcheck Inhouse 25€ CPL stornofrei) ───
  '/rentensteuer-rechner': { primary: 'rentenvers', secondary: 'ruerup' },
  '/renten-rechner': { primary: 'ruerup', secondary: 'rentenvers' },
  '/rentenluecke-rechner': { primary: 'ruerup', secondary: 'riester' },
  '/altersteilzeit-rechner': { primary: 'rentenvers', secondary: 'lebensvers' },
  '/witwenrente-rechner': { primary: 'risikoleben' },
  '/fruehrente-rechner': { primary: 'bu' },
  '/erwerbsminderungsrente-rechner': { primary: 'bu' },
  '/riester-rechner': { primary: 'riester' },

  // ─── Steuer-Pages mit Vorsorge-Cross-Sell (Steuersoftware via AWIN später) ───
  '/lohnsteuer-rechner': { primary: 'bu', secondary: 'lebensvers' },
  '/einkommensteuer-rechner': { primary: 'ruerup' },
  '/brutto-netto-rechner': { primary: 'bu' },

  // ─── Top-3 Money-Maker (Tarifcheck Sach + Vorsorge) ───
  '/grundsteuer-rechner': { primary: 'wohngebaeude', secondary: 'hausrat' },

  // ─── KFZ-Cluster (Tarifcheck KFZ 70€ CPO) ───
  '/firmenwagen-rechner': { primary: 'kfz' },
  '/versicherung-auto-rechner': { primary: 'kfz' },
  '/kfz-steuer-rechner': { primary: 'kfz' },

  // ─── Wohnen-Cluster (Tarifcheck Sach + Check24 Energie) ───
  '/baufinanzierung-rechner': { primary: 'baufi', secondary: 'wohngebaeude' },
  '/nebenkosten-rechner': { primary: 'strom', secondary: 'gas' },
  '/heizkosten-rechner': { primary: 'gas' },
  '/gaskosten-rechner': { primary: 'gas' },
  '/stromkosten-rechner': { primary: 'strom' },
  '/mietkaution-rechner': { primary: 'hausrat' },

  // ─── Pages OHNE guten Affiliate-Match (vorerst keine Cards) ───
  // /steuererstattung-rechner — bräuchte WISO/smartsteuer (AWIN)
  // /aktien-steuer-rechner — bräuchte Broker/Depot
  // /kapitalertragsteuer-rechner — bräuchte Broker/Depot
  // /krypto-steuer-rechner — bräuchte Bitpanda/Trade Republic

  // ─── Sensitive Pages: KEINE Affiliate (UWG §3a-Risiko) ───
  // /privatinsolvenz-rechner, /buergergeld-rechner — KEIN Kredit/Affiliate
};

export function getPageAffiliates(pathname: string): PageAffiliateConfig {
  // Strip trailing slash, query, hash
  const normalized = pathname.replace(/\/$/, '').split('?')[0].split('#')[0];
  return PAGE_AFFILIATES[normalized] || {};
}
