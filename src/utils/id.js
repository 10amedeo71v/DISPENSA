// Identificatore univoco per nuovi elementi (prodotti, articoli, voci di storico...).
// Data attuale in millisecondi + 4 cifre casuali, così due elementi creati nello
// stesso istante non si scontrano.
export const nuovoId = () => Date.now().toString() + Math.random().toString().slice(2, 6);
