// ============================================================
// MODELLO DATI DELL'APP
// ============================================================
// Qui sono descritte, in un solo posto, le forme degli oggetti salvati dall'app.
// Sono tipi JSDoc: non cambiano il funzionamento, ma VS Code li usa per i suggerimenti
// e la documentazione, e sono il punto di partenza se in futuro si passa a TypeScript.
//
// Le date sono sempre stringhe "AAAA-MM-GG" (vedi utils/date.js).

/**
 * @typedef {Object} Ingrediente
 * @property {string} id
 * @property {string} nome
 * @property {number} quantita
 * @property {string} unita            es. 'g', 'ml', 'pz', 'cucchiaio'
 */

/**
 * @typedef {Object} Recipe
 * @property {string} id
 * @property {string} titolo
 * @property {Ingrediente[]} ingredienti
 * @property {string} preparazione
 * @property {number} porzioniBase      per quante persone sono le quantità degli ingredienti
 * @property {number} tempoPreparazioneMin
 * @property {number} tempoCotturaMin
 * @property {number} bonta             da 1 a 5
 * @property {number} prezzo            da 1 a 5 (indice soggettivo di costo)
 * @property {string} notePersonali
 * @property {string} fonte
 * @property {string[]} categoria       'colazione' | 'pranzo' | 'cena' | 'spuntino'
 * @property {string[]} tagDieta        es. 'vegetariano'
 * @property {string|null} ultimaVoltaCucinata   data AAAA-MM-GG, o null se mai cucinata
 * @property {string} createdAt         data e ora ISO
 * @property {string} updatedAt         data e ora ISO
 */

/**
 * @typedef {Object} MealPlanEntry
 * @property {string} id
 * @property {string} data              giorno del pasto (AAAA-MM-GG)
 * @property {'pranzo'|'cena'} pasto
 * @property {string} recipeId
 * @property {number} porzioniScelte
 */

/**
 * @typedef {Object} ShoppingListItem
 * @property {string} id
 * @property {string} nome
 * @property {number} quantitaTotale
 * @property {string} unita
 * @property {string} reparto           uno di REPARTI_SUPERMERCATO (utils/spesa.js)
 * @property {boolean} spuntato
 * @property {'piano'|'manuale'} origine
 */

/**
 * @typedef {Object} PantryItem
 * @property {string} id
 * @property {string} nome
 * @property {number} quantita
 * @property {string} unita
 * @property {string} posizione         'Frigo' | 'Dispensa' | 'Freezer'
 * @property {string|null} dataScadenza data AAAA-MM-GG, o null
 */

/**
 * @typedef {Object} MovimentoStorico
 * @property {string} id
 * @property {string} nome
 * @property {number} quantita
 * @property {string} unita
 * @property {'acquisto'|'consumo'|'spreco'} tipo
 * @property {string} data
 */

export {};
