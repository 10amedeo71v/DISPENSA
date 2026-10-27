import React from 'react';
import { TrendingUp } from 'lucide-react';

// Schermata Statistiche: cosa entra ed esce dalla dispensa nel tempo.
// `statistiche` arriva da calcolaStatistiche() (vedi utils/statistiche.js).
export default function StatsView({ statistiche }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-black flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Statistiche
        </h2>
        <p className="text-xs text-slate-300 mt-1">Cosa entra ed esce dalla tua dispensa nel tempo.</p>
      </div>

      {statistiche.totaleMovimenti === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Ancora nessun dato</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Le statistiche si popolano man mano che aggiungi prodotti alla dispensa (a mano o dalla spesa) e li elimini una volta consumati.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <p className="text-2xl font-black text-slate-800">{statistiche.totaleAcquisti}</p>
              <p className="text-xs text-slate-500 mt-0.5">Prodotti acquistati</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <p className="text-2xl font-black text-emerald-600">{statistiche.totaleConsumi}</p>
              <p className="text-xs text-slate-500 mt-0.5">Consumati</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <p className="text-2xl font-black text-red-500">{statistiche.totaleSprechi}</p>
              <p className="text-xs text-slate-500 mt-0.5">Sprecati (scaduti)</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <p className="text-2xl font-black text-amber-600">{statistiche.percentualeSpreco}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Tasso di spreco</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Prodotti più acquistati</h3>
              {statistiche.topAcquistati.length === 0 ? (
                <p className="text-xs text-slate-400">Nessun acquisto registrato ancora.</p>
              ) : (
                <div className="space-y-2">
                  {statistiche.topAcquistati.map((p) => (
                    <div key={p.nome}>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span className="truncate">{p.nome}</span>
                        <span className="font-semibold">{p.count}×</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(p.count / statistiche.topAcquistati[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Prodotti sprecati più spesso</h3>
              {statistiche.topSprecati.length === 0 ? (
                <p className="text-xs text-slate-400">Nessuno spreco registrato — ottimo lavoro!</p>
              ) : (
                <div className="space-y-2">
                  {statistiche.topSprecati.map((p) => (
                    <div key={p.nome}>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span className="truncate">{p.nome}</span>
                        <span className="font-semibold">{p.count}×</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400 rounded-full"
                          style={{ width: `${(p.count / statistiche.topSprecati[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
