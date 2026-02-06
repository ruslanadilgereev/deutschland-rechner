import { e as createAstro, c as createComponent, a as renderTemplate, f as renderSlot, g as renderHead, u as unescapeHTML, d as addAttribute } from './astro/server_C8dcKtIt.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                  */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://deutschland-rechner.vercel.app");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title,
    description = "Alle deutschen Rechner auf einen Blick. Kindergeld, B\xFCrgergeld, Brutto-Netto und mehr \u2013 kostenlos und aktuell f\xFCr 2025.",
    keywords = "Rechner, Deutschland, Kindergeld, B\xFCrgergeld, Brutto Netto, Elterngeld, Steuer, 2025",
    canonical,
    ogImage = "/og-default.png"
  } = Astro2.props;
  const siteUrl = "https://deutschland-rechner.vercel.app";
  const fullTitle = title === "Alle Rechner" ? "Deutschlandrechner \u2013 Alle deutschen Rechner 2025" : `${title} | Deutschlandrechner`;
  const canonicalUrl = canonical || Astro2.url.pathname;
  return renderTemplate(_a || (_a = __template(['<html lang="de"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><!-- SEO Meta --><title>', '</title><meta name="description"', '><meta name="keywords"', '><meta name="author" content="Deutschlandrechner"><meta name="robots" content="index, follow"><link rel="canonical"', '><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Deutschlandrechner"><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', '><!-- Theme & PWA --><meta name="theme-color" content="#1a56db"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><!-- Structured Data --><script type="application/ld+json">', "<\/script>", '</head> <body class="safe-area-top safe-area-bottom"> ', " </body></html>"])), fullTitle, addAttribute(description, "content"), addAttribute(keywords, "content"), addAttribute(`${siteUrl}${canonicalUrl}`, "href"), addAttribute(`${siteUrl}${canonicalUrl}`, "content"), addAttribute(fullTitle, "content"), addAttribute(description, "content"), addAttribute(`${siteUrl}${ogImage}`, "content"), addAttribute(fullTitle, "content"), addAttribute(description, "content"), addAttribute(`${siteUrl}${ogImage}`, "content"), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Deutschlandrechner",
    "url": siteUrl,
    "description": "Kostenlose Online-Rechner f\xFCr Deutschland: Kindergeld, B\xFCrgergeld, Brutto-Netto, Elterngeld und mehr.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  })), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/home/ubuntu/clawd/deutschlandrechner/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
