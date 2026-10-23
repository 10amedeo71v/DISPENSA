// ---------- LOGICA DELLA LISTA DELLA SPESA (funzioni pure, senza React) ----------

export const REPARTI_SUPERMERCATO = ['Da assegnare', 'Ortofrutta', 'Freschi', 'Confezionati', 'Panetteria', 'Surgelati', 'Altro'];

// Prova a indovinare il reparto in base al nome del prodotto (euristica semplice, non AI).
// Non è fondamentale: se non trova nulla, resta "Da assegnare" e l'utente lo cambia a mano.
const REPARTO_KEYWORDS = {
  Ortofrutta: ['mela', 'mele', 'banana', 'banane', 'pomodor', 'insalata', 'patata', 'patate', 'cipolla', 'cipolle', 'limone', 'limoni', 'arancia', 'arance', 'zucchina', 'zucchine', 'carota', 'carote', 'frutta', 'verdura', 'aglio', 'peperon', 'melanzana', 'melanzane', 'basilico', 'prezzemolo'],
  Freschi: ['latte', 'uovo', 'uova', 'yogurt', 'formaggio', 'mozzarella', 'burro', 'prosciutto', 'salame', 'ricotta', 'panna', 'affettat'],
  Panetteria: ['pane', 'panino', 'grissini', 'focaccia', 'brioche', 'cornetto'],
  Surgelati: ['surgelat', 'gelato', 'piselli surgelati'],
  Confezionati: ['pasta', 'riso', 'biscotti', 'caffè', 'zucchero', 'farina', 'olio', 'passata', 'scatoletta', 'conserva', 'the', 'tè', 'cioccolat', 'sale']
};

export function indovinaReparto(nomeProdotto) {
  const n = nomeProdotto.toLowerCase();
  for (const [reparto, parole] of Object.entries(REPARTO_KEYWORDS)) {
    if (parole.some((p) => n.includes(p))) return reparto;
  }
  return 'Da assegnare';
}

// Ingredienti di una ricetta ricalcolati per un certo numero di porzioni
export function scalaIngredienti(recipe, porzioniScelte) {
  const fattore = porzioniScelte / recipe.porzioniBase;
  return recipe.ingredienti.map((ing) => ({
    ...ing,
    quantita: Math.round(ing.quantita * fattore * 100) / 100
  }));
}

// Somma gli ingredienti di tutti i pasti pianificati. Due voci si fondono solo se
// hanno stesso nome (senza distinguere maiuscole) e stessa unità di misura.
// Restituisce [{ nome, unita, quantitaTotale }], con la quantità arrotondata
// per eccesso all'intero (non si compra mezzo uovo).
export function aggregaIngredientiDaPiano(mealPlan, trovaRicetta) {
  const aggregati = {};
  mealPlan.forEach((entry) => {
    const recipe = trovaRicetta(entry.recipeId);
    if (!recipe) return;
    scalaIngredienti(recipe, entry.porzioniScelte).forEach((ing) => {
      const chiave = `${ing.nome.toLowerCase()}|${ing.unita}`;
      if (!aggregati[chiave]) aggregati[chiave] = { nome: ing.nome, unita: ing.unita, quantitaTotale: 0 };
      aggregati[chiave].quantitaTotale += ing.quantita;
    });
  });
  return Object.values(aggregati).map((a) => ({
    ...a,
    // Prima si toglie il "rumore" della virgola mobile (744.0000000000001 -> 744),
    // altrimenti l'arrotondamento per eccesso conterebbe un'unità di troppo.
    quantitaTotale: Math.ceil(Math.round(a.quantitaTotale * 100) / 100)
  }));
}
