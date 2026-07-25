import { useMemo, useState } from 'react';
import goae from '../../data/goae.json';

// GOÄ-Gebühr = Punktzahl × Punktwert (5,82873 Cent, § 5 Abs. 1 GOÄ) × Steigerungsfaktor,
// kaufmännisch auf den Cent gerundet. Regelspanne bis 2,3 (persönliche Leistungen);
// darüber schriftliche Begründung (§ 12 Abs. 3), über dem Höchstsatz nur mit
// abweichender Vereinbarung nach § 2 GOÄ.
const PUNKTWERT = goae.punktwertCent;
const ZIFFERN = goae.ziffern;
const KATEGORIEN = goae.kategorien;

type KatKey = keyof typeof KATEGORIEN;

function gebuehr(punkte: number, faktor: number): number {
  return Math.round(punkte * PUNKTWERT * faktor) / 100;
}

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function GoaeRechner() {
  const [zifferIdx, setZifferIdx] = useState(0); // Nr. 1 Beratung
  const [eigenePunkte, setEigenePunkte] = useState('');
  const [kategorie, setKategorie] = useState<KatKey>('persoenlich');
  const [faktor, setFaktor] = useState(2.3);

  const kat = KATEGORIEN[kategorie];
  const punkte = eigenePunkte !== '' ? Math.max(0, Number(eigenePunkte) || 0) : ZIFFERN[zifferIdx].punkte;

  const ergebnis = useMemo(() => {
    const einfach = gebuehr(punkte, 1);
    const betrag = gebuehr(punkte, faktor);
    return {
      einfach,
      betrag,
      ueberSchwelle: faktor > kat.schwelle + 1e-9,
      ueberHoechst: faktor > kat.hoechstsatz + 1e-9,
    };
  }, [punkte, faktor, kat]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GOÄ-Ziffer (Auswahl gängiger Leistungen)</label>
          <select
            value={zifferIdx}
            onChange={(e) => { setZifferIdx(Number(e.target.value)); setEigenePunkte(''); }}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 outline-none text-sm"
          >
            {ZIFFERN.map((z, i) => (
              <option key={z.nr} value={i}>Nr. {z.nr}: {z.label} ({z.punkte} Punkte)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Oder eigene Punktzahl (laut Rechnung)</label>
          <input
            type="number"
            min={0}
            placeholder="z.B. 200"
            value={eigenePunkte}
            onChange={(e) => setEigenePunkte(e.target.value)}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leistungsart</label>
          <select
            value={kategorie}
            onChange={(e) => {
              const k = e.target.value as KatKey;
              setKategorie(k);
              setFaktor(KATEGORIEN[k].schwelle);
            }}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 outline-none text-sm"
          >
            {(Object.keys(KATEGORIEN) as KatKey[]).map((k) => (
              <option key={k} value={k}>{KATEGORIEN[k].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Steigerungsfaktor</label>
          <div className="flex gap-2">
            {[1.0, kat.schwelle, kat.hoechstsatz].map((f) => (
              <button
                key={f}
                onClick={() => setFaktor(f)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  Math.abs(faktor - f) < 1e-9 ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-sky-100'
                }`}
              >
                {f.toLocaleString('de-DE')}
              </button>
            ))}
            <input
              type="number"
              step={0.1}
              min={1}
              value={faktor}
              onChange={(e) => setFaktor(Number(e.target.value) || 1)}
              className="w-20 py-2 px-2 border-2 border-gray-200 rounded-xl focus:border-sky-500 outline-none text-sm text-center"
            />
          </div>
        </div>
      </div>

      <div className="bg-sky-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Punktzahl × Punktwert ({PUNKTWERT.toLocaleString('de-DE')} Cent)</span>
          <span className="font-medium">{formatEuro(ergebnis.einfach)} (einfacher Satz)</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-sky-100 pb-2">
          <span>× Faktor {faktor.toLocaleString('de-DE')}</span>
          <span className="font-medium">{punkte.toLocaleString('de-DE')} Punkte</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">GOÄ-Gebühr</span>
          <span className="text-2xl font-bold text-sky-700">{formatEuro(ergebnis.betrag)}</span>
        </div>
      </div>

      {ergebnis.ueberHoechst ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 mt-4">
          <strong>Über dem Höchstsatz ({kat.hoechstsatz.toLocaleString('de-DE')}):</strong> Ein höherer Faktor ist
          nur mit einer vor der Behandlung geschlossenen abweichenden Vereinbarung nach § 2 GOÄ zulässig.
        </div>
      ) : ergebnis.ueberSchwelle ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mt-4">
          <strong>Über dem Schwellenwert ({kat.schwelle.toLocaleString('de-DE')}):</strong> Die Rechnung muss die
          Überschreitung für diese Leistung schriftlich und nachvollziehbar begründen (§ 12 Abs. 3 GOÄ).
        </div>
      ) : null}

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 px-3 rounded-tl-lg">Ziffer</th>
              <th className="py-2 px-3 text-right">1,0-fach</th>
              <th className="py-2 px-3 text-right">2,3-fach</th>
              <th className="py-2 px-3 text-right rounded-tr-lg">3,5-fach</th>
            </tr>
          </thead>
          <tbody>
            {ZIFFERN.slice(0, 8).map((z) => (
              <tr key={z.nr} className="border-b border-gray-100">
                <td className="py-2 px-3">Nr. {z.nr} ({z.punkte} P.)</td>
                <td className="py-2 px-3 text-right font-mono">{formatEuro(gebuehr(z.punkte, 1))}</td>
                <td className="py-2 px-3 text-right font-mono font-bold">{formatEuro(gebuehr(z.punkte, 2.3))}</td>
                <td className="py-2 px-3 text-right font-mono">{formatEuro(gebuehr(z.punkte, 3.5))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
