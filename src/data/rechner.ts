export interface Rechner {
  id: string;
  name: string;
  beschreibung: string;
  icon: string;
  kategorie: 'familie' | 'arbeit' | 'steuern' | 'soziales' | 'wohnen' | 'gesundheit';
  fertig: boolean;
  quellen?: string[];
}

export const kategorien = {
  familie: { name: 'Familie & Kinder', icon: '👨‍👩‍👧‍👦', color: 'bg-pink-500' },
  arbeit: { name: 'Arbeit & Gehalt', icon: '💼', color: 'bg-blue-500' },
  steuern: { name: 'Steuern & Abgaben', icon: '🏛️', color: 'bg-yellow-500' },
  soziales: { name: 'Sozialleistungen', icon: '🤝', color: 'bg-green-500' },
  wohnen: { name: 'Wohnen & Immobilien', icon: '🏠', color: 'bg-purple-500' },
  gesundheit: { name: 'Gesundheit', icon: '❤️', color: 'bg-red-500' },
};

export const rechnerListe: Rechner[] = [
  // Familie & Kinder
  {
    id: 'kindergeld',
    name: 'Kindergeld-Rechner',
    beschreibung: 'Berechne deinen Kindergeld-Anspruch 2025',
    icon: '👶',
    kategorie: 'familie',
    fertig: true,
    quellen: ['https://www.arbeitsagentur.de/familie-und-kinder/kindergeld-anspruch-hoehe-dauer'],
  },
  {
    id: 'elterngeld',
    name: 'Elterngeld-Rechner',
    beschreibung: 'Basis-Elterngeld & ElterngeldPlus berechnen',
    icon: '🍼',
    kategorie: 'familie',
    fertig: true,
    quellen: ['https://familienportal.de/familienportal/familienleistungen/elterngeld'],
  },
  {
    id: 'unterhalt',
    name: 'Unterhalts-Rechner',
    beschreibung: 'Kindesunterhalt nach Düsseldorfer Tabelle',
    icon: '💰',
    kategorie: 'familie',
    fertig: false,
  },
  
  // Arbeit & Gehalt
  {
    id: 'brutto-netto',
    name: 'Brutto-Netto-Rechner',
    beschreibung: 'Was bleibt vom Gehalt übrig?',
    icon: '💵',
    kategorie: 'arbeit',
    fertig: true,
    quellen: ['https://www.bmf-steuerrechner.de', 'https://www.deutsche-rentenversicherung.de'],
  },
  {
    id: 'minijob',
    name: 'Minijob-Rechner',
    beschreibung: '520€-Grenze und Abgaben berechnen',
    icon: '⏰',
    kategorie: 'arbeit',
    fertig: false,
  },
  {
    id: 'kurzarbeitergeld',
    name: 'Kurzarbeitergeld-Rechner',
    beschreibung: 'KuG-Anspruch berechnen',
    icon: '📉',
    kategorie: 'arbeit',
    fertig: false,
  },
  {
    id: 'pendlerpauschale',
    name: 'Pendlerpauschale-Rechner',
    beschreibung: 'Fahrtkosten steuerlich absetzen',
    icon: '🚗',
    kategorie: 'arbeit',
    fertig: false,
  },
  
  // Steuern & Abgaben
  {
    id: 'einkommensteuer',
    name: 'Einkommensteuer-Rechner',
    beschreibung: 'Steuerlast berechnen',
    icon: '📊',
    kategorie: 'steuern',
    fertig: false,
  },
  {
    id: 'erbschaftsteuer',
    name: 'Erbschaftsteuer-Rechner',
    beschreibung: 'Steuer auf Erbschaft berechnen',
    icon: '📜',
    kategorie: 'steuern',
    fertig: false,
  },
  {
    id: 'grunderwerbsteuer',
    name: 'Grunderwerbsteuer-Rechner',
    beschreibung: 'Steuer beim Immobilienkauf (nach Bundesland)',
    icon: '🏗️',
    kategorie: 'steuern',
    fertig: true,
    quellen: ['https://www.bundesfinanzministerium.de'],
  },
  
  // Sozialleistungen
  {
    id: 'buergergeld',
    name: 'Bürgergeld-Rechner',
    beschreibung: 'Anspruch auf Bürgergeld prüfen',
    icon: '🏦',
    kategorie: 'soziales',
    fertig: false,
  },
  {
    id: 'arbeitslosengeld',
    name: 'Arbeitslosengeld-Rechner',
    beschreibung: 'ALG I Anspruch berechnen',
    icon: '📋',
    kategorie: 'soziales',
    fertig: false,
  },
  {
    id: 'wohngeld',
    name: 'Wohngeld-Rechner',
    beschreibung: 'Wohngeld-Anspruch prüfen',
    icon: '🏘️',
    kategorie: 'soziales',
    fertig: false,
  },
  {
    id: 'bafoeg',
    name: 'BAföG-Rechner',
    beschreibung: 'Ausbildungsförderung berechnen',
    icon: '🎓',
    kategorie: 'soziales',
    fertig: false,
  },
  {
    id: 'rente',
    name: 'Renten-Rechner',
    beschreibung: 'Gesetzliche Rente berechnen',
    icon: '👴',
    kategorie: 'soziales',
    fertig: false,
  },
  
  // Wohnen & Immobilien
  {
    id: 'mieterhoehung',
    name: 'Mieterhöhungs-Rechner',
    beschreibung: 'Zulässige Mieterhöhung prüfen',
    icon: '📈',
    kategorie: 'wohnen',
    fertig: false,
  },
  {
    id: 'nebenkosten',
    name: 'Nebenkosten-Rechner',
    beschreibung: 'Betriebskosten prüfen',
    icon: '💡',
    kategorie: 'wohnen',
    fertig: false,
  },
  {
    id: 'stromkosten',
    name: 'Stromkosten-Rechner',
    beschreibung: 'Stromverbrauch und Kosten berechnen',
    icon: '⚡',
    kategorie: 'wohnen',
    fertig: false,
  },
  
  // Gesundheit
  {
    id: 'krankengeld',
    name: 'Krankengeld-Rechner',
    beschreibung: 'Krankengeld-Anspruch berechnen',
    icon: '🏥',
    kategorie: 'gesundheit',
    fertig: false,
  },
  {
    id: 'pflegegeld',
    name: 'Pflegegeld-Rechner',
    beschreibung: 'Pflegegeld nach Pflegegrad',
    icon: '🩺',
    kategorie: 'gesundheit',
    fertig: false,
  },
];

export const getRechnerByKategorie = (kategorie: string) => 
  rechnerListe.filter(r => r.kategorie === kategorie);

export const getFertigeRechner = () => 
  rechnerListe.filter(r => r.fertig);
