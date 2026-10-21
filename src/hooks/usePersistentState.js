import { useState, useEffect } from 'react';
import { leggiDaStorage, scriviSuStorage } from '../utils/storage.js';

// Come useState, ma il valore viene letto da localStorage all'avvio e
// salvato di nuovo ogni volta che cambia. Dopo ogni salvataggio chiama
// onSalvataggio(key, riuscito) così chi usa l'hook può mostrare un avviso
// se qualcosa va storto.
export function usePersistentState(key, valoreIniziale, onSalvataggio) {
  const [valore, setValore] = useState(() => leggiDaStorage(key, valoreIniziale));

  useEffect(() => {
    const riuscito = scriviSuStorage(key, valore);
    if (onSalvataggio) onSalvataggio(key, riuscito);
    // onSalvataggio è volutamente fuori dalle dipendenze: cambia a ogni render
    // ma non deve far ripartire il salvataggio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, valore]);

  return [valore, setValore];
}
