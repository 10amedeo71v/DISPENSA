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
