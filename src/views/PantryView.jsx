import React, { useState, useMemo } from 'react';
import { AlertTriangle, Clock, Edit2, Plus, Refrigerator, RefreshCw, Search, Sparkles, Trash2, Users } from 'lucide-react';
import ModalBackdrop from '../components/ModalBackdrop.jsx';
import { giorniAllaData } from '../utils/date.js';

// Schermata Dispensa & Frigo, con le finestre "Aggiungi/Modifica prodotto" e "Cosa cucino?".
// I dati e le operazioni arrivano da usePantry (tramite App).
export default function PantryView({
  pantry,
  prodottiInScadenza,
  aggiungiProdotto,
  modificaProdotto,
  cambiaQuantita,
  onRichiediEliminazione,
  onSalvaSuggerimento,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tutti');
  const [bannerScadenzeChiuso, setBannerScadenzeChiuso] = useState(false);
  const [isAddPantryOpen, setIsAddPantryOpen] = useState(false);
  const [editingPantryId, setEditingPantryId] = useState(null); // null = sto aggiungendo, id = sto modificando
  const [newPantryItem, setNewPantryItem] = useState({ nome: '', quantita: 1, unita: 'pz', posizione: 'Frigo', dataScadenza: '' });

  // Stati per i suggerimenti di ricette in base alla dispensa ("Cosa cucino?") via Gemini
  const [isSuggerisciOpen, setIsSuggerisciOpen] = useState(false);
  const [suggerimento, setSuggerimento] = useState({ stato: 'caricando', ricetta: null, errore: '' }); // stato: 'caricando' | 'pronto' | 'errore'
  const [titoliSuggeriti, setTitoliSuggeriti] = useState([]); // titoli già proposti in questa sessione, per non ripeterli
  const richiestaSuggerimentoId = React.useRef(0); // serve a ignorare risposte arrivate dopo aver chiuso la finestra

  const getExpiryStatus = (dateString) => {
    if (!dateString) return { label: 'N/D', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    const diffDays = giorniAllaData(dateString);
    if (diffDays < 0) return { label: `Scaduto (${Math.abs(diffDays)}g fa)`, color: 'bg-red-100 text-red-700 border-red-300 font-semibold' };
    if (diffDays <= 3) return { label: `In scadenza (${diffDays}g)`, color: 'bg-amber-100 text-amber-800 border-amber-300 font-medium' };
    return { label: `Fresco (${diffDays}g)`, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const handleAddPantryItem = (e) => {
    e.preventDefault();
    if (!newPantryItem.nome.trim()) return;

    if (editingPantryId) {
      // Sto modificando un prodotto esistente
      modificaProdotto(editingPantryId, newPantryItem);
      showToast(`"${newPantryItem.nome}" aggiornato!`);
    } else {
      // Sto aggiungendo un prodotto nuovo
      aggiungiProdotto(newPantryItem);
      showToast(`"${newPantryItem.nome}" aggiunto alla dispensa!`);
    }

    setNewPantryItem({ nome: '', quantita: 1, unita: 'pz', posizione: 'Frigo', dataScadenza: '' });
    setEditingPantryId(null);
    setIsAddPantryOpen(false);
  };

  const apriModificaPantry = (item) => {
    setNewPantryItem({
      nome: item.nome,
      quantita: item.quantita,
      unita: item.unita,
      posizione: item.posizione,
      dataScadenza: item.dataScadenza || ''
    });
    setEditingPantryId(item.id);
    setIsAddPantryOpen(true);
  };

  const filteredPantry = useMemo(() => {
    return pantry
      .filter((item) => {
        const matchSearch = item.nome.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = categoryFilter === 'Tutti' || item.posizione === categoryFilter;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        // I prodotti senza data di scadenza finiscono in fondo alla lista
        if (!a.dataScadenza && !b.dataScadenza) return 0;
        if (!a.dataScadenza) return 1;
        if (!b.dataScadenza) return -1;
        return new Date(a.dataScadenza) - new Date(b.dataScadenza);
      });
  }, [pantry, searchQuery, categoryFilter]);

  const expiringCount = prodottiInScadenza.length;

  const chiediSuggerimento = async (titoliDaEvitare) => {
    const idRichiesta = ++richiestaSuggerimentoId.current;

    // Mandiamo solo ciò che è davvero utilizzabile: niente prodotti finiti o già scaduti.
    const dispensa = pantry
      .filter((p) => p.quantita > 0 && !(p.dataScadenza && giorniAllaData(p.dataScadenza) < 0))
      .map((p) => ({
        nome: p.nome,
        quantita: p.quantita,
        unita: p.unita,
        scadeTraGiorni: p.dataScadenza ? giorniAllaData(p.dataScadenza) : null
      }));

    if (dispensa.length === 0) {
      setSuggerimento({ stato: 'errore', ricetta: null, errore: 'In dispensa non c\'è nulla di utilizzabile (vuota, finito o scaduto).' });
      return;
    }

    setSuggerimento({ stato: 'caricando', ricetta: null, errore: '' });
    try {
      const res = await fetch('/.netlify/functions/suggerisci-ricetta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispensa, evita: titoliDaEvitare })
      });
      const dati = await res.json();
      if (idRichiesta !== richiestaSuggerimentoId.current) return; // finestra chiusa o nuova richiesta nel frattempo

      if (!res.ok || dati.errore || !dati.ricetta) {
        setSuggerimento({ stato: 'errore', ricetta: null, errore: dati.errore || 'Non sono riuscito a ottenere un suggerimento.' });
        return;
      }
      setSuggerimento({ stato: 'pronto', ricetta: dati.ricetta, errore: '' });
      setTitoliSuggeriti((prev) => [...prev, dati.ricetta.titolo]);
    } catch (err) {
      if (idRichiesta !== richiestaSuggerimentoId.current) return;
      console.error('Errore suggerimento ricetta:', err);
      setSuggerimento({ stato: 'errore', ricetta: null, errore: 'Errore di connessione con il server. Riprova.' });
    }
  };

  const apriSuggerimenti = () => {
    setTitoliSuggeriti([]);
    setIsSuggerisciOpen(true);
    chiediSuggerimento([]);
  };

  const chiudiSuggerimenti = () => {
    richiestaSuggerimentoId.current += 1; // ignora eventuali risposte ancora in arrivo
    setIsSuggerisciOpen(false);
  };

  // "Salva nel ricettario": passa la proposta ad App, che apre il form Nuova ricetta già compilato
  const salvaSuggerimentoComeRicetta = () => {
    if (!suggerimento.ricetta) return;
    onSalvaSuggerimento(suggerimento.ricetta);
    chiudiSuggerimenti();
  };

  return (
    <>
      <div className="space-y-6">
        {prodottiInScadenza.length > 0 && !bannerScadenzeChiuso && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">
                {prodottiInScadenza.length} prodott{prodottiInScadenza.length === 1 ? 'o' : 'i'} in scadenza entro 3 giorni
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {prodottiInScadenza.map((p) => p.nome).join(', ')}
              </p>
            </div>
            <button onClick={() => setBannerScadenzeChiuso(true)} className="text-amber-400 hover:text-amber-700 text-lg leading-none px-1 shrink-0">×</button>
          </div>
        )}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca prodotti in casa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['Tutti', 'Frigo', 'Dispensa', 'Freezer'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  categoryFilter === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={apriSuggerimenti}
              className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-medium px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cosa cucino?</span>
            </button>
            <button
              onClick={() => { setEditingPantryId(null); setNewPantryItem({ nome: '', quantita: 1, unita: 'pz', posizione: 'Frigo', dataScadenza: '' }); setIsAddPantryOpen(true); }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Prodotto</span>
            </button>
          </div>
        </div>

        {filteredPantry.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <Refrigerator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">
              {pantry.length === 0 ? 'La dispensa è vuota' : 'Nessun prodotto trovato'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {pantry.length === 0
                ? 'Aggiungi il primo prodotto con il bottone qui sopra.'
                : 'Prova a cambiare filtro o la ricerca.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredPantry.map((item) => {
            const expiry = getExpiryStatus(item.dataScadenza);
            return (
              <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-1">
                    <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 truncate">
                      {item.posizione}
                    </span>
                    <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap ${expiry.color}`}>{expiry.label}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1 leading-tight">{item.nome}</h3>
                  <div className="flex items-center gap-1 sm:space-x-3 my-2 sm:my-3 bg-slate-50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-100 justify-between">
                    <div className="flex items-center gap-1 sm:space-x-2 w-full justify-between">
                      <button onClick={() => cambiaQuantita(item.id, -1)} className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center text-sm shrink-0">-</button>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 px-0.5 sm:px-1 truncate">{item.quantita} {item.unita}</span>
                      <button onClick={() => cambiaQuantita(item.id, 1)} className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center text-sm shrink-0">+</button>
                    </div>
                  </div>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-end gap-1 mt-1 sm:mt-2">
                  <button onClick={() => apriModificaPantry(item)} className="p-1 sm:p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Modifica">
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={() => onRichiediEliminazione(item)} className="p-1 sm:p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Elimina/Consumato">
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

    {isAddPantryOpen && (
      <ModalBackdrop>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingPantryId ? 'Modifica Prodotto' : 'Aggiungi Prodotto in Casa'}</h3>
          <form onSubmit={handleAddPantryItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Prodotto</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Es. Yogurt, Uova, Pasta..."
                value={newPantryItem.nome}
                onChange={(e) => setNewPantryItem({ ...newPantryItem, nome: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Posizione</label>
                <select
                  value={newPantryItem.posizione}
                  onChange={(e) => setNewPantryItem({ ...newPantryItem, posizione: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Frigo">Frigo</option>
                  <option value="Dispensa">Dispensa</option>
                  <option value="Freezer">Freezer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data Scadenza</label>
                <input
                  type="date"
                  value={newPantryItem.dataScadenza}
                  onChange={(e) => setNewPantryItem({ ...newPantryItem, dataScadenza: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantità</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={newPantryItem.quantita}
                  onChange={(e) => setNewPantryItem({ ...newPantryItem, quantita: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Unità di Misura</label>
                <input
                  type="text"
                  placeholder="pz, l, g, kg..."
                  value={newPantryItem.unita}
                  onChange={(e) => setNewPantryItem({ ...newPantryItem, unita: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsAddPantryOpen(false); setEditingPantryId(null); setNewPantryItem({ nome: '', quantita: 1, unita: 'pz', posizione: 'Frigo', dataScadenza: '' }); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
              >
                {editingPantryId ? 'Salva Modifiche' : 'Salva Prodotto'}
              </button>
            </div>
          </form>
        </div>
      </ModalBackdrop>
    )}

    {isSuggerisciOpen && (
      <ModalBackdrop scrollable>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 my-8">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Cosa cucino?
            </h3>
            <button onClick={chiudiSuggerimenti} className="text-slate-400 hover:text-slate-700 text-xl leading-none px-1" aria-label="Chiudi">×</button>
          </div>
          <p className="text-xs text-slate-400 mb-4">Una ricetta pensata per ciò che hai in dispensa, partendo da quello che scade prima.</p>

          {suggerimento.stato === 'caricando' && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Sto guardando cosa hai in casa…</p>
            </div>
          )}

          {suggerimento.stato === 'errore' && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3" role="alert">{suggerimento.errore}</div>
              <div className="flex gap-2">
                <button onClick={chiudiSuggerimenti} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Chiudi</button>
                <button onClick={() => chiediSuggerimento(titoliSuggeriti)} className="flex-1 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition">Riprova</button>
              </div>
            </div>
          )}

          {suggerimento.stato === 'pronto' && suggerimento.ricetta && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-800">{suggerimento.ricetta.titolo}</h4>
                {suggerimento.ricetta.motivo && (
                  <p className="text-xs text-slate-500 italic mt-1">{suggerimento.ricetta.motivo}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{suggerimento.ricetta.porzioniBase} porzioni</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {suggerimento.ricetta.tempoPreparazioneMin + suggerimento.ricetta.tempoCotturaMin} min
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Ingredienti</p>
                <ul className="space-y-1">
                  {suggerimento.ricetta.ingredienti.map((ing, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-700">{ing.nome}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-400 text-xs">{ing.quantita} {ing.unita}</span>
                        {!ing.inDispensa && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 rounded-full px-2 py-0.5">da comprare</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Preparazione</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{suggerimento.ricetta.preparazione}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button onClick={() => chiediSuggerimento(titoliSuggeriti)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Proponi un'altra
                </button>
                <button onClick={salvaSuggerimentoComeRicetta} className="flex-1 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition">
                  Salva nel ricettario
                </button>
              </div>
            </div>
          )}
        </div>
      </ModalBackdrop>
    )}
    </>
  );
}
