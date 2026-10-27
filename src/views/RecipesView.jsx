import React, { useState } from 'react';
import { Plus, Trash2, Clock, Sparkles, RefreshCw, Zap, ChevronDown, ChevronUp, Star, Euro, Edit2 } from 'lucide-react';
import { giorniDaOggi } from '../utils/date.js';

// Schermata Ricettario: elenco delle ricette salvate. Nuova ricetta, importazione, dettaglio,
// modifica ed eliminazione sono gestiti da App (finestre) e arrivano qui come funzioni.
export default function RecipesView({ recipes, onNuova, onImporta, onApriDettaglio, onModifica, onRichiediEliminazione }) {
  const [expandedRecipeTime, setExpandedRecipeTime] = useState({}); // { [recipeId]: true/false }

  const toggleTempoEspanso = (recipeId) => {
    setExpandedRecipeTime((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl font-black">Il tuo Ricettario</h2>
          </div>
          <p className="text-xs text-emerald-100">Clicca sul tempo per vedere preparazione e cottura separate.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{recipes.length} ricette salvate</span>
          </div>
          <button
            onClick={onImporta}
            className="bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition border border-white/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Importa da link</span>
          </button>
          <button
            onClick={onNuova}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Ricetta</span>
          </button>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Nessuna ricetta ancora</h3>
          <p className="text-xs text-slate-400 mt-1">Crea la tua prima ricetta con il bottone "Nuova Ricetta" qui sopra.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const tempoTotale = recipe.tempoPreparazioneMin + recipe.tempoCotturaMin;
          const espanso = !!expandedRecipeTime[recipe.id];
          return (
            <div
              key={recipe.id}
              onClick={() => onApriDettaglio(recipe.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-emerald-200 transition"
            >
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTempoEspanso(recipe.id); }}
                    className="flex items-center gap-1 hover:text-emerald-700 transition"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {tempoTotale} min totali
                    {espanso ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" />{recipe.bonta}/5</span>
                    <span className="flex items-center gap-0.5"><Euro className="w-3 h-3 text-emerald-500" />{recipe.prezzo}/5</span>
                  </div>
                </div>

                {espanso && (
                  <div className="text-[11px] text-slate-500 mb-2 flex gap-3 bg-slate-50 rounded-lg px-2 py-1.5">
                    <span>Preparazione: {recipe.tempoPreparazioneMin} min</span>
                    <span>Cottura: {recipe.tempoCotturaMin} min</span>
                  </div>
                )}

                <h3 className="text-base font-bold text-slate-800 mb-1">{recipe.titolo}</h3>
                <p className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {recipe.ultimaVoltaCucinata
                    ? (() => {
                        const g = giorniDaOggi(recipe.ultimaVoltaCucinata);
                        if (g === 0) return 'Cucinata oggi';
                        if (g === 1) return 'Cucinata ieri';
                        return `Cucinata ${g} giorni fa`;
                      })()
                    : 'Mai cucinata'}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-3">
                  {recipe.preparazione}
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ingredienti (per {recipe.porzioniBase} persone):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.ingredienti.slice(0, 4).map((ing) => (
                      <span key={ing.id} className="bg-emerald-50 text-emerald-800 text-xs px-2 py-1 rounded-lg border border-emerald-200 font-medium">
                        {ing.nome} · {ing.quantita}{ing.unita}
                      </span>
                    ))}
                    {recipe.ingredienti.length > 4 && (
                      <span className="text-xs text-slate-400 px-2 py-1">+{recipe.ingredienti.length - 4} altri</span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-semibold text-emerald-700 mt-3 flex items-center gap-1">
                  Apri ricetta completa <ChevronDown className="w-3 h-3 -rotate-90" />
                </p>
              </div>
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onModifica(recipe)} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-100 active:bg-emerald-100 rounded-xl transition" title="Modifica ricetta" aria-label={`Modifica ${recipe.titolo}`}>
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => onRichiediEliminazione(recipe)} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-100 active:bg-red-100 rounded-xl transition" title="Elimina ricetta" aria-label={`Elimina ${recipe.titolo}`}>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
