# Beitragen zu Deutschlandrechner

Danke, dass du mithelfen willst! Hier erfährst du, wie du zum Projekt beitragen kannst.

## Fehler in einem Rechner gefunden?

Erstelle ein [Issue mit der Vorlage "Rechner-Fehler"](https://github.com/ruslanadilgereev/deutschland-rechner/issues/new?template=rechner-fehler.yml). Je genauer du beschreibst was falsch ist und was das korrekte Ergebnis sein sollte, desto schneller können wir es fixen.

## Neuen Rechner vorschlagen?

Erstelle ein [Issue mit der Vorlage "Neuer Rechner"](https://github.com/ruslanadilgereev/deutschland-rechner/issues/new?template=neuer-rechner.yml). Beschreibe kurz was der Rechner berechnen soll und nenne mögliche Quellen.

## Code beitragen

### Setup

```bash
git clone https://github.com/ruslanadilgereev/deutschland-rechner.git
cd deutschland-rechner
npm install
npm run dev
```

### Einen neuen Rechner hinzufügen

Jeder Rechner besteht aus drei Teilen:

#### 1. Eintrag in `src/data/rechner.ts`

Füge einen neuen Eintrag zur `rechnerListe` hinzu:

```typescript
{
  id: 'mein-rechner',           // Kebab-Case, wird zur URL
  name: 'Mein Rechner',         // Anzeigename
  beschreibung: 'Kurze Beschreibung',
  icon: '🧮',                   // Emoji
  kategorie: 'alltag',          // Eine der 9 Kategorien (siehe Interface)
  fertig: true,                 // true = wird angezeigt
  quellen: ['https://...'],     // Offizielle Quellen
}
```

Verfügbare Kategorien: `familie`, `arbeit`, `steuern`, `soziales`, `wohnen`, `gesundheit`, `auto`, `finanzen`, `alltag`

#### 2. React-Komponente in `src/components/rechner/MeinRechner.tsx`

Die Rechner-Logik als React-Komponente mit `useState` und `useMemo`. Schau dir einen bestehenden Rechner als Vorlage an, z.B.:

- Einfach: `src/components/rechner/BMIRechner.tsx`
- Komplex: `src/components/rechner/BruttoNettoRechner.tsx`

#### 3. Astro-Seite in `src/pages/mein-rechner.astro`

Die Seite bindet den Rechner ein und enthält SEO-Content. Vorlage:

- `src/pages/bmi-rechner.astro`

Wichtig:
- Die Datei muss `mein-rechner.astro` heißen (gleiche ID wie in `rechner.ts`)
- React-Komponente mit `client:load` einbinden
- SEO-Bereich mit Erklärung, Beispielen und FAQ

### Bestehenden Rechner verbessern

1. Finde die Komponente in `src/components/rechner/`
2. Finde die Seite in `src/pages/`
3. Änderung machen, testen, PR erstellen

### Pull Request

1. Forke das Repo
2. Erstelle einen Branch (`git checkout -b mein-feature`)
3. Committe deine Änderungen
4. Push und erstelle einen Pull Request

## Code-Style

- TypeScript für alle Komponenten
- React mit `useState`/`useMemo` (keine externen State-Libraries)
- Tailwind CSS für Styling
- Deutsche Texte auf der Seite, englische Variablennamen im Code
- Jede Rechner-Seite braucht einen SEO-Abschnitt
