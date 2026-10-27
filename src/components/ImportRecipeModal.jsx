import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ModalBackdrop from './ModalBackdrop.jsx';
import { bozzaDaImportazione } from '../utils/ricette.js';

// Finestra "Importa ricetta da link" (Instagram/TikTok) tramite la funzione serverless + Gemini.
// Esiste solo mentre è aperta, quindi a ogni apertura riparte da zero.
// Quando la ricetta è stata estratta chiama onRicettaEstratta(bozza) con i campi del form già compilati.
export default function ImportRecipeModal({ onClose, onRicettaEstratta }) {
  const [importUrl, setImportUrl] = useState('');
  const [importTestoManuale, setImportTestoManuale] = useState('');
  const [importStato, setImportStato] = useState('inserisci'); // 'inserisci' | 'caricando' | 'errore' | 'chiediTesto'
  const [importErroreMsg, setImportErroreMsg] = useState('');

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

      onRicettaEstratta(bozzaDaImportazione(dati.ricetta || {}, url));
    } catch (err) {
      console.error('Errore importazione ricetta:', err);
      setImportErroreMsg('Errore di connessione con il server. Riprova.');
      setImportStato('errore');
    }
  };

  return (
<ModalBackdrop>
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-lg font-bold text-slate-800">Importa ricetta da link</h3>
      <button onClick={() => onClose()} className="text-slate-400 hover:text-slate-700 text-xl leading-none px-1">×</button>
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
</ModalBackdrop>
  );
}
