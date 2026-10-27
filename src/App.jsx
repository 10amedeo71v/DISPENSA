import React, { useState } from 'react';
import RecipeDetailModal from './components/RecipeDetailModal.jsx';
import { usePantry } from './hooks/usePantry.js';
import { useShoppingList } from './hooks/useShoppingList.js';
import { useRecipes } from './hooks/useRecipes.js';
import { useMealPlan } from './hooks/useMealPlan.js';
import { useStorico } from './hooks/useStorico.js';
import StatsView from './views/StatsView.jsx';
import PantryView from './views/PantryView.jsx';
import MealPlanView from './views/MealPlanView.jsx';
import RecipesView from './views/RecipesView.jsx';
import RecipeFormModal from './components/RecipeFormModal.jsx';
import ImportRecipeModal from './components/ImportRecipeModal.jsx';
import ConfirmDeleteModal from './components/ConfirmDeleteModal.jsx';
import { useRecipeForm } from './hooks/useRecipeForm.js';
import ShoppingView from './views/ShoppingView.jsx';
import { bozzaDaSuggerimento } from './utils/ricette.js';
import { aggregaIngredientiDaPiano } from './utils/spesa.js';
import { dataDelGiorno, giorniDaOggi } from './utils/date.js';
import { ShoppingBag, Refrigerator, Calendar, CheckCircle, AlertTriangle, ChefHat, Sparkles, Package, TrendingUp } from 'lucide-react';

// Sezioni dell'app. `label` è per la barra in alto (schermi larghi), `labelCorta`
// per la barra in basso (telefono), dove c'è poco spazio per riga.
const SEZIONI = [
  { id: 'pantry', label: 'Dispensa & Frigo', labelCorta: 'Dispensa', icon: Refrigerator },
  { id: 'shopping', label: 'Lista Spesa', labelCorta: 'Spesa', icon: ShoppingBag },
  { id: 'meals', label: 'Pianificatore Pasti', labelCorta: 'Pasti', icon: Calendar },
  { id: 'recipes', label: 'Ricettario', labelCorta: 'Ricette', icon: Sparkles },
  { id: 'stats', label: 'Statistiche', labelCorta: 'Statistiche', icon: TrendingUp }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('meals'); // pantry, shopping, meals, recipes

  // Stato dell'avviso "salvataggio non riuscito": ricordiamo quali chiavi
  // hanno fallito e mostriamo il banner finché tutte tornano a salvare bene.
  const chiaviSalvataggioFallite = React.useRef(new Set());
  const [erroreSalvataggio, setErroreSalvataggio] = useState(false);
  const segnalaSalvataggio = (key, riuscito) => {
    if (riuscito) chiaviSalvataggioFallite.current.delete(key);
    else chiaviSalvataggioFallite.current.add(key);
    setErroreSalvataggio(chiaviSalvataggioFallite.current.size > 0);
  };

  // Storico movimenti dispensa (acquisti, consumi, sprechi) + statistiche calcolate
  const { registraStorico, statistiche } = useStorico({ segnalaSalvataggio });

  // Ricettario: dati + operazioni (aggiungi, modifica, rimuovi, segna come cucinata)
  const { recipes, getRecipeById, aggiungiRicetta, modificaRicetta, rimuoviRicetta, segnaCucinata } = useRecipes({ segnalaSalvataggio });

  // Piano pasti: dati + operazioni (imposta pasto, porzioni, rimuovi, svuota giorno)
  const {
    mealPlan,
    trovaPasto,
    giornoHaPasti,
    contaPastiConRicetta,
    impostaPasto,
    cambiaPorzioni,
    rimuoviPasto,
    svuotaGiorno,
    rimuoviPastiConRicetta
  } = useMealPlan({ segnalaSalvataggio });

  // Lista della spesa: dati + operazioni (genera dal piano, aggiungi, spunta, reparto, rimuovi)
  const {
    shoppingList,
    articoliSpuntati,
    sostituisciArticoliDaPiano,
    aggiungiArticoloManuale,
    spuntaArticolo,
    cambiaReparto,
    rimuoviArticolo,
    rimuoviSpuntati
  } = useShoppingList({ segnalaSalvataggio });

  // Dispensa: dati + operazioni (aggiungi, modifica, quantità, rimuovi, scadenze)
  const {
    pantry,
    aggiungiProdotto,
    aggiungiProdotti,
    modificaProdotto,
    cambiaQuantita,
    rimuoviProdotto,
    prodottiInScadenza
  } = usePantry({ segnalaSalvataggio, registraStorico });

  const [selectedRecipeId, setSelectedRecipeId] = useState(null); // ricetta aperta in vista dettaglio
  const [pendingDelete, setPendingDelete] = useState(null); // { tipo: 'pantry'|'recipe'|'giorno', id, nome }

  // Form "Nuova/Modifica ricetta" (si apre da più punti) e finestra di importazione da link
  const recipeForm = useRecipeForm();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ---------- HELPERS ----------

  // Ricalcolo automatico quantità ingredienti in base alle porzioni scelte
  // ---------- GESTIONE PIANO PASTI ----------

  // Sceglie la ricetta di uno slot (o lo svuota se `recipeId` è vuoto)
  const setMealForSlot = (indiceGiorno, pasto, recipeId) => {
    const data = dataDelGiorno(indiceGiorno);
    impostaPasto(data, pasto, recipeId);

    // Aggiorniamo "ultimaVoltaCucinata" sulla ricetta, solo se la data pianificata
    // non è nel futuro (se stai pianificando per tra 3 giorni, non l'hai ancora cucinata!)
    if (recipeId && giorniDaOggi(data) >= 0) segnaCucinata(recipeId, data);
  };

  // Genera la lista della spesa aggregando gli ingredienti di tutti i pasti pianificati
  const generaListaSpesaDaPiano = () => {
    sostituisciArticoliDaPiano(aggregaIngredientiDaPiano(mealPlan, getRecipeById));
    showToast('Lista della spesa generata dal piano pasti!');
    setActiveTab('shopping');
  };

  // Rimuove un articolo (chiamato dallo swipe)
  const removeShoppingItem = (id) => {
    const item = rimuoviArticolo(id);
    if (item) showToast(`"${item.nome}" rimosso dalla lista.`);
  };

  // Esegue davvero l'eliminazione dopo che l'utente ha confermato nella modale
  // Quante volte la ricetta che sto per eliminare è nel piano pasti (per avvisare l'utente)
  const pastiPianificatiConRicetta =
    pendingDelete && pendingDelete.tipo === 'recipe'
      ? contaPastiConRicetta(pendingDelete.id)
      : 0;

  const confermaEliminazione = () => {
    if (!pendingDelete) return;
    const { tipo, id, nome } = pendingDelete;
    if (tipo === 'pantry') {
      rimuoviProdotto(id);
      showToast(`"${nome}" eliminato dalla dispensa.`);
    } else if (tipo === 'recipe') {
      rimuoviRicetta(id);
      // I pasti pianificati con questa ricetta non avrebbero più senso: li svuotiamo.
      rimuoviPastiConRicetta(id);
      if (selectedRecipeId === id) setSelectedRecipeId(null);
      showToast(`Ricetta "${nome}" eliminata.`);
    } else if (tipo === 'giorno') {
      // id qui è la data (es. '2026-09-24'): svuota sia pranzo che cena di quel giorno
      svuotaGiorno(id);
      showToast(`Pranzo e cena di ${nome} svuotati.`);
    }
    setPendingDelete(null);
  };

  const transferPurchasedToPantry = () => {
    if (articoliSpuntati.length === 0) {
      showToast('Nessun articolo spuntato da trasferire!');
      return;
    }
    aggiungiProdotti(
      articoliSpuntati.map((item) => ({
        nome: item.nome,
        quantita: item.quantitaTotale,
        unita: item.unita,
        posizione: 'Dispensa',
        dataScadenza: null
      }))
    );
    rimuoviSpuntati();
    showToast(`${articoliSpuntati.length} prodotti trasferiti in dispensa!`);
  };

  // ---------- RICETTE ----------

  // Salva il form Nuova/Modifica ricetta
  const handleAddRecipe = (e) => {
    e.preventDefault();
    if (!recipeForm.form.titolo.trim()) return;

    if (recipeForm.editingId) {
      // Sto modificando una ricetta esistente
      const salvata = modificaRicetta(recipeForm.editingId, recipeForm.form);
      showToast(`Ricetta "${salvata.titolo}" aggiornata!`);
    } else {
      // Sto aggiungendo una ricetta nuova
      const creata = aggiungiRicetta(recipeForm.form);
      showToast(`Ricetta "${creata.titolo}" salvata!`);
    }
    recipeForm.chiudi();
  };

  // La ricetta estratta dall'importazione da link apre il form già compilato
  const apriFormDaImportazione = (bozza) => {
    setIsImportOpen(false);
    recipeForm.apriNuova(bozza);
    showToast('Ricetta importata — controllala prima di salvare!');
  };

  // Numero di prodotti scaduti o in scadenza, mostrato nell'intestazione
  const expiringCount = prodottiInScadenza.length;

  // Apre il form "Nuova ricetta" già compilato con la proposta di "Cosa cucino?"
  const apriFormDaSuggerimento = (ricettaSuggerita) => {
    recipeForm.apriNuova(bozzaDaSuggerimento(ricettaSuggerita));
    showToast('Ricetta pronta — controllala prima di salvare!');
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

        {/* Barra sezioni in alto: solo schermi larghi (su telefono c'è quella in basso) */}
        <div className="hidden md:block bg-emerald-800/80 backdrop-blur-md border-t border-emerald-600/40">
          <div className="max-w-7xl mx-auto px-4 flex space-x-2 sm:space-x-6 overflow-x-auto scrollbar-none">
            {SEZIONI.map((tab) => (
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

      {erroreSalvataggio && (
        <div role="alert" className="bg-red-600 text-white text-sm px-4 py-2.5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <span className="font-bold">Salvataggio non riuscito.</span> Le ultime modifiche non vengono memorizzate su questo dispositivo e potrebbero andare perse alla chiusura. Controlla di non essere in navigazione privata e che ci sia spazio libero.
          </span>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-5 left-4 right-4 md:left-auto md:right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-6">
        {/* ---------- TAB: DISPENSA ---------- */}
        {activeTab === 'pantry' && (
          <PantryView
            pantry={pantry}
            prodottiInScadenza={prodottiInScadenza}
            aggiungiProdotto={aggiungiProdotto}
            modificaProdotto={modificaProdotto}
            cambiaQuantita={cambiaQuantita}
            onRichiediEliminazione={(item) => setPendingDelete({ tipo: 'pantry', id: item.id, nome: item.nome })}
            onSalvaSuggerimento={apriFormDaSuggerimento}
            showToast={showToast}
          />
        )}

        {/* ---------- TAB: LISTA SPESA ---------- */}
        {activeTab === 'shopping' && (
          <ShoppingView
            shoppingList={shoppingList}
            spuntaArticolo={spuntaArticolo}
            cambiaReparto={cambiaReparto}
            removeShoppingItem={removeShoppingItem}
            aggiungiArticoloManuale={aggiungiArticoloManuale}
            transferPurchasedToPantry={transferPurchasedToPantry}
          />
        )}

        {/* ---------- TAB: PIANIFICATORE PASTI ---------- */}
        {activeTab === 'meals' && (
          <MealPlanView
            recipes={recipes}
            mealPlan={mealPlan}
            getRecipeById={getRecipeById}
            trovaPasto={trovaPasto}
            giornoHaPasti={giornoHaPasti}
            setMealForSlot={setMealForSlot}
            cambiaPorzioni={cambiaPorzioni}
            rimuoviPasto={rimuoviPasto}
            generaListaSpesaDaPiano={generaListaSpesaDaPiano}
            onRichiediSvuotaGiorno={(data, day) => setPendingDelete({ tipo: 'giorno', id: data, nome: day })}
            showToast={showToast}
          />
        )}

        {/* ---------- TAB: RICETTARIO ---------- */}
        {activeTab === 'recipes' && (
          <RecipesView
            recipes={recipes}
            onNuova={() => recipeForm.apriNuova()}
            onImporta={() => setIsImportOpen(true)}
            onApriDettaglio={setSelectedRecipeId}
            onModifica={recipeForm.apriModifica}
            onRichiediEliminazione={(recipe) => setPendingDelete({ tipo: 'recipe', id: recipe.id, nome: recipe.titolo })}
          />
        )}

        {/* ---------- TAB: STATISTICHE ---------- */}
        {activeTab === 'stats' && <StatsView statistiche={statistiche} />}
      </main>

      {/* Barra sezioni in basso: solo telefono. Tasti grandi, raggiungibili col pollice. */}
      <nav
        aria-label="Sezioni"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-emerald-900 border-t border-emerald-700 shadow-[0_-4px_12px_rgba(0,0,0,0.18)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex">
          {SEZIONI.map((tab) => {
            const attiva = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={attiva ? 'page' : undefined}
                className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[60px] pt-2 pb-1.5 text-[11px] font-medium border-t-2 transition-colors ${
                  attiva
                    ? 'border-emerald-300 text-white bg-emerald-800'
                    : 'border-transparent text-emerald-200 active:bg-emerald-800'
                }`}
              >
                <tab.icon className="w-6 h-6" />
                <span>{tab.labelCorta}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ---------- MODALE: DETTAGLIO RICETTA COMPLETO ---------- */}
      {selectedRecipeId && getRecipeById(selectedRecipeId) && (
        <RecipeDetailModal
          key={selectedRecipeId}
          recipe={getRecipeById(selectedRecipeId)}
          onClose={() => setSelectedRecipeId(null)}
          onEdit={(recipe) => { recipeForm.apriModifica(recipe); setSelectedRecipeId(null); }}
          onDelete={(recipe) => setPendingDelete({ tipo: 'recipe', id: recipe.id, nome: recipe.titolo })}
        />
      )}

      {/* ---------- MODALE: NUOVA/MODIFICA RICETTA ---------- */}
      {recipeForm.aperto && (
        <RecipeFormModal
          newRecipe={recipeForm.form}
          setNewRecipe={recipeForm.setForm}
          editingRecipeId={recipeForm.editingId}
          aggiungiRigaIngrediente={recipeForm.aggiungiRigaIngrediente}
          rimuoviRigaIngrediente={recipeForm.rimuoviRigaIngrediente}
          aggiornaIngrediente={recipeForm.aggiornaIngrediente}
          toggleCategoriaRicetta={recipeForm.toggleCategoriaRicetta}
          onSubmit={handleAddRecipe}
          onChiudi={recipeForm.chiudi}
        />
      )}

      {/* ---------- MODALE: IMPORTA RICETTA DA LINK ---------- */}
      {isImportOpen && (
        <ImportRecipeModal onClose={() => setIsImportOpen(false)} onRicettaEstratta={apriFormDaImportazione} />
      )}

      {/* ---------- MODALE: CONFERMA ELIMINAZIONE ---------- */}
      {pendingDelete && (
        <ConfirmDeleteModal
          pendingDelete={pendingDelete}
          pastiPianificatiConRicetta={pastiPianificatiConRicetta}
          onConferma={confermaEliminazione}
          onAnnulla={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
