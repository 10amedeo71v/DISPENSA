import React, { useState } from 'react';
import { Calendar, Trash2, ChefHat, Sparkles, Zap, Flame, Users } from 'lucide-react';
import { GIORNI_SETTIMANA, dataDelGiorno, giorniDaOggi } from '../utils/date.js';
import { scegliPastiAutomatici } from '../utils/pianoPasti.js';

// Schermata Pianificatore Pasti: scelta della ricetta per ogni pranzo e cena, porzioni,
// generazione automatica dei pasti e della lista della spesa.
// I dati e le operazioni arrivano da useMealPlan e useRecipes (tramite App).
export default function MealPlanView({
  recipes,
  mealPlan,
  getRecipeById,
  trovaPasto,
  giornoHaPasti,
  setMealForSlot,
  cambiaPorzioni,
  rimuoviPasto,
  generaListaSpesaDaPiano,
  onRichiediSvuotaGiorno,
  showToast
}) {
  // Quali giorni della settimana sono selezionati per la generazione automatica
  const [giorniSelezionatiAuto, setGiorniSelezionatiAuto] = useState(() => GIORNI_SETTIMANA.map(() => false));

  const toggleGiornoAuto = (indiceGiorno) => {
    setGiorniSelezionatiAuto((prev) => prev.map((v, i) => (i === indiceGiorno ? !v : v)));
  };

  const generaPianoAutomatico = () => {
    const indiciSelezionati = giorniSelezionatiAuto
      .map((v, i) => (v ? i : null))
      .filter((i) => i !== null);

    if (indiciSelezionati.length === 0) {
      showToast('Seleziona almeno un giorno da pianificare.');
      return;
    }
    if (recipes.length === 0) {
      showToast('Aggiungi prima qualche ricetta al ricettario.');
      return;
    }

    const assegnazioni = scegliPastiAutomatici({
      indiciGiorni: indiciSelezionati,
      piano: mealPlan,
      recipes,
      dataDelGiorno
    });
    assegnazioni.forEach((a) => setMealForSlot(a.indiceGiorno, a.pasto, a.recipeId));

    if (assegnazioni.length === 0) {
      showToast('I giorni selezionati erano già completamente pianificati.');
    } else {
      showToast(`Generati ${assegnazioni.length} pasti per i giorni selezionati!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative z-10">
          <h2 className="text-xl font-black">Menu della Settimana</h2>
          <p className="text-xs text-emerald-200 mt-1">Scegli una ricetta per ogni pasto: le porzioni e la lista spesa si aggiornano da sole.</p>
        </div>
        <button onClick={generaListaSpesaDaPiano} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition relative z-10">
          <Sparkles className="w-4 h-4" />
          <span>Genera Lista Spesa dal Piano</span>
        </button>
        <ChefHat className="absolute -right-6 -bottom-6 w-36 h-36 text-emerald-800/40 pointer-events-none" />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" /> Generazione automatica
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Seleziona i giorni da riempire: pranzo e cena verranno assegnati automaticamente (solo dove non hai già scelto tu una ricetta), preferendo quelle che non cucini da più tempo.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {GIORNI_SETTIMANA.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleGiornoAuto(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                giorniSelezionatiAuto[i]
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        <button
          onClick={generaPianoAutomatico}
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Genera Pasti per i Giorni Selezionati</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {GIORNI_SETTIMANA.map((day, indiceGiorno) => {
          const data = dataDelGiorno(indiceGiorno);
          const haPasti = giornoHaPasti(data);
          return (
            <div key={day} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="font-black text-sm text-emerald-700 tracking-wide uppercase">{day}</span>
                <div className="flex items-center gap-2">
                  {haPasti && (
                    <button
                      onClick={() => onRichiediSvuotaGiorno(data, day)}
                      className="w-10 h-10 -my-2 -mr-1 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-50 rounded-xl transition"
                      title={`Svuota ${day}`}
                      aria-label={`Svuota ${day}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {['pranzo', 'cena'].map((pasto) => {
                const entry = trovaPasto(data, pasto);
                const recipe = entry ? getRecipeById(entry.recipeId) : null;
                return (
                  <div key={pasto} className="mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100 last:mb-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                      <Flame className={`w-3.5 h-3.5 ${pasto === 'pranzo' ? 'text-amber-500' : 'text-indigo-500'}`} />
                      <span>{pasto.toUpperCase()}</span>
                    </div>

                    <select
                      value={entry ? entry.recipeId : ''}
                      onChange={(e) => setMealForSlot(indiceGiorno, pasto, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Scegli una ricetta...</option>
                      {recipes.map((r) => {
                        const giorni = giorniDaOggi(r.ultimaVoltaCucinata);
                        const cucinataDiRecente = giorni !== null && giorni >= 0 && giorni <= 5;
                        return (
                          <option key={r.id} value={r.id}>
                            {r.titolo}{cucinataDiRecente ? ` · fatta ${giorni === 0 ? 'oggi' : `${giorni}g fa`}` : ''}
                          </option>
                        );
                      })}
                    </select>

                    {entry && recipe && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-4 h-4" />
                          <button
                            onClick={() => cambiaPorzioni(entry.id, -1)}
                            disabled={entry.porzioniScelte <= 1}
                            className="w-10 h-10 bg-white rounded-xl border border-slate-200 text-lg font-semibold text-slate-600 flex items-center justify-center active:bg-slate-100 disabled:opacity-40"
                            aria-label="Meno porzioni"
                          >-</button>
                          <span className="font-semibold text-slate-700 text-sm min-w-[1.25rem] text-center">{entry.porzioniScelte}</span>
                          <button
                            onClick={() => cambiaPorzioni(entry.id, 1)}
                            className="w-10 h-10 bg-white rounded-xl border border-slate-200 text-lg font-semibold text-slate-600 flex items-center justify-center active:bg-slate-100"
                            aria-label="Più porzioni"
                          >+</button>
                        </div>
                        <button
                          onClick={() => rimuoviPasto(entry.id)}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-50 rounded-xl transition"
                          title="Rimuovi pasto"
                          aria-label={`Rimuovi ${pasto}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
