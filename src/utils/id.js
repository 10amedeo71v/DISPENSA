// Identificatore univoco per nuovi elementi (prodotti, articoli, pasti, ricette...).
// Millisecondi attuali + contatore + 4 cifre casuali. Il contatore garantisce che due
// elementi creati nello stesso istante (es. i 14 pasti della generazione automatica,
// creati in un ciclo) NON ricevano mai lo stesso id.
let contatore = 0;
export const nuovoId = () => {
  contatore = (contatore + 1) % 1000;
  return Date.now().toString() + String(contatore).padStart(3, '0') + Math.random().toString().slice(2, 6);
};
