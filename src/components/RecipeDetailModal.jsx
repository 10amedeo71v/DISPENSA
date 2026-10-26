import React, { useState } from 'react';
import { Clock, Users, Star, Euro, Edit2, Trash2, Minus, Plus } from 'lucide-react';
import ModalBackdrop from './ModalBackdrop.jsx';
import { giorniDaOggi } from '../utils/date.js';
import { scalaIngredienti } from '../utils/spesa.js';

const PORZIONI_MIN = 1;
const PORZIONI_MAX = 99;

// Dettaglio completo di una ricetta. Le porzioni si possono cambiare con − e +:
// le quantità vengono ricalcolate (semplice proporzione) solo per la visualizzazione,
// la ricetta salvata non viene modificata. Il componente esiste solo mentre la finestra
// è aperta, quindi a ogni apertura si riparte dalle porzioni della ricetta.
export default function RecipeDetailModal({ recipe, onClose, onEdit, onDelete }) {
  const base = recipe.porzioniBase > 0 ? recipe.porzioniBase : 1;
  const [porzioni, setPorzioni] = useState(base);

  const ingredienti = porzioni === base ? recipe.ingredienti : scalaIngredienti({ ...recipe, porzioniBase: base }, porzioni);
  const g = giorniDaOggi(recipe.ultimaVoltaCucinata);

  return (
    <ModalBackdrop scrollable onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">{recipe.titolo}</h2>
              <p className="text-xs text-emerald-100 mt-1">
                {recipe.ultimaVoltaCucinata
                  ? g === 0 ? 'Cucinata oggi' : g === 1 ? 'Cucinata ieri' : `Cucinata ${g} giorni fa`
                  : 'Mai cucinata'}
              </p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none px-1" aria-label="Chiudi">×</button>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
            <span className="bg-white/15 px-3 py-1.5 rounded-lg flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{recipe.tempoPreparazioneMin}min prep. + {recipe.tempoCotturaMin}min cottura</span>
            <span className="bg-white/15 pl-3 pr-1.5 py-1 rounded-lg flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              <button
                onClick={() => setPorzioni((p) => Math.max(PORZIONI_MIN, p - 1))}
                disabled={porzioni <= PORZIONI_MIN}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 active:bg-white/40 disabled:opacity-40 flex items-center justify-center transition"
                aria-label="Meno porzioni"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm min-w-[1.25rem] text-center" aria-live="polite">{porzioni}</span>
              <button
                onClick={() => setPorzioni((p) => Math.min(PORZIONI_MAX, p + 1))}
                disabled={porzioni >= PORZIONI_MAX}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 active:bg-white/40 disabled:opacity-40 flex items-center justify-center transition"
                aria-label="Più porzioni"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span>{porzioni === 1 ? 'porzione' : 'porzioni'}</span>
            </span>
            <span className="bg-white/15 px-3 py-1.5 rounded-lg flex items-center gap-1"><Star className="w-3.5 h-3.5" />{recipe.bonta}/5</span>
            <span className="bg-white/15 px-3 py-1.5 rounded-lg flex items-center gap-1"><Euro className="w-3.5 h-3.5" />{recipe.prezzo}/5</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {(recipe.categoria.length > 0 || recipe.tagDieta.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.categoria.map((c) => (
                <span key={c} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-1 rounded-lg capitalize font-medium">{c}</span>
              ))}
              {recipe.tagDieta.map((t) => (
                <span key={t} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-1 rounded-lg capitalize font-medium">{t}</span>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ingredienti (per {porzioni} {porzioni === 1 ? 'persona' : 'persone'})
              </h4>
              {porzioni !== base && (
                <button
                  onClick={() => setPorzioni(base)}
                  className="shrink-0 whitespace-nowrap text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-2 py-1 -my-1 rounded-lg hover:bg-emerald-50 transition"
                >
                  Torna a {base}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ingredienti.map((ing) => (
                <span key={ing.id} className="bg-slate-50 border border-slate-100 text-slate-700 text-xs px-2 py-1.5 rounded-lg">
                  {ing.nome} · {ing.quantita}{ing.unita}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preparazione</h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{recipe.preparazione}</p>
          </div>

          {recipe.notePersonali && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Note personali</h4>
              <p className="text-sm text-slate-600 italic">{recipe.notePersonali}</p>
            </div>
          )}

          {recipe.fonte && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fonte</h4>
              <p className="text-sm text-emerald-700 break-all">{recipe.fonte}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onDelete(recipe)}
            className="mr-auto px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 active:bg-red-50 rounded-xl transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Elimina
          </button>
          <button
            onClick={() => onEdit(recipe)}
            className="px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" /> Modifica
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
