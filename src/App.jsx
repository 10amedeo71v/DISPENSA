import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Refrigerator,
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  AlertTriangle,
  Search,
  ChefHat,
  Clock,
  Sparkles,
  RefreshCw,
  Package,
  Zap,
  Flame,
  ChevronDown,
  ChevronUp,
  Users,
  Star,
  Euro,
  Edit2,
  TrendingUp
} from 'lucide-react';

/*
  ============================================================
  MODELLO DATI (come da schema concordato)
  ============================================================
  Qui sotto trovi gli stessi "tipi" di prima, ma scritti come
  semplici oggetti JavaScript (niente TypeScript, così non devi
  configurare nulla in più nel progetto). Ogni oggetto che crei
  nell'app segue questa forma.

  Recipe = {
    id, titolo, ingredienti: [{ id, nome, quantita, unita }],
    preparazione, porzioniBase,
    tempoPreparazioneMin, tempoCotturaMin,
    bonta, prezzo, notePersonali, fonte,
    categoria: [], tagDieta: [],
    ultimaVoltaCucinata, createdAt, updatedAt
  }

  MealPlanEntry = { id, data, pasto, recipeId, porzioniScelte }

  ShoppingListItem = {
    id, nome, quantitaTotale, unita, reparto, spuntato, origine
  }

  PantryItem = {
    id, nome, quantita, unita, posizione, dataScadenza, barcodeAggiunto
  }
  ============================================================
*/

// ---------- DATI DI ESEMPIO (li sostituirai con i tuoi) ----------

const INITIAL_RECIPES = [
  {
    id: 'r1',
    titolo: 'Spaghetti al Pomodoro & Mozzarella',
    ingredienti: [
      { id: 'i1', nome: 'Pasta Spaghetti n.5', quantita: 320, unita: 'g' },
      { id: 'i2', nome: 'Passata di Pomodoro', quantita: 400, unita: 'ml' },
      { id: 'i3', nome: 'Mozzarella di Bufala', quantita: 1, unita: 'pz' },
      { id: 'i4', nome: "Olio Extravergine d'Oliva", quantita: 2, unita: 'cucchiaio' }
    ],
    preparazione:
      "Cuoci la pasta in abbondante acqua salata. Nel frattempo scalda la passata con olio e sale. Scola la pasta, saltala col sugo e aggiungi la mozzarella a cubetti alla fine.",
    porzioniBase: 4,
    tempoPreparazioneMin: 10,
    tempoCotturaMin: 10,
    bonta: 4,
    prezzo: 1,
    notePersonali: '',
    fonte: '',
    categoria: ['pranzo', 'cena'],
    tagDieta: ['vegetariano'],
    ultimaVoltaCucinata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'r2',
    titolo: 'Frittata soffice con Piselli',
    ingredienti: [
      { id: 'i1', nome: 'Uova Fresche', quantita: 6, unita: 'pz' },
      { id: 'i2', nome: 'Piselli Surgelati', quantita: 200, unita: 'g' },
      { id: 'i3', nome: "Olio Extravergine d'Oliva", quantita: 1, unita: 'cucchiaio' }
    ],
    preparazione:
      "Sbollenta i piselli per 5 minuti. Sbatti le uova in una ciotola con sale e pepe. Rosola i piselli con poco olio, unisci le uova sbattute e cuoci su entrambi i lati.",
    porzioniBase: 4,
    tempoPreparazioneMin: 5,
    tempoCotturaMin: 10,
    bonta: 4,
    prezzo: 1,
    notePersonali: '',
    fonte: '',
    categoria: ['pranzo', 'cena'],
    tagDieta: ['vegetariano', 'senza glutine'],
    ultimaVoltaCucinata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'r3',
    titolo: 'Pollo dorato in padella con Insalata',
    ingredienti: [
      { id: 'i1', nome: 'Petto di Pollo', quantita: 500, unita: 'g' },
      { id: 'i2', nome: 'Insalata Mista', quantita: 1, unita: 'pz' },
      { id: 'i3', nome: "Olio Extravergine d'Oliva", quantita: 2, unita: 'cucchiaio' }
    ],
    preparazione:
      "Cuoci i petti di pollo in padella antiaderente con un filo d'olio e erbe aromatiche. Servi caldo con l'insalata condita a piacere.",
    porzioniBase: 4,
    tempoPreparazioneMin: 10,
    tempoCotturaMin: 15,
    bonta: 4,
    prezzo: 2,
    notePersonali: '',
    fonte: '',
    categoria: ['pranzo', 'cena'],
    tagDieta: ['senza glutine'],
    ultimaVoltaCucinata: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_PANTRY = [
  { id: 'p1', nome: 'Latte Intero', quantita: 1, unita: 'l', posizione: 'Frigo', dataScadenza: '2026-09-18', barcodeAggiunto: false },
  { id: 'p2', nome: 'Uova Fresche', quantita: 6, unita: 'pz', posizione: 'Frigo', dataScadenza: '2026-09-22', barcodeAggiunto: false },
  { id: 'p3', nome: 'Pasta Spaghetti n.5', quantita: 640, unita: 'g', posizione: 'Dispensa', dataScadenza: '2027-04-10', barcodeAggiunto: false },
  { id: 'p4', nome: 'Passata di Pomodoro', quantita: 800, unita: 'ml', posizione: 'Dispensa', dataScadenza: '2027-01-20', barcodeAggiunto: false },
  { id: 'p5', nome: 'Petto di Pollo', quantita: 500, unita: 'g', posizione: 'Freezer', dataScadenza: '2026-11-30', barcodeAggiunto: false }
];

const INITIAL_MEAL_PLAN = [
  { id: 'm1', data: '2026-09-16', pasto: 'pranzo', recipeId: 'r1', porzioniScelte: 4 },
  { id: 'm2', data: '2026-09-16', pasto: 'cena', recipeId: 'r3', porzioniScelte: 4 },
  { id: 'm3', data: '2026-09-17', pasto: 'pranzo', recipeId: 'r2', porzioniScelte: 4 }
];

const GIORNI_SETTIMANA = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const OGGI = new Date('2026-09-16');

const REPARTI_SUPERMERCATO = ['Da assegnare', 'Ortofrutta', 'Freschi', 'Confezionati', 'Panetteria', 'Surgelati', 'Altro'];

// ---------- PERSISTENZA (localStorage) ----------
// Chiavi usate per salvare i dati nel browser. Se in futuro cambi la
// struttura dati in modo importante, cambia anche la versione (v1 -> v2)
// così i vecchi dati salvati non creano conflitti con il nuovo formato.
const STORAGE_KEYS = {
  recipes: 'dispensa-casa:recipes:v1',
  pantry: 'dispensa-casa:pantry:v1',
  mealPlan: 'dispensa-casa:mealPlan:v1',
  shoppingList: 'dispensa-casa:shoppingList:v1',
  storico: 'dispensa-casa:storico:v1'
};

function leggiDaStorage(key, valoreIniziale) {
  try {
    const salvato = window.localStorage.getItem(key);
    return salvato ? JSON.parse(salvato) : valoreIniziale;
  } catch (err) {
    console.error(`Errore leggendo ${key} da localStorage:`, err);
    return valoreIniziale;
  }
}

function scriviSuStorage(key, valore) {
  try {
    window.localStorage.setItem(key, JSON.stringify(valore));
  } catch (err) {
    console.error(`Errore salvando ${key} su localStorage:`, err);
  }
}

function dataDelGiorno(indiceGiorno) {
  // indiceGiorno: 0 = Lunedì ... 6 = Domenica, basato sulla settimana corrente (OGGI = Mercoledì)
  const oggiIndex = 2; // Mercoledì nell'array GIORNI_SETTIMANA
  const diff = indiceGiorno - oggiIndex;
  const d = new Date(OGGI);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('meals'); // pantry, shopping, meals, recipes

  const [recipes, setRecipes] = useState(() => leggiDaStorage(STORAGE_KEYS.recipes, INITIAL_RECIPES));
  const [pantry, setPantry] = useState(() => leggiDaStorage(STORAGE_KEYS.pantry, INITIAL_PANTRY));
  const [mealPlan, setMealPlan] = useState(() => leggiDaStorage(STORAGE_KEYS.mealPlan, INITIAL_MEAL_PLAN));
  const [shoppingList, setShoppingList] = useState(() => leggiDaStorage(STORAGE_KEYS.shoppingList, []));
  // Storico di ciò che entra/esce dalla dispensa, usato dalla tab Statistiche.
  // Ogni voce: { id, nome, quantita, unita, tipo: 'acquisto'|'consumo'|'spreco', data }
  const [storico, setStorico] = useState(() => leggiDaStorage(STORAGE_KEYS.storico, []));

  // Ogni volta che uno di questi dati cambia, lo salviamo subito nel browser.
  React.useEffect(() => scriviSuStorage(STORAGE_KEYS.recipes, recipes), [recipes]);
  React.useEffect(() => scriviSuStorage(STORAGE_KEYS.pantry, pantry), [pantry]);
  React.useEffect(() => scriviSuStorage(STORAGE_KEYS.mealPlan, mealPlan), [mealPlan]);
  React.useEffect(() => scriviSuStorage(STORAGE_KEYS.shoppingList, shoppingList), [shoppingList]);
  React.useEffect(() => scriviSuStorage(STORAGE_KEYS.storico, storico), [storico]);

  const registraStorico = (voci) => {
    const arr = Array.isArray(voci) ? voci : [voci];
    const oggiStr = OGGI.toISOString().split('T')[0];
    setStorico((prev) => [
      ...prev,
      ...arr.map((v) => ({ id: Date.now().toString() + Math.random().toString().slice(2, 6), data: oggiStr, ...v }))
    ]);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tutti');
  const [expandedRecipeTime, setExpandedRecipeTime] = useState({}); // { [recipeId]: true/false }
  const [selectedRecipeId, setSelectedRecipeId] = useState(null); // ricetta aperta in vista dettaglio
  const [pendingDelete, setPendingDelete] = useState(null); // { tipo: 'pantry'|'recipe'|'shopping', id, nome }

  // Stati per le modali "Aggiungi/Modifica Prodotto" e "Nuova/Modifica Ricetta"
  const [isAddPantryOpen, setIsAddPantryOpen] = useState(false);
  const [editingPantryId, setEditingPantryId] = useState(null); // null = sto aggiungendo, id = sto modificando
  const [newPantryItem, setNewPantryItem] = useState({ nome: '', quantita: 1, unita: 'pz', posizione: 'Frigo', dataScadenza: '' });

  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null); // null = sto aggiungendo, id = sto modificando
  const RICETTA_VUOTA = {
    titolo: '',
    ingredienti: [{ id: 'tmp1', nome: '', quantita: 1, unita: 'pz' }],
    preparazione: '',
    porzioniBase: 4,
    tempoPreparazioneMin: 10,
    tempoCotturaMin: 10,
    bonta: 3,
    prezzo: 1,
    notePersonali: '',
    fonte: '',
    categoria: [],
    tagDieta: ''
  };
  const [newRecipe, setNewRecipe] = useState(RICETTA_VUOTA);

  // Stati per l'importazione ricette da link (Instagram/TikTok) via Gemini
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importTestoManuale, setImportTestoManuale] = useState('');
  const [importStato, setImportStato] = useState('inserisci'); // 'inserisci' | 'caricando' | 'errore' | 'chiediTesto'
  const [importErroreMsg, setImportErroreMsg] = useState('');

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ---------- HELPERS ----------

  const getRecipeById = (id) => recipes.find((r) => r.id === id);

  const getExpiryStatus = (dateString) => {
    if (!dateString) return { label: 'N/D', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    const expDate = new Date(dateString);
    const diffDays = Math.ceil((expDate - OGGI) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `Scaduto (${Math.abs(diffDays)}g fa)`, color: 'bg-red-100 text-red-700 border-red-300 font-semibold' };
    if (diffDays <= 3) return { label: `In scadenza (${diffDays}g)`, color: 'bg-amber-100 text-amber-800 border-amber-300 font-medium' };
    return { label: `Fresco (${diffDays}g)`, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  // Ricalcolo automatico quantità ingredienti in base alle porzioni scelte
  const ingredientiScalati = (recipe, porzioniScelte) => {
    const fattore = porzioniScelte / recipe.porzioniBase;
    return recipe.ingredienti.map((ing) => ({
      ...ing,
      quantita: Math.round(ing.quantita * fattore * 100) / 100
    }));
  };

  // ---------- GESTIONE PIANO PASTI ----------

  // Quante volte è "distante" una data da oggi, in giorni (positivo = passato, negativo = futuro)
  const giorniDaOggi = (dataString) => {
    if (!dataString) return null;
    const d = new Date(dataString);
    return Math.round((OGGI - d) / (1000 * 60 * 60 * 24));
  };

  const setMealForSlot = (indiceGiorno, pasto, recipeId) => {
    const data = dataDelGiorno(indiceGiorno);
    setMealPlan((prev) => {
      const esiste = prev.find((m) => m.data === data && m.pasto === pasto);
      if (esiste) {
        return prev.map((m) =>
          m.data === data && m.pasto === pasto ? { ...m, recipeId, porzioniScelte: m.porzioniScelte } : m
        );
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          data,
          pasto,
          recipeId,
          porzioniScelte: 1
        }
      ];
    });

    // Aggiorniamo "ultimaVoltaCucinata" sulla ricetta, solo se la data pianificata
    // non è nel futuro (se stai pianificando per tra 3 giorni, non l'hai ancora cucinata!)
    // e solo se è più recente di quella già salvata.
    if (recipeId && giorniDaOggi(data) >= 0) {
      setRecipes((prev) =>
        prev.map((r) => {
          if (r.id !== recipeId) return r;
          const eraGiaPiuRecente = r.ultimaVoltaCucinata && r.ultimaVoltaCucinata > data;
          return eraGiaPiuRecente ? r : { ...r, ultimaVoltaCucinata: data };
        })
      );
    }
  };

  // ---------- GENERAZIONE AUTOMATICA DEL PIANO ----------

  // Quali giorni della settimana sono selezionati per la generazione automatica
  const [giorniSelezionatiAuto, setGiorniSelezionatiAuto] = useState(() => GIORNI_SETTIMANA.map(() => false));

  const toggleGiornoAuto = (indiceGiorno) => {
    setGiorniSelezionatiAuto((prev) => prev.map((v, i) => (i === indiceGiorno ? !v : v)));
  };

  // Più tempo è passato dall'ultima volta che una ricetta è stata cucinata, più "peso" ha
  // nella scelta casuale (quindi più probabile) — le ricette recenti non sono escluse, solo
  // meno probabili. Le ricette mai cucinate hanno il peso massimo.
  const pesoRicetta = (recipe) => {
    const g = giorniDaOggi(recipe.ultimaVoltaCucinata);
    if (g === null) return 10;
    return Math.min(10, Math.max(1, g));
  };

  const sceglieRicettaPesata = (pool, esclusiInQuestoGiro) => {
    let candidati = pool.filter((r) => !esclusiInQuestoGiro.has(r.id));
    if (candidati.length === 0) candidati = pool;
    if (candidati.length === 0) return null;
    const pesi = candidati.map(pesoRicetta);
    const totale = pesi.reduce((a, b) => a + b, 0);
    let r = Math.random() * totale;
    for (let i = 0; i < candidati.length; i++) {
      r -= pesi[i];
      if (r <= 0) return candidati[i];
    }
    return candidati[candidati.length - 1];
  };

  const generaPianoAutomatico = () => {
    const indiciSelezionati = giorniSelezionatiAuto
      .map((v, i) => (v ? i : null))
      .filter((i) => i !== null);

    if (indiciSelezionati.length === 0) {
      showToast('Seleziona almeno un giorno da pianificare.');
      return;
    }
    if (recipes.length === 0) {
      showToast('Aggiungi prima qualche ricetta al ricettario.');
      return;
    }

    const usateInQuestoGiro = new Set();
    let generati = 0;

    indiciSelezionati.forEach((indiceGiorno) => {
      const data = dataDelGiorno(indiceGiorno);
      ['pranzo', 'cena'].forEach((pasto) => {
        // Non sovrascriviamo pasti già pianificati a mano
        const esiste = mealPlan.find((m) => m.data === data && m.pasto === pasto);
        if (esiste) return;

        // Preferiamo ricette adatte a quel pasto, se la ricetta ha una categoria impostata
        let pool = recipes.filter((r) => r.categoria.length === 0 || r.categoria.includes(pasto));
        if (pool.length === 0) pool = recipes;

        const scelta = sceglieRicettaPesata(pool, usateInQuestoGiro);
        if (!scelta) return;

        usateInQuestoGiro.add(scelta.id);
        setMealForSlot(indiceGiorno, pasto, scelta.id);
        generati++;
      });
    });

    if (generati === 0) {
      showToast('I giorni selezionati erano già completamente pianificati.');
    } else {
      showToast(`Generati ${generati} pasti per i giorni selezionati!`);
    }
  };

  const updatePorzioni = (entryId, delta) => {
    setMealPlan((prev) =>
      prev.map((m) => (m.id === entryId ? { ...m, porzioniScelte: Math.max(1, m.porzioniScelte + delta) } : m))
    );
  };

  const removeMeal = (entryId) => {
    setMealPlan((prev) => prev.filter((m) => m.id !== entryId));
  };

  // Genera la lista della spesa aggregando gli ingredienti di tutti i pasti pianificati
  const generaListaSpesaDaPiano = () => {
    const aggregati = {}; // chiave: "nome|unita" -> quantitaTotale

    mealPlan.forEach((entry) => {
      const recipe = getRecipeById(entry.recipeId);
      if (!recipe) return;
      const ingredienti = ingredientiScalati(recipe, entry.porzioniScelte);
      ingredienti.forEach((ing) => {
        const chiave = `${ing.nome.toLowerCase()}|${ing.unita}`;
        if (!aggregati[chiave]) {
          aggregati[chiave] = { nome: ing.nome, unita: ing.unita, quantitaTotale: 0 };
        }
        aggregati[chiave].quantitaTotale += ing.quantita;
      });
    });

    const nuoviArticoli = Object.values(aggregati).map((item) => ({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      nome: item.nome,
      quantitaTotale: Math.ceil(item.quantitaTotale),
      unita: item.unita,
      reparto: 'Da assegnare',
      spuntato: false,
      origine: 'piano'
    }));

    setShoppingList((prev) => {
      // Rimuovi i vecchi articoli generati dal piano (non tocca quelli aggiunti manualmente) e rimetti i nuovi
      const manuali = prev.filter((item) => item.origine === 'manuale');
      return [...manuali, ...nuoviArticoli];
    });

    showToast('Lista della spesa generata dal piano pasti!');
    setActiveTab('shopping');
  };

  const toggleShoppingCheck = (id) => {
    setShoppingList((prev) => prev.map((item) => (item.id === id ? { ...item, spuntato: !item.spuntato } : item)));
  };

  const updateShoppingItemReparto = (id, reparto) => {
    setShoppingList((prev) => prev.map((item) => (item.id === id ? { ...item, reparto } : item)));
  };

  const removeShoppingItem = (id) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  // Esegue davvero l'eliminazione dopo che l'utente ha confermato nella modale
  const confermaEliminazione = () => {
    if (!pendingDelete) return;
    const { tipo, id, nome } = pendingDelete;
    if (tipo === 'pantry') {
      const item = pantry.find((p) => p.id === id);
      if (item) {
        const eraScaduto = item.dataScadenza && new Date(item.dataScadenza) < OGGI;
        registraStorico({
          nome: item.nome,
          quantita: item.quantita,
          unita: item.unita,
          tipo: eraScaduto ? 'spreco' : 'consumo'
        });
      }
      setPantry((prev) => prev.filter((p) => p.id !== id));
      showToast(`"${nome}" eliminato dalla dispensa.`);
    } else if (tipo === 'recipe') {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      showToast(`Ricetta "${nome}" eliminata.`);
    } else if (tipo === 'shopping') {
      setShoppingList((prev) => prev.filter((item) => item.id !== id));
      showToast(`"${nome}" rimosso dalla lista.`);
    }
    setPendingDelete(null);
  };

  // Prova a indovinare il reparto in base al nome del prodotto (euristica semplice, non AI).
  // Non è fondamentale: se non trova nulla, resta "Da assegnare" e l'utente lo cambia a mano.
  const REPARTO_KEYWORDS = {
    Ortofrutta: ['mela', 'banana', 'pomodor', 'insalata', 'patata', 'cipolla', 'limone', 'arancia', 'zucchina', 'carota', 'frutta', 'verdura', 'aglio', 'peperon', 'melanzana', 'basilico', 'prezzemolo'],
    Freschi: ['latte', 'uovo', 'uova', 'yogurt', 'formaggio', 'mozzarella', 'burro', 'prosciutto', 'salame', 'ricotta', 'panna', 'affettat'],
    Panetteria: ['pane', 'panino', 'grissini', 'focaccia', 'brioche', 'cornetto'],
    Surgelati: ['surgelat', 'gelato', 'piselli surgelati'],
    Confezionati: ['pasta', 'riso', 'biscotti', 'caffè', 'zucchero', 'farina', 'olio', 'passata', 'scatoletta', 'conserva', 'the', 'tè', 'cioccolat', 'sale']
  };
  const indovinaReparto = (nomeProdotto) => {
    const n = nomeProdotto.toLowerCase();
    for (const [reparto, parole] of Object.entries(REPARTO_KEYWORDS)) {
      if (parole.some((p) => n.includes(p))) return reparto;
    }
    return 'Da assegnare';
  };

  const [nuovoArticoloSpesa, setNuovoArticoloSpesa] = useState('');
  const [nuovoArticoloQuantita, setNuovoArticoloQuantita] = useState(1);
  const [nuovoArticoloUnita, setNuovoArticoloUnita] = useState('pz');
  const addManualShoppingItem = () => {
    if (!nuovoArticoloSpesa.trim()) return;
    setShoppingList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        nome: nuovoArticoloSpesa,
        quantitaTotale: Number(nuovoArticoloQuantita) || 1,
        unita: nuovoArticoloUnita,
        reparto: indovinaReparto(nuovoArticoloSpesa),
        spuntato: false,
        origine: 'manuale'
      }
    ]);
    setNuovoArticoloSpesa('');
    setNuovoArticoloQuantita(1);
    setNuovoArticoloUnita('pz');
  };

  const transferPurchasedToPantry = () => {
    const acquistati = shoppingList.filter((item) => item.spuntato);
    if (acquistati.length === 0) {
      showToast('Nessun articolo spuntato da trasferire!');
      return;
    }
    const nuovi = acquistati.map((item) => ({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      nome: item.nome,
      quantita: item.quantitaTotale,
      unita: item.unita,
      posizione: 'Dispensa',
      dataScadenza: null,
      barcodeAggiunto: false
    }));
    setPantry((prev) => [...prev, ...nuovi]);
    setShoppingList((prev) => prev.filter((item) => !item.spuntato));
    registraStorico(nuovi.map((n) => ({ nome: n.nome, quantita: n.quantita, unita: n.unita, tipo: 'acquisto' })));
    showToast(`${acquistati.length} prodotti trasferiti in dispensa!`);
  };

  // ---------- DISPENSA ----------

  const updatePantryQuantity = (id, delta) => {
    setPantry((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantita: Math.max(0, item.quantita + delta) } : item))
    );
  };

  const deletePantryItem = (id) => {
    setPantry((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddPantryItem = (e) => {
    e.preventDefault();
    if (!newPantryItem.nome.trim()) return;

    if (editingPantryId) {
      // Sto modificando un prodotto esistente
      setPantry((prev) =>
        prev.map((item) =>
          item.id === editingPantryId
            ? {
                ...item,
                nome: newPantryItem.nome,
                quantita: Number(newPantryItem.quantita) || 1,
                unita: newPantryItem.unita,
                posizione: newPantryItem.posizione,
                dataScadenza: newPantryItem.dataScadenza || null
              }
            : item
        )
      );
      showToast(`"${newPantryItem.nome}" aggiornato!`);
    } else {
      // Sto aggiungendo un prodotto nuovo
      setPantry((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          nome: newPantryItem.nome,
          quantita: Number(newPantryItem.quantita) || 1,
          unita: newPantryItem.unita,
          posizione: newPantryItem.posizione,
          dataScadenza: newPantryItem.dataScadenza || null,
          barcodeAggiunto: false
        }
      ]);
      registraStorico({
        nome: newPantryItem.nome,
        quantita: Number(newPantryItem.quantita) || 1,
        unita: newPantryItem.unita,
        tipo: 'acquisto'
      });
      showToast(`"${newPantryItem.nome}" aggiunto alla dispensa!`);
    }

    setNewPantryItem({ nome: '', quantita: 1, unita: 'pz', posizione: 'Frigo', dataScadenza: '' });
    setEditingPantryId(null);
    setIsAddPantryOpen(false);
  };

  const apriModificaPantry = (item) => {
    setNewPantryItem({
      nome: item.nome,
      quantita: item.quantita,
      unita: item.unita,
      posizione: item.posizione,
      dataScadenza: item.dataScadenza || ''
    });
    setEditingPantryId(item.id);
    setIsAddPantryOpen(true);
  };

  const filteredPantry = useMemo(() => {
    return pantry
      .filter((item) => {
        const matchSearch = item.nome.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = categoryFilter === 'Tutti' || item.posizione === categoryFilter;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        // I prodotti senza data di scadenza finiscono in fondo alla lista
        if (!a.dataScadenza && !b.dataScadenza) return 0;
        if (!a.dataScadenza) return 1;
        if (!b.dataScadenza) return -1;
        return new Date(a.dataScadenza) - new Date(b.dataScadenza);
      });
  }, [pantry, searchQuery, categoryFilter]);

  // Prodotti in scadenza entro 3 giorni (o già scaduti) — usati sia per il banner che per la notifica
  const prodottiInScadenza = useMemo(() => {
    return pantry.filter((item) => {
      if (!item.dataScadenza) return false;
      const diffDays = Math.ceil((new Date(item.dataScadenza) - OGGI) / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    });
  }, [pantry]);
  const expiringCount = prodottiInScadenza.length;

  const [bannerScadenzeChiuso, setBannerScadenzeChiuso] = useState(false);

  const toggleTempoEspanso = (recipeId) => {
    setExpandedRecipeTime((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }));
  };

  // ---------- STATISTICHE ----------

  const statistiche = useMemo(() => {
    const acquisti = storico.filter((s) => s.tipo === 'acquisto');
    const consumi = storico.filter((s) => s.tipo === 'consumo');
    const sprechi = storico.filter((s) => s.tipo === 'spreco');

    const raggruppaPerNome = (lista) => {
      const conteggio = {};
      lista.forEach((v) => {
        conteggio[v.nome] = (conteggio[v.nome] || 0) + 1;
      });
      return Object.entries(conteggio)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    const rimossiTotali = consumi.length + sprechi.length;
    const percentualeSpreco = rimossiTotali > 0 ? Math.round((sprechi.length / rimossiTotali) * 100) : 0;

    return {
      totaleAcquisti: acquisti.length,
      totaleConsumi: consumi.length,
      totaleSprechi: sprechi.length,
      percentualeSpreco,
      topAcquistati: raggruppaPerNome(acquisti),
      topSprecati: raggruppaPerNome(sprechi)
    };
  }, [storico]);

  // ---------- GESTIONE FORM NUOVA RICETTA ----------

  const aggiungiRigaIngrediente = () => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredienti: [...prev.ingredienti, { id: 'tmp' + Date.now(), nome: '', quantita: 1, unita: 'pz' }]
    }));
  };

  const rimuoviRigaIngrediente = (id) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredienti: prev.ingredienti.filter((ing) => ing.id !== id)
    }));
  };

  const aggiornaIngrediente = (id, campo, valore) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredienti: prev.ingredienti.map((ing) => (ing.id === id ? { ...ing, [campo]: valore } : ing))
    }));
  };

  const toggleCategoriaRicetta = (cat) => {
    setNewRecipe((prev) => ({
      ...prev,
      categoria: prev.categoria.includes(cat) ? prev.categoria.filter((c) => c !== cat) : [...prev.categoria, cat]
    }));
  };

  const handleAddRecipe = (e) => {
    e.preventDefault();
    if (!newRecipe.titolo.trim()) return;

    const ingredientiPuliti = newRecipe.ingredienti
      .filter((ing) => ing.nome.trim())
      .map((ing) => ({ ...ing, quantita: Number(ing.quantita) || 0 }));

    const tagDietaArray = newRecipe.tagDieta
      ? newRecipe.tagDieta.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    if (editingRecipeId) {
      // Sto modificando una ricetta esistente
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === editingRecipeId
            ? {
                ...r,
                titolo: newRecipe.titolo,
                ingredienti: ingredientiPuliti,
                preparazione: newRecipe.preparazione,
                porzioniBase: Number(newRecipe.porzioniBase) || 1,
                tempoPreparazioneMin: Number(newRecipe.tempoPreparazioneMin) || 0,
                tempoCotturaMin: Number(newRecipe.tempoCotturaMin) || 0,
                bonta: Number(newRecipe.bonta) || 0,
                prezzo: Number(newRecipe.prezzo) || 0,
                notePersonali: newRecipe.notePersonali,
                fonte: newRecipe.fonte,
                categoria: newRecipe.categoria,
                tagDieta: tagDietaArray,
                updatedAt: new Date().toISOString()
              }
            : r
        )
      );
      showToast(`Ricetta "${newRecipe.titolo}" aggiornata!`);
    } else {
      // Sto aggiungendo una ricetta nuova
      const ricettaFinale = {
        id: Date.now().toString(),
        titolo: newRecipe.titolo,
        ingredienti: ingredientiPuliti,
        preparazione: newRecipe.preparazione,
        porzioniBase: Number(newRecipe.porzioniBase) || 1,
        tempoPreparazioneMin: Number(newRecipe.tempoPreparazioneMin) || 0,
        tempoCotturaMin: Number(newRecipe.tempoCotturaMin) || 0,
        bonta: Number(newRecipe.bonta) || 0,
        prezzo: Number(newRecipe.prezzo) || 0,
        notePersonali: newRecipe.notePersonali,
        fonte: newRecipe.fonte,
        categoria: newRecipe.categoria,
        tagDieta: tagDietaArray,
        ultimaVoltaCucinata: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRecipes((prev) => [...prev, ricettaFinale]);
      showToast(`Ricetta "${ricettaFinale.titolo}" salvata!`);
    }

    setNewRecipe(RICETTA_VUOTA);
    setEditingRecipeId(null);
    setIsAddRecipeOpen(false);
  };

  const apriModificaRicetta = (recipe) => {
    setNewRecipe({
      titolo: recipe.titolo,
      ingredienti: recipe.ingredienti.length
        ? recipe.ingredienti.map((ing) => ({ ...ing }))
        : [{ id: 'tmp1', nome: '', quantita: 1, unita: 'pz' }],
      preparazione: recipe.preparazione,
      porzioniBase: recipe.porzioniBase,
      tempoPreparazioneMin: recipe.tempoPreparazioneMin,
      tempoCotturaMin: recipe.tempoCotturaMin,
      bonta: recipe.bonta,
      prezzo: recipe.prezzo,
      notePersonali: recipe.notePersonali,
      fonte: recipe.fonte,
      categoria: recipe.categoria,
      tagDieta: (recipe.tagDieta || []).join(', ')
    });
    setEditingRecipeId(recipe.id);
    setIsAddRecipeOpen(true);
  };

  const deleteRecipe = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    showToast('Ricetta eliminata.');
  };

  // ---------- IMPORTAZIONE RICETTA DA LINK ----------

  const eseguiImportazione = async ({ url, testoManuale }) => {
    setImportStato('caricando');
    setImportErroreMsg('');
    try {
      const res = await fetch('/.netlify/functions/importa-ricetta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testoManuale ? { testoManuale } : { url })
      });
      const dati = await res.json();

      if (dati.errore) {
        if (dati.suggerimento === 'incolla_testo') {
          setImportStato('chiediTesto');
        } else {
          setImportErroreMsg(dati.errore);
          setImportStato('errore');
        }
        return;
      }

      const r = dati.ricetta || {};
      const ingredientiImportati =
        Array.isArray(r.ingredienti) && r.ingredienti.length > 0
          ? r.ingredienti.map((ing, i) => ({
              id: 'imp' + i,
              nome: ing.nome || '',
              quantita: Number(ing.quantita) || 0,
              unita: ing.unita || 'pz'
            }))
          : [{ id: 'imp0', nome: '', quantita: 1, unita: 'pz' }];

      setNewRecipe({
        titolo: r.titolo || '',
        ingredienti: ingredientiImportati,
        preparazione: r.preparazione || '',
        porzioniBase: r.porzioniBase || 4,
        tempoPreparazioneMin: r.tempoPreparazioneMin || 0,
        tempoCotturaMin: r.tempoCotturaMin || 0,
        bonta: 3,
        prezzo: 1,
        notePersonali: '',
        fonte: url || '',
        categoria: Array.isArray(r.categoria) ? r.categoria : [],
        tagDieta: Array.isArray(r.tagDieta) ? r.tagDieta.join(', ') : ''
      });
      setEditingRecipeId(null);
      setIsImportOpen(false);
      setIsAddRecipeOpen(true);
      showToast('Ricetta importata — controllala prima di salvare!');
    } catch (err) {
      console.error('Errore importazione ricetta:', err);
      setImportErroreMsg('Errore di connessione con il server. Riprova.');
      setImportStato('errore');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-2 rounded-xl shadow-inner border border-emerald-500">
                <ChefHat className="h-7 w-7 text-emerald-100" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wide text-white flex items-center gap-2">
                  Dispensa <span className="text-xs bg-emerald-500 text-emerald-950 font-bold px-2 py-0.5 rounded-full uppercase">Casa</span>
                </h1>
                <p className="text-xs text-emerald-200">Gestione spesa, scorte e pasti intelligenti</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs font-medium">
              <div className="bg-emerald-800/60 border border-emerald-600/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-300" />
                <span>{pantry.length} Prodotti in Casa</span>
              </div>
              {expiringCount > 0 && (
                <div className="bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>{expiringCount} in scadenza</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-emerald-800/80 backdrop-blur-md border-t border-emerald-600/40">
          <div className="max-w-7xl mx-auto px-4 flex space-x-2 sm:space-x-6 overflow-x-auto scrollbar-none">
            {[
              { id: 'pantry', label: 'Dispensa & Frigo', icon: Refrigerator },
              { id: 'shopping', label: 'Lista Spesa', icon: ShoppingBag },
              { id: 'meals', label: 'Pianificatore Pasti', icon: Calendar },
              { id: 'recipes', label: 'Ricettario', icon: Sparkles },
              { id: 'stats', label: 'Statistiche', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-300 text-white bg-emerald-700/50 rounded-t-lg'
                    : 'border-transparent text-emerald-100 hover:text-white hover:bg-emerald-700/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ---------- TAB: DISPENSA ---------- */}
        {activeTab === 'pantry' && (
          <div className="space-y-6">
            {prodottiInScadenza.length > 0 && !bannerScadenzeChiuso && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-800">
                    {prodottiInScadenza.length} prodott{prodottiInScadenza.length === 1 ? 'o' : 'i'} in scadenza entro 3 giorni
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {prodottiInScadenza.map((p) => p.nome).join(', ')}
                  </p>
                </div>
                <button onClick={() => setBannerScadenzeChiuso(true)} className="text-amber-400 hover:text-amber-700 text-lg leading-none px-1 shrink-0">×</button>
              </div>
            )}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cerca prodotti in casa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {['Tutti', 'Frigo', 'Dispensa', 'Freezer'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      categoryFilter === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setEditingPantryId(null); setNewPantryItem({ nome: '', quantita: 1, unita: 'pz', posizione: 'Frigo', dataScadenza: '' }); setIsAddPantryOpen(true); }}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi Prodotto</span>
              </button>
            </div>

            {filteredPantry.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Refrigerator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">
                  {pantry.length === 0 ? 'La dispensa è vuota' : 'Nessun prodotto trovato'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {pantry.length === 0
                    ? 'Aggiungi il primo prodotto con il bottone qui sopra.'
                    : 'Prova a cambiare filtro o la ricerca.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredPantry.map((item) => {
                const expiry = getExpiryStatus(item.dataScadenza);
                return (
                  <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-1">
                        <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 truncate">
                          {item.posizione}
                        </span>
                        <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap ${expiry.color}`}>{expiry.label}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1 leading-tight">{item.nome}</h3>
                      <div className="flex items-center gap-1 sm:space-x-3 my-2 sm:my-3 bg-slate-50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-100 justify-between">
                        <div className="flex items-center gap-1 sm:space-x-2 w-full justify-between">
                          <button onClick={() => updatePantryQuantity(item.id, -1)} className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center text-sm shrink-0">-</button>
                          <span className="text-xs sm:text-sm font-bold text-slate-800 px-0.5 sm:px-1 truncate">{item.quantita} {item.unita}</span>
                          <button onClick={() => updatePantryQuantity(item.id, 1)} className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 flex items-center justify-center text-sm shrink-0">+</button>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-end gap-1 mt-1 sm:mt-2">
                      <button onClick={() => apriModificaPantry(item)} className="p-1 sm:p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Modifica">
                        <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button onClick={() => setPendingDelete({ tipo: 'pantry', id: item.id, nome: item.nome })} className="p-1 sm:p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Elimina/Consumato">
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------- TAB: LISTA SPESA ---------- */}
        {activeTab === 'shopping' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">La tua Lista Spesa</h2>
                <p className="text-xs text-slate-500">Generata dal piano pasti + articoli aggiunti a mano</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={transferPurchasedToPantry} className="flex-1 sm:flex-initial bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Trasferisci Acquistati in Dispensa</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2">
              <input
                type="text"
                placeholder="Aggiungi un articolo a mano..."
                value={nuovoArticoloSpesa}
                onChange={(e) => setNuovoArticoloSpesa(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManualShoppingItem()}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Qtà"
                  value={nuovoArticoloQuantita}
                  onChange={(e) => setNuovoArticoloQuantita(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addManualShoppingItem()}
                  className="w-20 px-2 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="unità"
                  value={nuovoArticoloUnita}
                  onChange={(e) => setNuovoArticoloUnita(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addManualShoppingItem()}
                  className="flex-1 min-w-0 px-2 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button onClick={addManualShoppingItem} className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-xs items-center justify-center gap-2 shrink-0">
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi</span>
                </button>
              </div>
              <button onClick={addManualShoppingItem} className="sm:hidden w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Aggiungi</span>
              </button>
            </div>

            <div className="space-y-4">
              {shoppingList.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">La lista è vuota!</p>
                  <p className="text-xs text-slate-400 mt-1">Genera la lista dal Pianificatore Pasti o aggiungi articoli a mano.</p>
                </div>
              )}

              {REPARTI_SUPERMERCATO.map((reparto) => {
                const itemsReparto = shoppingList.filter((item) => (item.reparto || 'Da assegnare') === reparto);
                if (itemsReparto.length === 0) return null;
                return (
                  <div key={reparto} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-600">{reparto}</span>
                      <span className="text-xs text-slate-400 font-medium">{itemsReparto.length} articoli</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {itemsReparto.map((item) => (
                        <div key={item.id} className={`p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition ${item.spuntato ? 'bg-slate-50/80' : ''}`}>
                          <div onClick={() => toggleShoppingCheck(item.id)} className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                            {item.spuntato ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold truncate ${item.spuntato ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.nome}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{item.quantitaTotale} {item.unita} · {item.origine === 'piano' ? 'dal piano pasti' : 'manuale'}</p>
                            </div>
                          </div>
                          <select
                            value={item.reparto || 'Da assegnare'}
                            onChange={(e) => updateShoppingItemReparto(item.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0"
                          >
                            {REPARTI_SUPERMERCATO.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <button onClick={() => setPendingDelete({ tipo: 'shopping', id: item.id, nome: item.nome })} className="text-slate-300 hover:text-red-500 p-1.5 transition shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------- TAB: PIANIFICATORE PASTI ---------- */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative z-10">
                <h2 className="text-xl font-black">Menu della Settimana</h2>
                <p className="text-xs text-emerald-200 mt-1">Scegli una ricetta per ogni pasto: le porzioni e la lista spesa si aggiornano da sole.</p>
              </div>
              <button onClick={generaListaSpesaDaPiano} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition relative z-10">
                <Sparkles className="w-4 h-4" />
                <span>Genera Lista Spesa dal Piano</span>
              </button>
              <ChefHat className="absolute -right-6 -bottom-6 w-36 h-36 text-emerald-800/40 pointer-events-none" />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Generazione automatica
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Seleziona i giorni da riempire: pranzo e cena verranno assegnati automaticamente (solo dove non hai già scelto tu una ricetta), preferendo quelle che non cucini da più tempo.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {GIORNI_SETTIMANA.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleGiornoAuto(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      giorniSelezionatiAuto[i]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <button
                onClick={generaPianoAutomatico}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Genera Pasti per i Giorni Selezionati</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {GIORNI_SETTIMANA.map((day, indiceGiorno) => {
                const data = dataDelGiorno(indiceGiorno);
                return (
                  <div key={day} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <span className="font-black text-sm text-emerald-700 tracking-wide uppercase">{day}</span>
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>

                    {['pranzo', 'cena'].map((pasto) => {
                      const entry = mealPlan.find((m) => m.data === data && m.pasto === pasto);
                      const recipe = entry ? getRecipeById(entry.recipeId) : null;
                      return (
                        <div key={pasto} className="mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100 last:mb-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                            <Flame className={`w-3.5 h-3.5 ${pasto === 'pranzo' ? 'text-amber-500' : 'text-indigo-500'}`} />
                            <span>{pasto.toUpperCase()}</span>
                          </div>

                          <select
                            value={entry ? entry.recipeId : ''}
                            onChange={(e) => setMealForSlot(indiceGiorno, pasto, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">Scegli una ricetta...</option>
                            {recipes.map((r) => {
                              const giorni = giorniDaOggi(r.ultimaVoltaCucinata);
                              const cucinataDiRecente = giorni !== null && giorni >= 0 && giorni <= 5;
                              return (
                                <option key={r.id} value={r.id}>
                                  {r.titolo}{cucinataDiRecente ? ` · fatta ${giorni === 0 ? 'oggi' : `${giorni}g fa`}` : ''}
                                </option>
                              );
                            })}
                          </select>

                          {entry && recipe && (
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Users className="w-3.5 h-3.5" />
                                <button onClick={() => updatePorzioni(entry.id, -1)} className="w-5 h-5 bg-white rounded border border-slate-200 flex items-center justify-center">-</button>
                                <span className="font-semibold text-slate-700">{entry.porzioniScelte}</span>
                                <button onClick={() => updatePorzioni(entry.id, 1)} className="w-5 h-5 bg-white rounded border border-slate-200 flex items-center justify-center">+</button>
                              </div>
                              <button onClick={() => removeMeal(entry.id)} className="text-slate-300 hover:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------- TAB: RICETTARIO ---------- */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h2 className="text-xl font-black">Il tuo Ricettario</h2>
                </div>
                <p className="text-xs text-emerald-100">Clicca sul tempo per vedere preparazione e cottura separate.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>{recipes.length} ricette salvate</span>
                </div>
                <button
                  onClick={() => { setIsImportOpen(true); setImportStato('inserisci'); setImportUrl(''); setImportTestoManuale(''); setImportErroreMsg(''); }}
                  className="bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition border border-white/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Importa da link</span>
                </button>
                <button
                  onClick={() => { setEditingRecipeId(null); setNewRecipe(RICETTA_VUOTA); setIsAddRecipeOpen(true); }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuova Ricetta</span>
                </button>
              </div>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">Nessuna ricetta ancora</h3>
                <p className="text-xs text-slate-400 mt-1">Crea la tua prima ricetta con il bottone "Nuova Ricetta" qui sopra.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => {
                const tempoTotale = recipe.tempoPreparazioneMin + recipe.tempoCotturaMin;
                const espanso = !!expandedRecipeTime[recipe.id];
                return (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedRecipeId(recipe.id)}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-emerald-200 transition"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleTempoEspanso(recipe.id); }}
                          className="flex items-center gap-1 hover:text-emerald-700 transition"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {tempoTotale} min totali
                          {espanso ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" />{recipe.bonta}/5</span>
                          <span className="flex items-center gap-0.5"><Euro className="w-3 h-3 text-emerald-500" />{recipe.prezzo}/5</span>
                        </div>
                      </div>

                      {espanso && (
                        <div className="text-[11px] text-slate-500 mb-2 flex gap-3 bg-slate-50 rounded-lg px-2 py-1.5">
                          <span>Preparazione: {recipe.tempoPreparazioneMin} min</span>
                          <span>Cottura: {recipe.tempoCotturaMin} min</span>
                        </div>
                      )}

                      <h3 className="text-base font-bold text-slate-800 mb-1">{recipe.titolo}</h3>
                      <p className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {recipe.ultimaVoltaCucinata
                          ? (() => {
                              const g = giorniDaOggi(recipe.ultimaVoltaCucinata);
                              if (g === 0) return 'Cucinata oggi';
                              if (g === 1) return 'Cucinata ieri';
                              return `Cucinata ${g} giorni fa`;
                            })()
                          : 'Mai cucinata'}
                      </p>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-3">
                        {recipe.preparazione}
                      </p>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Ingredienti (per {recipe.porzioniBase} persone):
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.ingredienti.slice(0, 4).map((ing) => (
                            <span key={ing.id} className="bg-emerald-50 text-emerald-800 text-xs px-2 py-1 rounded-lg border border-emerald-200 font-medium">
                              {ing.nome} · {ing.quantita}{ing.unita}
                            </span>
                          ))}
                          {recipe.ingredienti.length > 4 && (
                            <span className="text-xs text-slate-400 px-2 py-1">+{recipe.ingredienti.length - 4} altri</span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-emerald-700 mt-3 flex items-center gap-1">
                        Apri ricetta completa <ChevronDown className="w-3 h-3 -rotate-90" />
                      </p>
                    </div>
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => apriModificaRicetta(recipe)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition" title="Modifica ricetta">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setPendingDelete({ tipo: 'recipe', id: recipe.id, nome: recipe.titolo })} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition" title="Elimina ricetta">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* ---------- TAB: STATISTICHE ---------- */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Statistiche
              </h2>
              <p className="text-xs text-slate-300 mt-1">Cosa entra ed esce dalla tua dispensa nel tempo.</p>
            </div>

            {storico.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">Ancora nessun dato</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Le statistiche si popolano man mano che aggiungi prodotti alla dispensa (a mano o dalla spesa) e li elimini una volta consumati.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <p className="text-2xl font-black text-slate-800">{statistiche.totaleAcquisti}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Prodotti acquistati</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <p className="text-2xl font-black text-emerald-600">{statistiche.totaleConsumi}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Consumati</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <p className="text-2xl font-black text-red-500">{statistiche.totaleSprechi}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sprecati (scaduti)</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <p className="text-2xl font-black text-amber-600">{statistiche.percentualeSpreco}%</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tasso di spreco</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Prodotti più acquistati</h3>
                    {statistiche.topAcquistati.length === 0 ? (
                      <p className="text-xs text-slate-400">Nessun acquisto registrato ancora.</p>
                    ) : (
                      <div className="space-y-2">
                        {statistiche.topAcquistati.map((p) => (
                          <div key={p.nome}>
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                              <span className="truncate">{p.nome}</span>
                              <span className="font-semibold">{p.count}×</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(p.count / statistiche.topAcquistati[0].count) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Prodotti sprecati più spesso</h3>
                    {statistiche.topSprecati.length === 0 ? (
                      <p className="text-xs text-slate-400">Nessuno spreco registrato — ottimo lavoro!</p>
                    ) : (
                      <div className="space-y-2">
                        {statistiche.topSprecati.map((p) => (
                          <div key={p.nome}>
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                              <span className="truncate">{p.nome}</span>
                              <span className="font-semibold">{p.count}×</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-400 rounded-full"
                                style={{ width: `${(p.count / statistiche.topSprecati[0].count) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ---------- MODALE: AGGIUNGI PRODOTTO IN DISPENSA ---------- */}
      {isAddPantryOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingPantryId ? 'Modifica Prodotto' : 'Aggiungi Prodotto in Casa'}</h3>
            <form onSubmit={handleAddPantryItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Prodotto</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Es. Yogurt, Uova, Pasta..."
                  value={newPantryItem.nome}
                  onChange={(e) => setNewPantryItem({ ...newPantryItem, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Posizione</label>
                  <select
                    value={newPantryItem.posizione}
                    onChange={(e) => setNewPantryItem({ ...newPantryItem, posizione: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Frigo">Frigo</option>
                    <option value="Dispensa">Dispensa</option>
                    <option value="Freezer">Freezer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Data Scadenza</label>
                  <input
                    type="date"
                    value={newPantryItem.dataScadenza}
                    onChange={(e) => setNewPantryItem({ ...newPantryItem, dataScadenza: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quantità</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={newPantryItem.quantita}
                    onChange={(e) => setNewPantryItem({ ...newPantryItem, quantita: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unità di Misura</label>
                  <input
                    type="text"
                    placeholder="pz, l, g, kg..."
                    value={newPantryItem.unita}
                    onChange={(e) => setNewPantryItem({ ...newPantryItem, unita: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddPantryOpen(false); setEditingPantryId(null); setNewPantryItem({ nome: '', quantita: 1, unita: 'pz', posizione: 'Frigo', dataScadenza: '' }); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
                >
                  {editingPantryId ? 'Salva Modifiche' : 'Salva Prodotto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- MODALE: IMPORTA RICETTA DA LINK ---------- */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-slate-800">Importa ricetta da link</h3>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none px-1">×</button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Incolla un link Instagram o TikTok con una ricetta.</p>

            {importStato === 'inserisci' && (
              <div className="space-y-3">
                <input
                  type="text"
                  autoFocus
                  placeholder="https://www.tiktok.com/... oppure instagram.com/..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => eseguiImportazione({ url: importUrl })}
                  disabled={!importUrl.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition"
                >
                  Importa
                </button>
                <button
                  onClick={() => setImportStato('chiediTesto')}
                  className="w-full text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Preferisco incollare il testo a mano
                </button>
              </div>
            )}

            {importStato === 'caricando' && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Analizzo il contenuto, un momento...</p>
              </div>
            )}

            {importStato === 'errore' && (
              <div className="text-center py-4">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-4">{importErroreMsg}</p>
                <button
                  onClick={() => setImportStato('inserisci')}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition mr-2"
                >
                  Riprova
                </button>
                <button
                  onClick={() => setImportStato('chiediTesto')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Incolla testo a mano
                </button>
              </div>
            )}

            {importStato === 'chiediTesto' && (
              <div className="space-y-3">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  Copia la didascalia del post (o scrivi tu la ricetta) e incollala qui sotto.
                </p>
                <textarea
                  rows="6"
                  autoFocus
                  placeholder="Incolla qui il testo della ricetta..."
                  value={importTestoManuale}
                  onChange={(e) => setImportTestoManuale(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => eseguiImportazione({ testoManuale: importTestoManuale })}
                  disabled={!importTestoManuale.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition"
                >
                  Estrai ricetta da questo testo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- MODALE: NUOVA RICETTA ---------- */}
      {isAddRecipeOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-100 my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingRecipeId ? 'Modifica Ricetta' : 'Nuova Ricetta'}</h3>
            <form onSubmit={handleAddRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Titolo</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Es. Pasta al pesto"
                  value={newRecipe.titolo}
                  onChange={(e) => setNewRecipe({ ...newRecipe, titolo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Porzioni base</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={newRecipe.porzioniBase}
                    onChange={(e) => setNewRecipe({ ...newRecipe, porzioniBase: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prep. (min)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={newRecipe.tempoPreparazioneMin}
                    onChange={(e) => setNewRecipe({ ...newRecipe, tempoPreparazioneMin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cottura (min)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={newRecipe.tempoCotturaMin}
                    onChange={(e) => setNewRecipe({ ...newRecipe, tempoCotturaMin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bontà (1-5)</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max="5"
                    value={newRecipe.bonta}
                    onChange={(e) => setNewRecipe({ ...newRecipe, bonta: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prezzo (1-5)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="5"
                    value={newRecipe.prezzo}
                    onChange={(e) => setNewRecipe({ ...newRecipe, prezzo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {['colazione', 'pranzo', 'cena', 'spuntino'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategoriaRicetta(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                        newRecipe.categoria.includes(cat)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">Ingredienti</label>
                  <button
                    type="button"
                    onClick={aggiungiRigaIngrediente}
                    className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Aggiungi ingrediente
                  </button>
                </div>
                <div className="space-y-2">
                  {newRecipe.ingredienti.map((ing) => (
                    <div key={ing.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nome ingrediente"
                        value={ing.nome}
                        onChange={(e) => aggiornaIngrediente(ing.id, 'nome', e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="number"
                    step="any"
                        min="0"
                        placeholder="Qtà"
                        value={ing.quantita}
                        onChange={(e) => aggiornaIngrediente(ing.id, 'quantita', e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="unità"
                        value={ing.unita}
                        onChange={(e) => aggiornaIngrediente(ing.id, 'unita', e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {newRecipe.ingredienti.length > 1 && (
                        <button
                          type="button"
                          onClick={() => rimuoviRigaIngrediente(ing.id)}
                          className="text-slate-300 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Preparazione</label>
                <textarea
                  rows="3"
                  placeholder="Descrivi i passaggi..."
                  value={newRecipe.preparazione}
                  onChange={(e) => setNewRecipe({ ...newRecipe, preparazione: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tag dieta (separati da virgola)</label>
                  <input
                    type="text"
                    placeholder="vegetariano, senza glutine"
                    value={newRecipe.tagDieta}
                    onChange={(e) => setNewRecipe({ ...newRecipe, tagDieta: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fonte (link video, opzionale)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newRecipe.fonte}
                    onChange={(e) => setNewRecipe({ ...newRecipe, fonte: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Note personali</label>
                <input
                  type="text"
                  placeholder="Note libere..."
                  value={newRecipe.notePersonali}
                  onChange={(e) => setNewRecipe({ ...newRecipe, notePersonali: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddRecipeOpen(false); setEditingRecipeId(null); setNewRecipe(RICETTA_VUOTA); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
                >
                  {editingRecipeId ? 'Salva Modifiche' : 'Salva Ricetta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- MODALE: DETTAGLIO RICETTA COMPLETO ---------- */}
      {selectedRecipeId && (() => {
        const recipe = getRecipeById(selectedRecipeId);
        if (!recipe) return null;
        const g = giorniDaOggi(recipe.ultimaVoltaCucinata);
        return (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedRecipeId(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 border border-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{recipe.titolo}</h2>
                    <p className="text-xs text-emerald-100 mt-1">
                      {recipe.ultimaVoltaCucinata
                        ? g === 0 ? 'Cucinata oggi' : g === 1 ? 'Cucinata ieri' : `Cucinata ${g} giorni fa`
                        : 'Mai cucinata'}
                    </p>
                  </div>
                  <button onClick={() => setSelectedRecipeId(null)} className="text-white/70 hover:text-white text-2xl leading-none px-1">×</button>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                  <span className="bg-white/15 px-3 py-1.5 rounded-lg flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{recipe.tempoPreparazioneMin}min prep. + {recipe.tempoCotturaMin}min cottura</span>
                  <span className="bg-white/15 px-3 py-1.5 rounded-lg flex items-center gap-1"><Users className="w-3.5 h-3.5" />{recipe.porzioniBase} porzioni base</span>
                  <span className="bg-white/15 px-3 py-1.5 rounded-lg flex items-center gap-1"><Star className="w-3.5 h-3.5" />{recipe.bonta}/5</span>
                  <span className="bg-white/15 px-3 py-1.5 rounded-lg flex items-center gap-1"><Euro className="w-3.5 h-3.5" />{recipe.prezzo}/5</span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {(recipe.categoria.length > 0 || recipe.tagDieta.length > 0) && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.categoria.map((c) => (
                      <span key={c} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-1 rounded-lg capitalize font-medium">{c}</span>
                    ))}
                    {recipe.tagDieta.map((t) => (
                      <span key={t} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-1 rounded-lg capitalize font-medium">{t}</span>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Ingredienti (per {recipe.porzioniBase} persone)
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {recipe.ingredienti.map((ing) => (
                      <span key={ing.id} className="bg-slate-50 border border-slate-100 text-slate-700 text-xs px-2 py-1.5 rounded-lg">
                        {ing.nome} · {ing.quantita}{ing.unita}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preparazione</h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{recipe.preparazione}</p>
                </div>

                {recipe.notePersonali && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Note personali</h4>
                    <p className="text-sm text-slate-600 italic">{recipe.notePersonali}</p>
                  </div>
                )}

                {recipe.fonte && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fonte</h4>
                    <p className="text-sm text-emerald-700 break-all">{recipe.fonte}</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => { apriModificaRicetta(recipe); setSelectedRecipeId(null); }}
                  className="px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Modifica
                </button>
                <button
                  onClick={() => setSelectedRecipeId(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ---------- MODALE: CONFERMA ELIMINAZIONE ---------- */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Confermi l'eliminazione?</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Stai per eliminare <span className="font-semibold text-slate-700">"{pendingDelete.nome}"</span>. Questa azione non può essere annullata.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Annulla
              </button>
              <button
                onClick={confermaEliminazione}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
