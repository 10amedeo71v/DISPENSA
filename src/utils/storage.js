// ---------- PERSISTENZA (localStorage) ----------
// Chiavi usate per salvare i dati nel browser. Se in futuro cambi la
// struttura dati in modo importante, cambia anche la versione (v1 -> v2)
// così i vecchi dati salvati non creano conflitti con il nuovo formato.
export const STORAGE_KEYS = {
  recipes: 'dispensa-casa:recipes:v1',
  pantry: 'dispensa-casa:pantry:v1',
  mealPlan: 'dispensa-casa:mealPlan:v1',
  shoppingList: 'dispensa-casa:shoppingList:v1',
  storico: 'dispensa-casa:storico:v1'
};

export function leggiDaStorage(key, valoreIniziale) {
  try {
    const salvato = window.localStorage.getItem(key);
    return salvato ? JSON.parse(salvato) : valoreIniziale;
  } catch (err) {
    console.error(`Errore leggendo ${key} da localStorage:`, err);
    return valoreIniziale;
  }
}

// Restituisce true se il salvataggio è riuscito, false altrimenti (spazio
// esaurito, Safari in navigazione privata, storage bloccato...).
export function scriviSuStorage(key, valore) {
  try {
    window.localStorage.setItem(key, JSON.stringify(valore));
    return true;
  } catch (err) {
    console.error(`Errore salvando ${key} su localStorage:`, err);
    return false;
  }
}
