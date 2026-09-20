// Funzione serverless Netlify: riceve un link Instagram/TikTok (o testo incollato a mano),
// prova a estrarre il contenuto (didascalia e/o video) e chiede a Gemini di trasformarlo
// in una ricetta strutturata in formato JSON.
//
// Richiede la variabile d'ambiente GEMINI_API_KEY impostata su Netlify
// (Site settings > Environment variables).

const LIMITE_VIDEO_BYTES = 15 * 1024 * 1024; // 15 MB — oltre rinunciamo al video per stare nei limiti

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

  const { url, testoManuale } = body || {};
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return risposta(
      { errore: 'Chiave Gemini non configurata sul server (variabile GEMINI_API_KEY mancante su Netlify).' },
      500
    );
  }

  try {
    let testoDaAnalizzare = testoManuale && testoManuale.trim() ? testoManuale.trim() : null;
    let videoBase64 = null;
    let videoMimeType = null;

    if (!testoDaAnalizzare && url) {
      const estratto = await estraiContenuto(url);
      testoDaAnalizzare = estratto.testo;
      videoBase64 = estratto.videoBase64;
      videoMimeType = estratto.videoMimeType;

      if (!testoDaAnalizzare && !videoBase64) {
        return risposta({
          errore: 'Non sono riuscito a leggere nulla da questo link (succede spesso con Instagram).',
          suggerimento: 'incolla_testo'
        });
      }
    }

    if (!testoDaAnalizzare && !videoBase64) {
      return risposta({ errore: 'Fornisci un link oppure del testo da analizzare.' }, 400);
    }

    const ricetta = await chiediRicettaAGemini({
      testo: testoDaAnalizzare,
      videoBase64,
      videoMimeType,
      apiKey: GEMINI_API_KEY
    });

    return risposta({ ricetta, metodo: videoBase64 ? 'video' : 'testo' });
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

// ---------- Estrazione da TikTok / Instagram ----------

async function estraiContenuto(url) {
  if (/tiktok\.com/.test(url)) return estraiDaTikTok(url);
  if (/instagram\.com/.test(url)) return estraiDaInstagram(url);
  throw new Error('Link non riconosciuto: deve essere un link Instagram o TikTok.');
}

async function estraiDaTikTok(url) {
  const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
  const dati = await res.json();

  if (dati.code !== 0 || !dati.data) {
    return { testo: null, videoBase64: null, videoMimeType: null };
  }

  const testo = dati.data.title || null;
  const testoSufficiente = testo && testo.length > 60;

  let videoBase64 = null;
  if (!testoSufficiente && dati.data.play) {
    videoBase64 = await scaricaVideoComeBase64(dati.data.play);
  }

  return { testo, videoBase64, videoMimeType: videoBase64 ? 'video/mp4' : null };
}

async function estraiDaInstagram(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' }
  });
  const html = await res.text();

  let testo = null;
  const matchDescrizione = html.match(/<meta property="og:description" content="([^"]+)"/);
  if (matchDescrizione) {
    testo = matchDescrizione[1].replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
  }

  const testoSufficiente = testo && testo.length > 60;
  let videoBase64 = null;

  if (!testoSufficiente) {
    const matchVideo = html.match(/"video_url":"([^"]+)"/) || html.match(/property="og:video" content="([^"]+)"/);
    if (matchVideo) {
      const videoUrl = matchVideo[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
      videoBase64 = await scaricaVideoComeBase64(videoUrl);
    }
  }

  return { testo, videoBase64, videoMimeType: videoBase64 ? 'video/mp4' : null };
}

async function scaricaVideoComeBase64(videoUrl) {
  try {
    const res = await fetch(videoUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > LIMITE_VIDEO_BYTES) return null;
    return Buffer.from(buffer).toString('base64');
  } catch {
    return null;
  }
}

// ---------- Chiamata a Gemini ----------

const SCHEMA_PROMPT = `Sei un assistente che estrae ricette di cucina da contenuti social e restituisce SOLO un oggetto JSON con questa struttura esatta, senza testo aggiuntivo prima o dopo:
{
  "titolo": "string",
  "ingredienti": [{"nome": "string", "quantita": number, "unita": "g|kg|ml|l|pz|cucchiaio|cucchiaino|pizzico"}],
  "preparazione": "string (i passaggi, separati da a capo)",
  "porzioniBase": number,
  "tempoPreparazioneMin": number,
  "tempoCotturaMin": number,
  "categoria": ["pranzo" e/o "cena" e/o "colazione" e/o "spuntino", scegli quelli plausibili],
  "tagDieta": ["string, es. vegetariano, senza glutine — array vuoto se non chiaro"]
}
Se un'informazione non è chiaramente indicata, fai una stima ragionevole invece di lasciarla vuota (tranne tagDieta, che può restare un array vuoto). Rispondi in italiano.`;

async function chiediRicettaAGemini({ testo, videoBase64, videoMimeType, apiKey }) {
  const parts = [{ text: SCHEMA_PROMPT }];

  if (videoBase64) {
    parts.push({ inline_data: { mime_type: videoMimeType, data: videoBase64 } });
    parts.push({ text: 'Estrai la ricetta da questo video.' });
  } else if (testo) {
    parts.push({ text: `Estrai la ricetta da questo testo:\n\n${testo}` });
  } else {
    throw new Error('Nessun contenuto da analizzare.');
  }

  const modello = 'gemini-2.5-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modello}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { response_mime_type: 'application/json' }
      })
    }
  );

  if (!res.ok) {
    const testoErrore = await res.text();
    throw new Error(`Gemini ha risposto con un errore: ${testoErrore.slice(0, 200)}`);
  }

  const dati = await res.json();
  const testoJson = dati?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!testoJson) {
    throw new Error('Gemini non ha restituito nulla di utilizzabile (magari ha bloccato il contenuto).');
  }

  return JSON.parse(testoJson);
}
