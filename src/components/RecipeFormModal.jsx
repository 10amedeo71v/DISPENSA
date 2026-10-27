import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ModalBackdrop from './ModalBackdrop.jsx';

// Finestra "Nuova/Modifica ricetta". Lo stato del form arriva da useRecipeForm (tramite App):
// `newRecipe` sono i valori, `setNewRecipe` li aggiorna, `editingRecipeId` è vuoto se sto
// creando una ricetta nuova. `onSubmit` salva, `onChiudi` annulla.
export default function RecipeFormModal({
  newRecipe,
  setNewRecipe,
  editingRecipeId,
  aggiungiRigaIngrediente,
  rimuoviRigaIngrediente,
  aggiornaIngrediente,
  toggleCategoriaRicetta,
  onSubmit,
  onChiudi
}) {
  return (
<ModalBackdrop scrollable>
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100 my-8">
    <h3 className="text-lg font-bold text-slate-800 mb-4">{editingRecipeId ? 'Modifica Ricetta' : 'Nuova Ricetta'}</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Titolo</label>
        <input
          type="text"
          required
          autoFocus
          placeholder="Es. Pasta al pesto"
          value={newRecipe.titolo}
          onChange={(e) => setNewRecipe({ ...newRecipe, titolo: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Porzioni base</label>
          <input
            type="number"
            step="any"
            min="1"
            value={newRecipe.porzioniBase}
            onChange={(e) => setNewRecipe({ ...newRecipe, porzioniBase: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Prep. (min)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={newRecipe.tempoPreparazioneMin}
            onChange={(e) => setNewRecipe({ ...newRecipe, tempoPreparazioneMin: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Cottura (min)</label>
          <input
            type="number"
            step="any"
            min="0"
            value={newRecipe.tempoCotturaMin}
            onChange={(e) => setNewRecipe({ ...newRecipe, tempoCotturaMin: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Bontà (1-5)</label>
          <input
            type="number"
            step="any"
            min="1"
            max="5"
            value={newRecipe.bonta}
            onChange={(e) => setNewRecipe({ ...newRecipe, bonta: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Prezzo (1-5)</label>
          <input
            type="number"
            step="1"
            min="1"
            max="5"
            value={newRecipe.prezzo}
            onChange={(e) => setNewRecipe({ ...newRecipe, prezzo: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
        <div className="flex flex-wrap gap-2">
          {['colazione', 'pranzo', 'cena', 'spuntino'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategoriaRicetta(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                newRecipe.categoria.includes(cat)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-600">Ingredienti</label>
          <button
            type="button"
            onClick={aggiungiRigaIngrediente}
            className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Aggiungi ingrediente
          </button>
        </div>
        <div className="space-y-2">
          {newRecipe.ingredienti.map((ing) => (
            <div key={ing.id} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nome ingrediente"
                value={ing.nome}
                onChange={(e) => aggiornaIngrediente(ing.id, 'nome', e.target.value)}
                className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
            step="any"
                min="0"
                placeholder="Qtà"
                value={ing.quantita}
                onChange={(e) => aggiornaIngrediente(ing.id, 'quantita', e.target.value)}
                className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="unità"
                value={ing.unita}
                onChange={(e) => aggiornaIngrediente(ing.id, 'unita', e.target.value)}
                className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {newRecipe.ingredienti.length > 1 && (
                <button
                  type="button"
                  onClick={() => rimuoviRigaIngrediente(ing.id)}
                  className="text-slate-300 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Preparazione</label>
        <textarea
          rows="3"
          placeholder="Descrivi i passaggi..."
          value={newRecipe.preparazione}
          onChange={(e) => setNewRecipe({ ...newRecipe, preparazione: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Tag dieta (separati da virgola)</label>
          <input
            type="text"
            placeholder="vegetariano, senza glutine"
            value={newRecipe.tagDieta}
            onChange={(e) => setNewRecipe({ ...newRecipe, tagDieta: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Fonte (link video, opzionale)</label>
          <input
            type="text"
            placeholder="https://..."
            value={newRecipe.fonte}
            onChange={(e) => setNewRecipe({ ...newRecipe, fonte: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Note personali</label>
        <input
          type="text"
          placeholder="Note libere..."
          value={newRecipe.notePersonali}
          onChange={(e) => setNewRecipe({ ...newRecipe, notePersonali: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onChiudi}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          Annulla
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
        >
          {editingRecipeId ? 'Salva Modifiche' : 'Salva Ricetta'}
        </button>
      </div>
    </form>
  </div>
</ModalBackdrop>
  );
}
