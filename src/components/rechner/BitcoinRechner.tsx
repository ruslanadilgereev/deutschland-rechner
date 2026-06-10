import { useState, useEffect, useCallback } from 'react';

// Bitcoin- & Krypto-Rechner – Live-Umrechner Krypto <-> Euro
// Datenquelle: CoinGecko Simple-Price-API (kostenlos, kein API-Key nötig)
// https://api.coingecko.com/api/v3/simple/price?ids=...&vs_currencies=eur
// Kurse sind volatil, dienen nur zur Orientierung – keine Anlageberatung.

interface Coin {
  id: string; // CoinGecko-ID
  symbol: string; // Anzeige-Symbol
  name: string;
  icon: string;
}

// CoinGecko-IDs verifiziert über simple/price (Stand: Juni 2026)
const COINS: Coin[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP (Ripple)', icon: '✕' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '◎' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', icon: '⬡' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: '₳' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
  { id: 'tron', symbol: 'TRX', name: 'TRON', icon: '◈' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', icon: '⬡' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', icon: '▲' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', icon: '●' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', icon: 'Ł' },
];

const COIN_IDS = COINS.map((c) => c.id).join(',');
const API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS}&vs_currencies=eur&include_last_updated_at=true`;

type PriceMap = Record<string, { eur: number; last_updated_at: number }>;

function formatEur(value: number): string {
  if (!isFinite(value)) return '–';
  // Sehr günstige Coins mit mehr Nachkommastellen anzeigen
  const decimals = value < 1 ? 6 : 2;
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

function formatCrypto(value: number): string {
  if (!isFinite(value)) return '–';
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

export default function BitcoinRechner() {
  const [prices, setPrices] = useState<PriceMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const [coinId, setCoinId] = useState('bitcoin');
  // lastEdited steuert die Umrechnungsrichtung: Krypto-Menge -> EUR oder EUR -> Menge
  const [cryptoAmount, setCryptoAmount] = useState('1');
  const [eurAmount, setEurAmount] = useState('');
  const [lastEdited, setLastEdited] = useState<'crypto' | 'eur'>('crypto');

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(API_URL, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data: PriceMap = await res.json();
      if (!data || !data.bitcoin) throw new Error('Ungültige Antwort');
      setPrices(data);
      // jüngsten Zeitstempel ermitteln
      const ts = Math.max(
        ...Object.values(data).map((v) => v.last_updated_at || 0)
      );
      setUpdatedAt(ts || Math.floor(Date.now() / 1000));
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const selectedCoin = COINS.find((c) => c.id === coinId) || COINS[0];
  const rate = prices?.[coinId]?.eur ?? null;

  // Werte synchron halten je nach zuletzt bearbeitetem Feld
  useEffect(() => {
    if (rate == null) return;
    if (lastEdited === 'crypto') {
      const amt = parseFloat(cryptoAmount.replace(',', '.'));
      if (isFinite(amt)) {
        setEurAmount((amt * rate).toFixed(2));
      } else {
        setEurAmount('');
      }
    } else {
      const eur = parseFloat(eurAmount.replace(',', '.'));
      if (isFinite(eur) && rate > 0) {
        setCryptoAmount((eur / rate).toFixed(8));
      } else {
        setCryptoAmount('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate, coinId]);

  const handleCryptoChange = (val: string) => {
    setLastEdited('crypto');
    setCryptoAmount(val);
    const amt = parseFloat(val.replace(',', '.'));
    if (rate != null && isFinite(amt)) {
      setEurAmount((amt * rate).toFixed(2));
    } else if (val === '') {
      setEurAmount('');
    }
  };

  const handleEurChange = (val: string) => {
    setLastEdited('eur');
    setEurAmount(val);
    const eur = parseFloat(val.replace(',', '.'));
    if (rate != null && rate > 0 && isFinite(eur)) {
      setCryptoAmount((eur / rate).toFixed(8));
    } else if (val === '') {
      setCryptoAmount('');
    }
  };

  const updatedLabel = updatedAt
    ? new Date(updatedAt * 1000).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Coin-Auswahl */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Kryptowährung</span>
          <select
            value={coinId}
            onChange={(e) => {
              setCoinId(e.target.value);
            }}
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
          >
            {COINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </label>

        {/* Menge Krypto */}
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Menge {selectedCoin.symbol}</span>
          <div className="mt-2 flex items-center rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
            <span className="text-orange-500 font-bold mr-2 w-6 text-center">{selectedCoin.icon}</span>
            <input
              type="text"
              inputMode="decimal"
              value={cryptoAmount}
              onChange={(e) => handleCryptoChange(e.target.value)}
              placeholder="0,00"
              className="w-full bg-transparent text-lg text-gray-800 focus:outline-none"
            />
          </div>
        </label>

        <div className="flex justify-center my-3">
          <span className="text-2xl text-gray-400" aria-hidden="true">⇅</span>
        </div>

        {/* Betrag EUR */}
        <label className="block">
          <span className="text-gray-700 font-medium">Betrag in Euro</span>
          <div className="mt-2 flex items-center rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
            <span className="text-gray-500 font-bold mr-2 w-6 text-center">€</span>
            <input
              type="text"
              inputMode="decimal"
              value={eurAmount}
              onChange={(e) => handleEurChange(e.target.value)}
              placeholder="0,00"
              className="w-full bg-transparent text-lg text-gray-800 focus:outline-none"
            />
          </div>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-orange-100 mb-1">
          Aktueller Gegenwert
        </h3>

        {loading && (
          <p className="text-orange-100 py-4">Kurse werden geladen …</p>
        )}

        {error && !loading && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="font-medium mb-2">⚠️ Kurse konnten nicht geladen werden.</p>
            <p className="text-sm text-orange-100 mb-3">
              Die Kursdaten von CoinGecko sind aktuell nicht erreichbar. Bitte versuchen Sie es erneut.
            </p>
            <button
              onClick={fetchPrices}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {!loading && !error && rate != null && (
          <>
            <div className="mb-5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-bold">
                  {formatEur(parseFloat(eurAmount.replace(',', '.')) || 0)}
                </span>
                <span className="text-xl text-orange-200">€</span>
              </div>
              <p className="text-orange-100 text-sm mt-1">
                {formatCrypto(parseFloat(cryptoAmount.replace(',', '.')) || 0)} {selectedCoin.symbol}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-orange-100 text-sm">1 {selectedCoin.symbol} =</span>
                <span className="font-bold">{formatEur(rate)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-100 text-sm">1 € =</span>
                <span className="font-bold">{formatCrypto(1 / rate)} {selectedCoin.symbol}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Kurs-Quelle & Zeitstempel */}
      {!loading && !error && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500 px-1">
          <span>
            Kurs: CoinGecko {updatedLabel ? `· Stand ${updatedLabel} Uhr` : ''}
          </span>
          <button
            onClick={fetchPrices}
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
          >
            <span aria-hidden="true">↻</span> Aktualisieren
          </button>
        </div>
      )}

      {/* Volatilitäts-Hinweis */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Kurse sind hoch volatil</p>
            <p>
              Krypto-Kurse schwanken stark und können sich innerhalb von Minuten ändern. Die hier
              angezeigten Werte dienen nur zur Orientierung und stellen <strong>keine
              Anlageberatung</strong> dar. Maßgeblich ist immer der tatsächliche Kurs Ihrer Börse zum
              Zeitpunkt des Handels.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Kryptowährung auswählen – <strong>12 große Coins</strong> (BTC, ETH, XRP, SOL u. a.)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Menge oder Euro-Betrag eingeben – <strong>beide Richtungen</strong> funktionieren</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Live-Kurse direkt von <strong>CoinGecko</strong>, kostenlos abgerufen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Über „Aktualisieren" jederzeit den <strong>aktuellen Kurs</strong> nachladen</span>
          </li>
        </ul>
      </div>

      {/* Steuer-Hinweis */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">💸 Krypto und Steuer</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-blue-800">Haltefrist 1 Jahr</p>
              <p className="text-blue-700">
                Nach mehr als einem Jahr Haltedauer sind Gewinne aus privaten Krypto-Verkäufen
                in Deutschland steuerfrei (§ 23 EStG).
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🪙</span>
            <div>
              <p className="font-medium text-green-800">Freigrenze 1.000 €</p>
              <p className="text-green-700">
                Innerhalb der Haltefrist bleiben Gewinne bis 1.000 € pro Jahr steuerfrei.
                Achtung: Bei Überschreitung ist der <strong>gesamte</strong> Gewinn steuerpflichtig
                (Freigrenze, kein Freibetrag).
              </p>
            </div>
          </div>
          <a
            href="/krypto-steuer-rechner"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            → Steuer auf Krypto-Gewinne berechnen (Krypto-Steuer-Rechner)
          </a>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.coingecko.com/de/api"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            CoinGecko – Krypto-Kursdaten-API (Datenquelle)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__23.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 23 EStG – Private Veräußerungsgeschäfte
          </a>
        </div>
      </div>
    </div>
  );
}
