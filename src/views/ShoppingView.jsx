import React, { useState } from 'react';
import { CheckCircle, Circle, Plus, RefreshCw, ShoppingBag } from 'lucide-react';
import SwipeableRow from '../components/SwipeableRow.jsx';
import { REPARTI_SUPERMERCATO } from '../utils/spesa.js';

// Schermata Lista Spesa. I dati e le operazioni arrivano da useShoppingList (tramite App);
// qui restano solo i campi per aggiungere un articolo e lo stato dello swipe.
export default function ShoppingView({
  shoppingList,
  spuntaArticolo,
  cambiaReparto,
  removeShoppingItem,
  aggiungiArticoloManuale,
  transferPurchasedToPantry
}) {
  const [nuovoArticoloSpesa, setNuovoArticoloSpesa] = useState('');
  const [nuovoArticoloQuantita, setNuovoArticoloQuantita] = useState(1);
  const [nuovoArticoloUnita, setNuovoArticoloUnita] = useState('pz');
  const [swipeOpenItemId, setSwipeOpenItemId] = useState(null); // id dell'articolo con lo swipe aperto

  const addManualShoppingItem = () => {
    const aggiunto = aggiungiArticoloManuale({
      nome: nuovoArticoloSpesa,
      quantita: nuovoArticoloQuantita,
      unita: nuovoArticoloUnita
    });
    if (!aggiunto) return;
    setNuovoArticoloSpesa('');
    setNuovoArticoloQuantita(1);
    setNuovoArticoloUnita('pz');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">La tua Lista Spesa</h2>
          <p className="text-xs text-slate-500">Generata dal piano pasti + articoli aggiunti a mano</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={transferPurchasedToPantry} className="flex-1 sm:flex-initial bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Trasferisci Acquistati in Dispensa</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2">
        <input
          type="text"
          placeholder="Aggiungi un articolo a mano..."
          value={nuovoArticoloSpesa}
          onChange={(e) => setNuovoArticoloSpesa(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addManualShoppingItem()}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            min="0"
            placeholder="Qtà"
            value={nuovoArticoloQuantita}
            onChange={(e) => setNuovoArticoloQuantita(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addManualShoppingItem()}
            className="w-20 px-2 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="unità"
            value={nuovoArticoloUnita}
            onChange={(e) => setNuovoArticoloUnita(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addManualShoppingItem()}
            className="flex-1 min-w-0 px-2 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button onClick={addManualShoppingItem} className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-xs items-center justify-center gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Aggiungi</span>
          </button>
        </div>
        <button onClick={addManualShoppingItem} className="sm:hidden w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Aggiungi</span>
        </button>
      </div>

      <div className="space-y-4">
        {shoppingList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">La lista è vuota!</p>
            <p className="text-xs text-slate-400 mt-1">Genera la lista dal Pianificatore Pasti o aggiungi articoli a mano.</p>
          </div>
        )}

        {REPARTI_SUPERMERCATO.map((reparto) => {
          const itemsReparto = shoppingList.filter((item) => (item.reparto || 'Da assegnare') === reparto);
          if (itemsReparto.length === 0) return null;
          return (
            <div key={reparto} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-600">{reparto}</span>
                <span className="text-xs text-slate-400 font-medium">{itemsReparto.length} articoli</span>
              </div>
              <div className="divide-y divide-slate-100">
                {itemsReparto.map((item) => (
                  <SwipeableRow
                    key={item.id}
                    id={item.id}
                    label={item.nome}
                    isOpen={swipeOpenItemId === item.id}
                    onOpenChange={setSwipeOpenItemId}
                    onDelete={(id) => { removeShoppingItem(id); setSwipeOpenItemId(null); }}
                  >
                    <div className={`p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition ${item.spuntato ? 'bg-slate-50/80' : ''}`}>
                      <div onClick={() => spuntaArticolo(item.id)} className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                        {item.spuntato ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${item.spuntato ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.nome}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.quantitaTotale} {item.unita} · {item.origine === 'piano' ? 'dal piano pasti' : 'manuale'}</p>
                        </div>
                      </div>
                      <select
                        value={item.reparto || 'Da assegnare'}
                        onChange={(e) => cambiaReparto(item.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0"
                      >
                        {REPARTI_SUPERMERCATO.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </SwipeableRow>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
