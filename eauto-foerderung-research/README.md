# E-Auto-Förderung 2026 — 5-Agent-Team Master-Brief

## Mission

Ruslan will einen **E-Auto-Förderung-2026-Rechner** auf deutschland-rechner.de bauen. Die neue Bundesregierung hat 2026 eine neue E-Auto-Förderung beschlossen — wir brauchen Klarheit darüber UND einen monetarisierbaren Rechner.

## Kontext: Die Website

- **Domain:** https://www.deutschland-rechner.de
- **Tech:** Astro 5 + React Islands + TailwindCSS, deployed auf Vercel
- **Bestehende Affiliate-Setup:** Tarifcheck-Inhouse (`a.partner-versicherung.de`) + Check24-Inhouse (`a.check24.net`) + AWIN
- **Bestehender E-Auto-Rechner:** `/elektroauto-rechner` (eher Kosten-Rechner, nicht Förderung)
- **Schwesterrechner:** `/photovoltaik-rechner` (Solaranlage 1690), `/waermepumpe-rechner`, `/firmenwagen-rechner`, `/kfz-steuer-rechner`

## Verfügbare Affiliate-Banner für Cross-Sell

| Vertical | Banner-ID | Partner |
|---|---|---|
| KFZ-Versicherung | 1634 | Tarifcheck |
| Solaranlage | 1690 | Tarifcheck |
| Baufinanzierung | 633 | Tarifcheck |
| Kredit | 1664 | Tarifcheck |
| Strom Check24 | aid=308 / 317 | Check24 |
| Rentenvers / BU / etc. | div. | Tarifcheck |

## Team-Workflow (5 Agents, parallel)

### `policy-researcher` → `policy.md`
Was ist die neue E-Auto-Förderung 2026? Beschluss-Datum, Förderbeträge, Voraussetzungen (BAFA/KfW?), Wirksamkeit, Übergangsregelungen, Berechtigung (Privat/Gewerbe), Listenpreis-Grenzen, Mindesthaltedauer.

### `competitor-spy` → `competitors.md`
Wer hat schon E-Auto-Förder-Rechner online? ADAC, BAFA selbst, mobile.de, autoscout24, smart-rechner, finanzfluss, e-auto.de. Analyse: Inputs, Outputs, UX, Affiliate-Integrationen.

### `rechner-architect` → `architecture.md`
Welche Inputs braucht der Rechner? Welcher Output? Berechnungs-Formel + Edge-Cases. UX-Flow. Welcher Tech-Stack (React-Island).

### `affiliate-strategist` → `affiliate-plan.md`
Welche Affiliate-Möglichkeiten? Cross-Sell-Strategie: E-Auto-Leasing (gibt's das bei Tarifcheck?), KFZ-Versicherung 1634, Solaranlage 1690 (Strom-für-E-Auto-Pitch), Wallbox-Förderung, Stromtarif Check24, Photovoltaik-Bundle. Pro-Vertical Provision-Schätzung + erwartete Conversion.

### `content-writer` → `content.md`
SEO-Title (mit "2026" prominent), Meta-Description, FAQ-Block, vollständige Erklärtexte mit Quellen-Belegen (Bundesregierung, BAFA-Förderdatenbank, BMWi, ADAC).

## Output-Struktur

```
eauto-foerderung-research/
  README.md                ← dieser File
  policy.md                ← policy-researcher
  competitors.md           ← competitor-spy
  architecture.md          ← rechner-architect
  affiliate-plan.md        ← affiliate-strategist
  content.md               ← content-writer
```

## Kommunikations-Regeln

- Refer to teammates by name
- Bei echtem Bedarf SendMessage — Files sind primary output
- Wenn fertig: TaskUpdate + Notification an team-lead

## Erfolgskriterien

- **policy-researcher** liefert konkrete Beträge + Stichtage mit Quellen-URLs
- **competitor-spy** liefert konkrete Format-Patterns die wir kopieren oder verbessern können
- **rechner-architect** liefert Inputs/Outputs/Formel die so übersetzbar sind in TypeScript
- **affiliate-strategist** liefert eine priorisierte Banner-Liste mit Conversion-Schätzungen
- **content-writer** liefert copy-paste-fertigen Page-Content mit Quellen
