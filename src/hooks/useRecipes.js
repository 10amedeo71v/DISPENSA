import { usePersistentState } from './usePersistentState.js';
import { STORAGE_KEYS } from '../utils/storage.js';
import { nuovoId } from '../utils/id.js';
import { normalizzaCampiRicetta } from '../utils/ricette.js';

// Dati e operazioni del ricettario. Non conosce l'interfaccia (form, modali, toast):
// quella resta nel componente, che chiama queste funzioni.
export function useRecipes({ segnalaSalvataggio }) {
  const [recipes, setRecipes] = usePersistentState(STORAGE_KEYS.recipes, [], segnalaSalvataggio);

  const getRecipeById = (id) => recipes.find((r) => r.id === id);

  // Crea una ricetta dai campi del form. Restituisce la ricetta creata, o null se manca il titolo.
  const aggiungiRicetta = (form) => {
    const campi = normalizzaCampiRicetta(form);
    if (!campi.titolo) return null;
    const adesso = new Date().toISOString();
    const ricetta = { id: nuovoId(), ...campi, ultimaVoltaCucinata: null, createdAt: adesso, updatedAt: adesso };
    setRecipes((prev) => [...prev, ricetta]);
    return ricetta;
  };

  // Aggiorna una ricetta esistente (restano com'erano id, ultimaVoltaCucinata e createdAt).
  // Restituisce i campi salvati, o null se manca il titolo.
  const modificaRicetta = (id, form) => {
    const campi = normalizzaCampiRicetta(form);
    if (!campi.titolo) return null;
    const adesso = new Date().toISOString();
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...campi, updatedAt: adesso } : r)));
    return campi;
  };

  // Restituisce la ricetta rimossa (o undefined se non esiste).
  // Attenzione: i pasti pianificati con questa ricetta vanno tolti dal piano a parte.
  const rimuoviRicetta = (id) => {
    const ricetta = getRecipeById(id);
    if (!ricetta) return undefined;
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    return ricetta;
  };

  // Segna la ricetta come cucinata nella data indicata (AAAA-MM-GG), ma solo se è
  // più recente di quella già salvata: cucinare "ieri" non cancella un "oggi" già registrato.
  const segnaCucinata = (id, data) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const eraGiaPiuRecente = r.ultimaVoltaCucinata && r.ultimaVoltaCucinata > data;
        return eraGiaPiuRecente ? r : { ...r, ultimaVoltaCucinata: data };
      })
    );
  };

  return { recipes, getRecipeById, aggiungiRicetta, modificaRicetta, rimuoviRicetta, segnaCucinata };
}
