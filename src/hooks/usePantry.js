import { useMemo } from 'react';
import { usePersistentState } from './usePersistentState.js';
import { STORAGE_KEYS } from '../utils/storage.js';
import { giorniAllaData } from '../utils/date.js';

const nuovoId = () => Date.now().toString() + Math.random().toString().slice(2, 6);

// Dati e operazioni della dispensa. Non conosce l'interfaccia (modali, toast):
// quella resta nel componente, che chiama queste funzioni.
//  - valoreIniziale: contenuto della dispensa al primo avvio
//  - segnalaSalvataggio: chiamata dopo ogni salvataggio su localStorage
//  - registraStorico: per annotare acquisti, consumi e sprechi nelle statistiche
export function usePantry({ valoreIniziale, segnalaSalvataggio, registraStorico }) {
  const [pantry, setPantry] = usePersistentState(STORAGE_KEYS.pantry, valoreIniziale, segnalaSalvataggio);

  // Aggiunge uno o più prodotti nuovi e li registra come "acquisto".
  // Ogni prodotto: { nome, quantita, unita, posizione, dataScadenza }
  const aggiungiProdotti = (prodotti) => {
    const nuovi = prodotti.map((p) => ({
      id: nuovoId(),
      nome: p.nome,
      quantita: Number(p.quantita) || 1,
      unita: p.unita,
      posizione: p.posizione,
      dataScadenza: p.dataScadenza || null
    }));
    if (nuovi.length === 0) return nuovi;
    setPantry((prev) => [...prev, ...nuovi]);
    registraStorico(nuovi.map((n) => ({ nome: n.nome, quantita: n.quantita, unita: n.unita, tipo: 'acquisto' })));
    return nuovi;
  };

  const aggiungiProdotto = (prodotto) => aggiungiProdotti([prodotto])[0];

  const modificaProdotto = (id, campi) => {
    setPantry((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              nome: campi.nome,
              quantita: Number(campi.quantita) || 1,
              unita: campi.unita,
              posizione: campi.posizione,
              dataScadenza: campi.dataScadenza || null
            }
          : item
      )
    );
  };

  const cambiaQuantita = (id, delta) => {
    setPantry((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantita: Math.max(0, item.quantita + delta) } : item))
    );
  };

  // Toglie un prodotto dalla dispensa: se era già scaduto conta come "spreco",
  // altrimenti come "consumo". Restituisce il prodotto rimosso (o undefined).
  const rimuoviProdotto = (id) => {
    const item = pantry.find((p) => p.id === id);
    if (!item) return undefined;
    const eraScaduto = item.dataScadenza && giorniAllaData(item.dataScadenza) < 0;
    registraStorico({
      nome: item.nome,
      quantita: item.quantita,
      unita: item.unita,
      tipo: eraScaduto ? 'spreco' : 'consumo'
    });
    setPantry((prev) => prev.filter((p) => p.id !== id));
    return item;
  };

  // Prodotti scaduti o in scadenza entro 3 giorni
  const prodottiInScadenza = useMemo(
    () => pantry.filter((item) => item.dataScadenza && giorniAllaData(item.dataScadenza) <= 3),
    [pantry]
  );

  return {
    pantry,
    aggiungiProdotto,
    aggiungiProdotti,
    modificaProdotto,
    cambiaQuantita,
    rimuoviProdotto,
    prodottiInScadenza
  };
}
