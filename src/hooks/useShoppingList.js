import { useMemo } from 'react';
import { usePersistentState } from './usePersistentState.js';
import { STORAGE_KEYS } from '../utils/storage.js';
import { nuovoId } from '../utils/id.js';
import { indovinaReparto } from '../utils/spesa.js';

// Dati e operazioni della lista della spesa. Non conosce l'interfaccia (toast,
// swipe, campi di input): quella resta nel componente.
export function useShoppingList({ segnalaSalvataggio }) {
  const [shoppingList, setShoppingList] = usePersistentState(STORAGE_KEYS.shoppingList, [], segnalaSalvataggio);

  // Rigenera gli articoli "dal piano pasti": quelli vecchi generati dal piano
  // vengono sostituiti, quelli aggiunti a mano restano.
  // articoli: [{ nome, unita, quantitaTotale }]
  const sostituisciArticoliDaPiano = (articoli) => {
    const nuovi = articoli.map((a) => ({
      id: nuovoId(),
      nome: a.nome,
      quantitaTotale: a.quantitaTotale,
      unita: a.unita,
      reparto: 'Da assegnare',
      spuntato: false,
      origine: 'piano'
    }));
    setShoppingList((prev) => [...prev.filter((item) => item.origine === 'manuale'), ...nuovi]);
  };

  // Aggiunge un articolo a mano. Restituisce l'articolo creato, o null se il nome è vuoto.
  const aggiungiArticoloManuale = ({ nome, quantita, unita }) => {
    const nomePulito = String(nome ?? '').trim();
    if (!nomePulito) return null;
    const articolo = {
      id: nuovoId(),
      nome: nomePulito,
      quantitaTotale: Number(quantita) || 1,
      unita,
      reparto: indovinaReparto(nomePulito),
      spuntato: false,
      origine: 'manuale'
    };
    setShoppingList((prev) => [...prev, articolo]);
    return articolo;
  };

  const spuntaArticolo = (id) => {
    setShoppingList((prev) => prev.map((item) => (item.id === id ? { ...item, spuntato: !item.spuntato } : item)));
  };

  const cambiaReparto = (id, reparto) => {
    setShoppingList((prev) => prev.map((item) => (item.id === id ? { ...item, reparto } : item)));
  };

  // Restituisce l'articolo rimosso (o undefined se non esiste)
  const rimuoviArticolo = (id) => {
    const item = shoppingList.find((i) => i.id === id);
    if (!item) return undefined;
    setShoppingList((prev) => prev.filter((i) => i.id !== id));
    return item;
  };

  const articoliSpuntati = useMemo(() => shoppingList.filter((item) => item.spuntato), [shoppingList]);

  const rimuoviSpuntati = () => {
    setShoppingList((prev) => prev.filter((item) => !item.spuntato));
  };

  return {
    shoppingList,
    articoliSpuntati,
    sostituisciArticoliDaPiano,
    aggiungiArticoloManuale,
    spuntaArticolo,
    cambiaReparto,
    rimuoviArticolo,
    rimuoviSpuntati
  };
}
