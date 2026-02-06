import type { Rechner } from '../data/rechner';

interface Props {
  rechner: Rechner;
}

export default function RechnerCard({ rechner }: Props) {
  const href = rechner.fertig ? `/${rechner.id}-rechner` : '#';
  const isDisabled = !rechner.fertig;

  return (
    <a
      href={href}
      className={`
        block p-4 rounded-2xl transition-all duration-200
        ${isDisabled 
          ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
          : 'bg-white shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
      onClick={(e) => isDisabled && e.preventDefault()}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">{rechner.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">
            {rechner.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {rechner.beschreibung}
          </p>
        </div>
        {rechner.fertig ? (
          <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full flex-shrink-0">
            Bald
          </span>
        )}
      </div>
    </a>
  );
}
