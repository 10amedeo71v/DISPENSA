// Funzione serverless Netlify: riceve l'elenco dei prodotti in dispensa e chiede a
// Gemini di proporre UNA ricetta che li usi (dando priorità a quelli in scadenza).
//
// Richiede la variabile d'ambiente GEMINI_API_KEY impostata su Netlify
// (la stessa già usata da importa-ricetta).

import { chiediJsonAGemini } from './lib/gemini.js';

const MAX_PRODOTTI = 80; // oltre questa soglia tagliamo l'elenco per contenere i token
const MAX_TITOLI_DA_EVITARE = 10;

export default async (req) => {
  if (req.method !== 'POST') {
    return risposta({ errore: 'Metodo non permesso' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return risposta({ errore: 'Richiesta non valida' }, 400);
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return risposta(
      { errore: 'Chiave Gemini non configurata sul server (variabile GEMINI_API_KEY mancante su Netlify).' },
      500
    );
  }

  const dispensa = pulisciDispensa(body?.dispensa);
  if (dispensa.length === 0) {
    return risposta({ errore: 'Non ho trovato prodotti utilizzabili in dispensa (vuota, finiti o scaduti).' }, 400);
  }
  const evita = pulisciTitoli(body?.evita);

  try {
    const ricetta = await chiediRicettaAGemini({ dispensa, evita, apiKey: GEMINI_API_KEY });
    return risposta({ ricetta });
  } catch (err) {
    return risposta({ errore: err.message || 'Errore imprevisto' }, 500);
  }
};

function risposta(oggetto, status = 200) {
  return new Response(JSON.stringify(oggetto), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ---------- Pulizia dei dati in ingresso ----------

function pulisciDispensa(dispensa) {
  if (!Array.isArray(dispensa)) return [];
  return dispensa
    .map((p) => ({
      nome: String(p?.nome ?? '').trim().slice(0, 60),
      quantita: Number(p?.quantita),
      unita: String(p?.unita ?? '').trim().slice(0, 20),
      scadeTraGiorni: Number.isFinite(Number(p?.scadeTraGiorni)) && p?.scadeTraGiorni !== null ? Number(p.scadeTraGiorni) : null
    }))
    // Fuori i prodotti finiti e quelli già scaduti: non vanno proposti in ricetta.
    .filter((p) => p.nome && Number.isFinite(p.quantita) && p.quantita > 0)
    .filter((p) => p.scadeTraGiorni === null || p.scadeTraGiorni >= 0)
    .slice(0, MAX_PRODOTTI);
}

function pulisciTitoli(evita) {
  if (!Array.isArray(evita)) return [];
  return evita
    .map((t) => String(t ?? '').trim().slice(0, 100))
    .filter(Boolean)
    .slice(-MAX_TITOLI_DA_EVITARE);
}

// ---------- Chiamata a Gemini ----------

const ISTRUZIONI = `Sei uno chef che propone ricette casalinghe italiane partendo da ciò che c'è in casa.
Ti passo l'elenco dei prodotti disponibili in dispensa, con quantità e (se nota) i giorni alla scadenza.
Proponi UNA sola ricetta, semplice e realistica, che:
- usi soprattutto i prodotti disponibili, dando priorità a quelli che scadono prima;
- non richieda di ogni prodotto più della quantità disponibile: dimensiona le porzioni di conseguenza;
- dia per scontati sale, pepe, olio e acqua: puoi usarli anche se non sono in elenco, e per questi metti "inDispensa": true;
- se manca qualcosa di importante, limita gli extra a pochi ingredienti comuni e segnali con "inDispensa": false;
- non usi altri prodotti oltre a quelli in elenco, ai quattro dati per scontati e agli extra segnalati.
Restituisci SOLO un oggetto JSON con questa struttura esatta, senza testo prima o dopo:
{
  "titolo": "string",
  "motivo": "una frase che spiega perché hai scelto questa ricetta (es. quali prodotti in scadenza usa)",
  "ingredienti": [{"nome": "string", "quantita": number, "unita": "g|kg|ml|l|pz|cucchiaio|cucchiaino|pizzico", "inDispensa": boolean}],
  "preparazione": "string (passaggi brevi e chiari, separati da a capo)",
  "porzioniBase": number,
  "tempoPreparazioneMin": number,
  "tempoCotturaMin": number,
  "categoria": ["pranzo" e/o "cena" e/o "colazione" e/o "spuntino", scegli quelli plausibili],
  "tagDieta": ["string, es. vegetariano, senza glutine — array vuoto se non chiaro"]
}
Rispondi in italiano.`;

function descriviDispensa(dispensa) {
  return dispensa
    .map((p) => {
      let riga = `- ${p.nome}: ${p.quantita}${p.unita ? ' ' + p.unita : ''}`;
      if (p.scadeTraGiorni !== null) {
        if (p.scadeTraGiorni === 0) riga += ' (scade oggi)';
        else if (p.scadeTraGiorni === 1) riga += ' (scade domani)';
        else riga += ` (scade tra ${p.scadeTraGiorni} giorni)`;
      }
      return riga;
    })
    .join('\n');
}

async function chiediRicettaAGemini({ dispensa, evita, apiKey }) {
  let testo = `${ISTRUZIONI}\n\nProdotti in dispensa:\n${descriviDispensa(dispensa)}`;
  if (evita.length > 0) {
    testo += `\n\nHo già visto queste proposte, suggeriscine una DIVERSA:\n${evita.map((t) => `- ${t}`).join('\n')}`;
  }

  const grezza = await chiediJsonAGemini({ apiKey, parts: [{ text: testo }] });
  return normalizzaRicetta(grezza);
}

// Controlla che la ricetta abbia i campi minimi e sistema i tipi, così il
// frontend non deve difendersi da risposte strane.
export function normalizzaRicetta(r) {
  const ingredienti = Array.isArray(r?.ingredienti)
    ? r.ingredienti
        .map((ing) => ({
          nome: String(ing?.nome ?? '').trim(),
          quantita: Number(ing?.quantita) || 0,
          unita: String(ing?.unita ?? 'pz').trim() || 'pz',
          inDispensa: ing?.inDispensa !== false
        }))
        .filter((ing) => ing.nome)
    : [];

  const titolo = String(r?.titolo ?? '').trim();
  if (!titolo || ingredienti.length === 0) {
    throw new Error('Gemini ha restituito una ricetta incompleta. Riprova.');
  }

  return {
    titolo,
    motivo: String(r?.motivo ?? '').trim(),
    ingredienti,
    preparazione: String(r?.preparazione ?? '').trim(),
    porzioniBase: Number(r?.porzioniBase) > 0 ? Number(r.porzioniBase) : 2,
    tempoPreparazioneMin: Number(r?.tempoPreparazioneMin) || 0,
    tempoCotturaMin: Number(r?.tempoCotturaMin) || 0,
    categoria: Array.isArray(r?.categoria) ? r.categoria.map(String) : [],
    tagDieta: Array.isArray(r?.tagDieta) ? r.tagDieta.map(String) : []
  };
}
