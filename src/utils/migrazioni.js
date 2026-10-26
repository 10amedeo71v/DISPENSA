import { STORAGE_KEYS } from './storage.js';
import { nuovoId } from './id.js';
import { OGGI, parseDataLocale, formattaDataLocale } from './date.js';

// Da fine settembre a oggi l'app calcolava le date del pianificatore con
// toISOString(), che in Italia restituisce il giorno PRIMA. I pasti già
// pianificati per la settimana corrente risultano quindi salvati con la data
// sbagliata (un giorno indietro). Questa migrazione, eseguita una sola volta
// per dispositivo, li sposta avanti di un giorno. Tocca solo le voci della
// settimana corrente in poi: quelle più vecchie sono già passate.
const FLAG = 'dispensa-casa:migrazione-date-piano:v1';

export function migraDatePianoPasti(oggi = OGGI) {
  try {
    if (window.localStorage.getItem(FLAG)) return 0;
    const grezzo = window.localStorage.getItem(STORAGE_KEYS.mealPlan);
    let spostate = 0;
    if (grezzo) {
      const piano = JSON.parse(grezzo);
      if (Array.isArray(piano)) {
        // Lunedì della settimana corrente, meno un giorno (le voci sfasate partono da lì)
        const lunedi = new Date(oggi);
        lunedi.setDate(lunedi.getDate() - ((oggi.getDay() + 6) % 7) - 1);
        const soglia = formattaDataLocale(lunedi);
        const nuovo = piano.map((voce) => {
          if (!voce || typeof voce.data !== 'string' || voce.data < soglia) return voce;
          const d = parseDataLocale(voce.data);
          d.setDate(d.getDate() + 1);
          spostate += 1;
          return { ...voce, data: formattaDataLocale(d) };
        });
        window.localStorage.setItem(STORAGE_KEYS.mealPlan, JSON.stringify(nuovo));
      }
    }
    window.localStorage.setItem(FLAG, new Date().toISOString());
    return spostate;
  } catch (err) {
    console.error('Migrazione date piano pasti non riuscita:', err);
    return 0;
  }
}

// Fino a poco fa i pasti creati dalla generazione automatica ricevevano tutti lo stesso
// id (venivano creati nello stesso millisecondo). Con id uguali, cambiare le porzioni o
// togliere un pasto agiva su tutti insieme. Questa riparazione dà un id nuovo a ogni
// elemento che ripete un id già visto (il primo lo tiene). Si può rilanciare senza danni:
// se non trova doppioni non scrive nulla. Restituisce quanti elementi ha corretto.
export function riparaIdDuplicati() {
  let corretti = 0;
  Object.values(STORAGE_KEYS).forEach((chiave) => {
    try {
      const grezzo = window.localStorage.getItem(chiave);
      if (!grezzo) return;
      const lista = JSON.parse(grezzo);
      if (!Array.isArray(lista)) return;
      const visti = new Set();
      let modificata = false;
      const nuova = lista.map((voce) => {
        if (!voce || typeof voce !== 'object') return voce;
        if (voce.id === undefined || voce.id === null || visti.has(voce.id)) {
          modificata = true;
          corretti += 1;
          const id = nuovoId();
          visti.add(id);
          return { ...voce, id };
        }
        visti.add(voce.id);
        return voce;
      });
      if (modificata) window.localStorage.setItem(chiave, JSON.stringify(nuova));
    } catch (err) {
      console.error(`Riparazione id duplicati non riuscita per ${chiave}:`, err);
    }
  });
  return corretti;
}

// Toglie dal piano pasti le voci inutilizzabili: quelle senza ricetta (lasciate da una
// scelta "Scegli una ricetta..." su uno slot già pieno) e quelle che puntano a una ricetta
// che non esiste più. Se l'elenco ricette non è leggibile non tocca nulla. Restituisce
// quante voci ha tolto.
export function pulisciPianoPasti() {
  try {
    const grezzoRicette = window.localStorage.getItem(STORAGE_KEYS.recipes);
    const grezzoPiano = window.localStorage.getItem(STORAGE_KEYS.mealPlan);
    if (!grezzoRicette || !grezzoPiano) return 0;
    const ricette = JSON.parse(grezzoRicette);
    const piano = JSON.parse(grezzoPiano);
    if (!Array.isArray(ricette) || !Array.isArray(piano)) return 0;
    const idRicette = new Set(ricette.map((r) => r && r.id));
    const pulito = piano.filter((m) => m && m.recipeId && idRicette.has(m.recipeId));
    if (pulito.length === piano.length) return 0;
    window.localStorage.setItem(STORAGE_KEYS.mealPlan, JSON.stringify(pulito));
    return piano.length - pulito.length;
  } catch (err) {
    console.error('Pulizia del piano pasti non riuscita:', err);
    return 0;
  }
}
