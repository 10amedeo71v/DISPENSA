import { useState } from 'react';
import { ricettaVuota, formDaRicetta } from '../utils/ricette.js';

// Stato del form "Nuova/Modifica ricetta": se è aperto, quali valori contiene e se sto
// modificando una ricetta esistente (editingId) o ne sto creando una nuova (null).
// Il form si può aprire da più punti (pulsante Nuova ricetta, importazione, suggerimento AI,
// modifica da scheda o dettaglio): per questo vive in un hook condiviso da App.
export function useRecipeForm() {
  const [aperto, setAperto] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(ricettaVuota);

  // `bozza` (facoltativa): campi già compilati, per esempio da importazione o suggerimento AI
  const apriNuova = (bozza) => {
    setForm(bozza ?? ricettaVuota());
    setEditingId(null);
    setAperto(true);
  };

  const apriModifica = (recipe) => {
    setForm(formDaRicetta(recipe));
    setEditingId(recipe.id);
    setAperto(true);
  };

  const chiudi = () => {
    setAperto(false);
    setEditingId(null);
    setForm(ricettaVuota());
  };

  const aggiungiRigaIngrediente = () => {
    setForm((prev) => ({
      ...prev,
      ingredienti: [...prev.ingredienti, { id: 'tmp' + Date.now(), nome: '', quantita: 1, unita: 'pz' }]
    }));
  };

  const rimuoviRigaIngrediente = (id) => {
    setForm((prev) => ({ ...prev, ingredienti: prev.ingredienti.filter((ing) => ing.id !== id) }));
  };

  const aggiornaIngrediente = (id, campo, valore) => {
    setForm((prev) => ({
      ...prev,
      ingredienti: prev.ingredienti.map((ing) => (ing.id === id ? { ...ing, [campo]: valore } : ing))
    }));
  };

  const toggleCategoriaRicetta = (cat) => {
    setForm((prev) => ({
      ...prev,
      categoria: prev.categoria.includes(cat) ? prev.categoria.filter((c) => c !== cat) : [...prev.categoria, cat]
    }));
  };

  return {
    aperto,
    editingId,
    form,
    setForm,
    apriNuova,
    apriModifica,
    chiudi,
    aggiungiRigaIngrediente,
    rimuoviRigaIngrediente,
    aggiornaIngrediente,
    toggleCategoriaRicetta
  };
}
