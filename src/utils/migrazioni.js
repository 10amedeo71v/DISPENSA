import { STORAGE_KEYS } from './storage.js';
import { OGGI, parseDataLocale, formattaDataLocale } from './date.js';

// Da fine settembre a oggi l'app calcolava le date del pianificatore con
// toISOString(), che in Italia restituisce il giorno PRIMA. I pasti già
// pianificati per la settimana corrente risultano quindi salvati con la data
// sbagliata (un giorno indietro). Questa migrazione, eseguita una sola volta
// per dispositivo, li sposta avanti di un giorno. Tocca solo le voci della
// settimana corrente in poi: quelle più vecchie sono già passate.
const FLAG = 'dispensa-casa:migrazione-date-piano:v1';

export function migraDatePianoPasti(oggi = OGGI) {
  try {
    if (window.localStorage.getItem(FLAG)) return 0;
    const grezzo = window.localStorage.getItem(STORAGE_KEYS.mealPlan);
    let spostate = 0;
    if (grezzo) {
      const piano = JSON.parse(grezzo);
      if (Array.isArray(piano)) {
        // Lunedì della settimana corrente, meno un giorno (le voci sfasate partono da lì)
        const lunedi = new Date(oggi);
        lunedi.setDate(lunedi.getDate() - ((oggi.getDay() + 6) % 7) - 1);
        const soglia = formattaDataLocale(lunedi);
        const nuovo = piano.map((voce) => {
          if (!voce || typeof voce.data !== 'string' || voce.data < soglia) return voce;
          const d = parseDataLocale(voce.data);
          d.setDate(d.getDate() + 1);
          spostate += 1;
          return { ...voce, data: formattaDataLocale(d) };
        });
        window.localStorage.setItem(STORAGE_KEYS.mealPlan, JSON.stringify(nuovo));
      }
    }
    window.localStorage.setItem(FLAG, new Date().toISOString());
    return spostate;
  } catch (err) {
    console.error('Migrazione date piano pasti non riuscita:', err);
    return 0;
  }
}
