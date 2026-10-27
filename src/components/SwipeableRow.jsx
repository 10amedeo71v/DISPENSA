import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

// Riga di lista che si può trascinare verso sinistra per rivelare un bottone
// "elimina" rosso. Usata nella Lista Spesa al posto del bottone + conferma:
// lo swipe stesso è già un gesto deliberato, quindi qui l'eliminazione è immediata.
// isOpen/onOpenChange sono "sollevati" al componente genitore così che aprendo
// una riga si richiuda automaticamente quella aperta in precedenza.
export default function SwipeableRow({ id, label, isOpen, onOpenChange, onDelete, children }) {
  const DELETE_WIDTH = 72;
  const [dragX, setDragX] = useState(isOpen ? -DELETE_WIDTH : 0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = React.useRef(0);
  const baseXRef = React.useRef(0);

  React.useEffect(() => {
    setDragX(isOpen ? -DELETE_WIDTH : 0);
  }, [isOpen]);

  const handlePointerDown = (e) => {
    startXRef.current = e.clientX;
    baseXRef.current = dragX;
    setIsDragging(true);
  };
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startXRef.current;
    setDragX(Math.min(0, Math.max(-DELETE_WIDTH, baseXRef.current + delta)));
  };
  const finisciTrascinamento = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX <= -DELETE_WIDTH / 2) {
      setDragX(-DELETE_WIDTH);
      onOpenChange(id);
    } else {
      setDragX(0);
      onOpenChange(null);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <button
        onClick={() => onDelete(id)}
        className="absolute inset-y-0 right-0 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
        style={{ width: DELETE_WIDTH }}
        aria-label={`Elimina ${label}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finisciTrascinamento}
        onPointerCancel={finisciTrascinamento}
        // Se la riga è già aperta, un semplice tap la richiude invece di attivare
        // il click sottostante (es. spunta l'articolo) — comportamento standard iOS.
        onClickCapture={(e) => {
          if (isOpen) {
            e.stopPropagation();
            onOpenChange(null);
          }
        }}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 150ms ease-out',
          touchAction: 'pan-y'
        }}
        className="relative bg-white"
      >
        {children}
      </div>
    </div>
  );
}
