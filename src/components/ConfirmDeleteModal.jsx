import React from 'react';
import { AlertTriangle } from 'lucide-react';
import ModalBackdrop from './ModalBackdrop.jsx';

// Finestra "Confermi l'eliminazione?" usata per prodotti, ricette e giorni del piano.
//  - pendingDelete: { tipo, id, nome } di ciò che si sta per eliminare
//  - pastiPianificatiConRicetta: per le ricette, quanti pasti del piano verranno svuotati
export default function ConfirmDeleteModal({ pendingDelete, pastiPianificatiConRicetta, onConferma, onAnnulla }) {
  return (
<ModalBackdrop zIndexClass="z-[60]">
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
    {pendingDelete.tipo === 'recipe' && pastiPianificatiConRicetta > 0 && (
      <p className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 mb-5">
        Questa ricetta è nel piano pasti ({pastiPianificatiConRicetta} {pastiPianificatiConRicetta === 1 ? 'pasto' : 'pasti'}): {pastiPianificatiConRicetta === 1 ? 'verrà svuotato' : 'verranno svuotati'} anche {pastiPianificatiConRicetta === 1 ? 'quello' : 'quelli'}.
      </p>
    )}
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onAnnulla}
        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
      >
        Annulla
      </button>
      <button
        onClick={onConferma}
        className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition"
      >
        Elimina
      </button>
    </div>
  </div>
</ModalBackdrop>
  );
}
