import { usePersistentState } from './usePersistentState.js';
import { STORAGE_KEYS } from '../utils/storage.js';
import { nuovoId } from '../utils/id.js';

// Dati e operazioni del piano pasti. Ogni voce: { id, data, pasto, recipeId, porzioniScelte }.
// Non conosce l'interfaccia (select, toast, modali): quella resta nel componente.
export function useMealPlan({ valoreIniziale, segnalaSalvataggio }) {
  const [mealPlan, setMealPlan] = usePersistentState(STORAGE_KEYS.mealPlan, valoreIniziale, segnalaSalvataggio);

  // Il pasto pianificato in uno slot (data + pranzo/cena), se c'è
  const trovaPasto = (data, pasto) => mealPlan.find((m) => m.data === data && m.pasto === pasto);

  const giornoHaPasti = (data) => mealPlan.some((m) => m.data === data);

  // Quante volte una ricetta compare nel piano
  const contaPastiConRicetta = (recipeId) => mealPlan.filter((m) => m.recipeId === recipeId).length;

  // Mette una ricetta in uno slot. Se lo slot è già occupato cambia solo la ricetta e
  // tiene le porzioni scelte; se `recipeId` è vuoto, svuota lo slot.
  const impostaPasto = (data, pasto, recipeId) => {
    setMealPlan((prev) => {
      if (!recipeId) return prev.filter((m) => !(m.data === data && m.pasto === pasto));
      const esiste = prev.some((m) => m.data === data && m.pasto === pasto);
      if (esiste) {
        return prev.map((m) => (m.data === data && m.pasto === pasto ? { ...m, recipeId } : m));
      }
      return [...prev, { id: nuovoId(), data, pasto, recipeId, porzioniScelte: 1 }];
    });
  };

  // Cambia le porzioni di un pasto (mai sotto 1)
  const cambiaPorzioni = (idPasto, delta) => {
    setMealPlan((prev) =>
      prev.map((m) => (m.id === idPasto ? { ...m, porzioniScelte: Math.max(1, m.porzioniScelte + delta) } : m))
    );
  };

  const rimuoviPasto = (idPasto) => {
    setMealPlan((prev) => prev.filter((m) => m.id !== idPasto));
  };

  // Svuota pranzo e cena di un giorno
  const svuotaGiorno = (data) => {
    setMealPlan((prev) => prev.filter((m) => m.data !== data));
  };

  // Toglie dal piano tutti i pasti che usano una ricetta (da chiamare quando si elimina la ricetta)
  const rimuoviPastiConRicetta = (recipeId) => {
    setMealPlan((prev) => prev.filter((m) => m.recipeId !== recipeId));
  };

  return {
    mealPlan,
    trovaPasto,
    giornoHaPasti,
    contaPastiConRicetta,
    impostaPasto,
    cambiaPorzioni,
    rimuoviPasto,
    svuotaGiorno,
    rimuoviPastiConRicetta
  };
}
