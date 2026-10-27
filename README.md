# Dispensa Casa

App web per gestire dispensa e frigo, lista della spesa, pianificazione dei pasti e ricettario.
Funziona nel browser (anche da iPhone), i dati restano salvati sul dispositivo (`localStorage`).

## Comandi

```
npm install      # una volta sola, scarica le dipendenze
npm run dev      # avvia l'app in locale (http://localhost:5173)
npm run build    # crea la versione da pubblicare nella cartella dist
```

Le funzioni Netlify (importazione da link e "Cosa cucino?") **non girano con `npm run dev`**:
funzionano solo sul sito pubblicato.

## Pubblicazione

Ogni `git push` sul ramo `main` ripubblica il sito su Netlify. Ogni deploy consuma crediti del
piano gratuito: conviene raggruppare più modifiche in un solo push.
Su Netlify deve esistere la variabile d'ambiente `GEMINI_API_KEY`.

## Struttura

```
src/
  App.jsx                   scheletro dell'app: sezioni, finestre condivise, messaggi
  main.jsx                  avvio dell'app e riparazione dei dati salvati
  types.js                  descrizione dei dati (ricette, pasti, spesa, dispensa, storico)
  views/                    una schermata per sezione
    PantryView.jsx          Dispensa & Frigo (+ "Cosa cucino?")
    ShoppingView.jsx        Lista Spesa
    MealPlanView.jsx        Pianificatore Pasti
    RecipesView.jsx         Ricettario
    StatsView.jsx           Statistiche
  components/               finestre e pezzi riutilizzabili
  hooks/                    logica e dati, senza interfaccia
    usePersistentState.js   come useState ma salvato su localStorage
    usePantry.js  useShoppingList.js  useRecipes.js  useMealPlan.js  useStorico.js
    useRecipeForm.js        stato del form Nuova/Modifica ricetta
  utils/                    funzioni pure (date, spesa, ricette, piano pasti, statistiche, storage)
netlify/functions/          funzioni serverless
  importa-ricetta.js        estrae una ricetta da un link Instagram/TikTok con Gemini
  suggerisci-ricetta.js     propone una ricetta in base alla dispensa con Gemini
  lib/gemini.js             nome del modello Gemini e chiamata comune
```

## Cose da sapere

- **Date**: sono sempre stringhe `AAAA-MM-GG` e si leggono/scrivono solo con `src/utils/date.js`
  (usare `new Date('2026-10-21')` o `toISOString()` sfasa di un giorno in Italia).
- **Identificativi**: si creano solo con `nuovoId()` (`src/utils/id.js`), mai con `Date.now()` da solo.
- **Modello Gemini**: se Google lo ritira, si cambia in `netlify/functions/lib/gemini.js`.
- **Chiavi dei dati salvati**: finiscono con `:v1` (`src/utils/storage.js`); se si cambia in modo
  importante la struttura dei dati, passare a `:v2` e scrivere una migrazione in `src/utils/migrazioni.js`.
