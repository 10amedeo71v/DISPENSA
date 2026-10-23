import React from 'react';

// Sfondo scuro sfocato comune a tutte le modali dell'app.
// - scrollable: la finestra può essere più alta dello schermo (si scorre)
// - zIndexClass: z-[60] per le finestre che devono stare sopra le altre
// - onClick: se passato, un tocco sullo sfondo (fuori dalla finestra) chiude la modale
export default function ModalBackdrop({ children, scrollable = false, zIndexClass = 'z-50', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`fixed inset-0 bg-slate-900/45 backdrop-blur-sm ${zIndexClass} flex items-center justify-center p-4 ${scrollable ? 'overflow-y-auto' : ''}`}
    >
      {children}
    </div>
  );
}
