// ---------- DATE ----------
// Tutte le date dell'app sono stringhe "AAAA-MM-GG" (es. '2026-10-21').
// ATTENZIONE: new Date('2026-10-21') le interpreta a mezzanotte UTC, che in
// Italia sono le 01:00/02:00 locali, mentre OGGI è mezzanotte LOCALE. Mescolare
// le due cose sfasa i conteggi di un giorno (e toISOString() fa lo stesso al
// contrario). Per questo qui dentro leggiamo e scriviamo sempre in ora locale.

const MS_GIORNO = 1000 * 60 * 60 * 24;

// Data odierna reale, azzerata alle 00:00 locali per confronti "a giorno".
export const OGGI = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

// '2026-10-21' -> Date a mezzanotte LOCALE di quel giorno
export function parseDataLocale(dataString) {
  const [anno, mese, giorno] = String(dataString).split('-').map(Number);
  return new Date(anno, mese - 1, giorno);
}

// Date -> '2026-10-21' usando il giorno LOCALE (non quello UTC)
export function formattaDataLocale(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const gg = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${gg}`;
}

// Giorni da oggi a una data: positivo = futuro, 0 = oggi, negativo = passato.
// Math.round (non ceil) perché nei giorni del cambio ora legale/solare un
// giorno dura 23 o 25 ore.
export function giorniAllaData(dataString, oggi = OGGI) {
  return Math.round((parseDataLocale(dataString) - oggi) / MS_GIORNO);
}

// Quanti giorni fa è successa una data: positivo = passato, negativo = futuro.
export function giorniDaOggi(dataString, oggi = OGGI) {
  if (!dataString) return null;
  return -giorniAllaData(dataString, oggi);
}

// Data (AAAA-MM-GG) del giorno della settimana indicato (0 = Lunedì ... 6 = Domenica)
// nella settimana corrente.
export function dataDelGiorno(indiceGiorno, oggi = OGGI) {
  const oggiIndex = (oggi.getDay() + 6) % 7; // getDay(): 0 = Domenica -> lo portiamo a Lunedì = 0
  const d = new Date(oggi);
  d.setDate(d.getDate() + (indiceGiorno - oggiIndex));
  return formattaDataLocale(d);
}
