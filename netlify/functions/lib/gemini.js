// Parte comune alle funzioni serverless che usano Gemini (importa-ricetta, suggerisci-ricetta).
// Se Google ritira il modello, basta cambiare il nome qui sotto, in un solo posto.
export const MODELLO_GEMINI = 'gemini-3.6-flash';

// Manda a Gemini una richiesta e si aspetta in risposta un oggetto JSON, che restituisce già letto.
//  - apiKey: chiave Gemini (variabile d'ambiente GEMINI_API_KEY)
//  - parts: contenuto da analizzare, nel formato di Gemini, es. [{ text: '...' }]
// In caso di problemi lancia un Error con un messaggio comprensibile (verrà mostrato all'utente).
export async function chiediJsonAGemini({ apiKey, parts }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELLO_GEMINI}:generateContent?key=${apiKey}`,
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

  try {
    return JSON.parse(testoJson);
  } catch {
    throw new Error('Gemini ha restituito una risposta non leggibile. Riprova.');
  }
}
