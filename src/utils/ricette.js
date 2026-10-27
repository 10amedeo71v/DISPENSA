// ---------- LOGICA DEL RICETTARIO (funzioni pure, senza React) ----------
import { OGGI, giorniDaOggi } from './date.js';

// Trasforma i campi del form "Nuova/Modifica ricetta" (dove i numeri sono spesso
// stringhe e i tag sono un testo separato da virgole) in dati puliti e coerenti.
export function normalizzaCampiRicetta(form) {
  const tagDieta = Array.isArray(form.tagDieta) ? form.tagDieta : String(form.tagDieta ?? '').split(',');
  return {
    titolo: String(form.titolo ?? '').trim(),
    ingredienti: (form.ingredienti ?? [])
      .filter((ing) => String(ing.nome ?? '').trim())
      .map((ing) => ({ ...ing, nome: String(ing.nome).trim(), quantita: Number(ing.quantita) || 0 })),
    preparazione: form.preparazione ?? '',
    porzioniBase: Number(form.porzioniBase) || 1,
    tempoPreparazioneMin: Number(form.tempoPreparazioneMin) || 0,
    tempoCotturaMin: Number(form.tempoCotturaMin) || 0,
    bonta: Number(form.bonta) || 0,
    prezzo: Number(form.prezzo) || 0,
    notePersonali: form.notePersonali ?? '',
    fonte: form.fonte ?? '',
    categoria: Array.isArray(form.categoria) ? form.categoria : [],
    tagDieta: tagDieta.map((t) => String(t).trim()).filter(Boolean)
  };
}

// Più tempo è passato dall'ultima volta che una ricetta è stata cucinata, più "peso" ha
// nella scelta casuale (quindi più probabile) — le ricette recenti non sono escluse, solo
// meno probabili. Le ricette mai cucinate hanno il peso massimo.
export function pesoRicetta(recipe, oggi = OGGI) {
  const g = giorniDaOggi(recipe.ultimaVoltaCucinata, oggi);
  if (g === null) return 10;
  return Math.min(10, Math.max(1, g));
}

// Sceglie una ricetta a caso dal "pool", favorendo quelle cucinate meno di recente.
// Evita quelle già scelte in questo giro, a meno che non ne restino altre.
// `random` si può sostituire nei test per avere risultati prevedibili.
export function sceglieRicettaPesata(pool, esclusiInQuestoGiro, random = Math.random, oggi = OGGI) {
  let candidati = pool.filter((r) => !esclusiInQuestoGiro.has(r.id));
  if (candidati.length === 0) candidati = pool;
  if (candidati.length === 0) return null;
  const pesi = candidati.map((r) => pesoRicetta(r, oggi));
  const totale = pesi.reduce((a, b) => a + b, 0);
  let r = random() * totale;
  for (let i = 0; i < candidati.length; i++) {
    r -= pesi[i];
    if (r <= 0) return candidati[i];
  }
  return candidati[candidati.length - 1];
}

// Trasforma la ricetta proposta dall'AI ("Cosa cucino?") nei campi del form Nuova ricetta,
// da controllare e salvare. Gli ingredienti segnalati "da comprare" finiscono nelle note.
export function bozzaDaSuggerimento(r) {
  const daComprare = r.ingredienti.filter((ing) => !ing.inDispensa).map((ing) => ing.nome);
  return {
    titolo: r.titolo,
    ingredienti: r.ingredienti.map((ing, i) => ({ id: 'sug' + i, nome: ing.nome, quantita: ing.quantita, unita: ing.unita })),
    preparazione: r.preparazione,
    porzioniBase: r.porzioniBase,
    tempoPreparazioneMin: r.tempoPreparazioneMin,
    tempoCotturaMin: r.tempoCotturaMin,
    bonta: 3,
    prezzo: 1,
    notePersonali: daComprare.length > 0 ? `Da comprare: ${daComprare.join(', ')}` : '',
    fonte: "Suggerita dall'AI",
    categoria: r.categoria,
    tagDieta: r.tagDieta.join(', ')
  };
}

// Campi di una ricetta "vuota", per il form Nuova ricetta. È una funzione (non una costante)
// così ogni apertura del form parte da un oggetto nuovo.
export function ricettaVuota() {
  return {
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
}

// Dai dati di una ricetta salvata ai campi del form "Modifica ricetta"
export function formDaRicetta(recipe) {
  return {
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
  };
}

// Dalla ricetta estratta dall'AI (importazione da link) ai campi del form, da controllare e salvare.
// `url` è il link di origine (finisce nel campo "fonte"). Tollera risposte incomplete.
export function bozzaDaImportazione(r, url) {
  const ingredienti =
    Array.isArray(r.ingredienti) && r.ingredienti.length > 0
      ? r.ingredienti.map((ing, i) => ({
          id: 'imp' + i,
          nome: ing.nome || '',
          quantita: Number(ing.quantita) || 0,
          unita: ing.unita || 'pz'
        }))
      : [{ id: 'imp0', nome: '', quantita: 1, unita: 'pz' }];
  return {
    titolo: r.titolo || '',
    ingredienti,
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
  };
}
