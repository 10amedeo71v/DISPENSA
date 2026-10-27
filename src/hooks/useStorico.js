import { useMemo } from 'react';
import { usePersistentState } from './usePersistentState.js';
import { STORAGE_KEYS } from '../utils/storage.js';
import { nuovoId } from '../utils/id.js';
import { OGGI, formattaDataLocale } from '../utils/date.js';
import { calcolaStatistiche } from '../utils/statistiche.js';

// Storico di ciò che entra ed esce dalla dispensa, usato dalla tab Statistiche.
// Ogni voce: { id, nome, quantita, unita, tipo: 'acquisto'|'consumo'|'spreco', data }
export function useStorico({ segnalaSalvataggio }) {
  const [storico, setStorico] = usePersistentState(STORAGE_KEYS.storico, [], segnalaSalvataggio);

  // Annota uno o più movimenti con la data di oggi. `voci`: oggetto o lista di oggetti
  // { nome, quantita, unita, tipo }.
  const registraStorico = (voci) => {
    const lista = Array.isArray(voci) ? voci : [voci];
    const oggiStr = formattaDataLocale(OGGI);
    setStorico((prev) => [...prev, ...lista.map((v) => ({ id: nuovoId(), data: oggiStr, ...v }))]);
  };

  const statistiche = useMemo(() => calcolaStatistiche(storico), [storico]);

  return { storico, registraStorico, statistiche };
}
