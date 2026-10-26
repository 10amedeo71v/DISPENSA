// ---------- LOGICA DEL PIANO PASTI (funzioni pure, senza React) ----------
import { OGGI } from './date.js';
import { sceglieRicettaPesata } from './ricette.js';

export const PASTI = ['pranzo', 'cena'];

// Decide quali ricette assegnare agli slot liberi dei giorni scelti.
//  - indiciGiorni: giorni da riempire (0 = Lunedì ... 6 = Domenica)
//  - piano: pasti già pianificati (quelli scelti a mano non si toccano)
//  - dataDelGiorno(indice): trasforma l'indice nella data AAAA-MM-GG
// Restituisce [{ indiceGiorno, data, pasto, recipeId }] da applicare al piano.
// Una ricetta non viene ripetuta nello stesso giro finché ne restano altre disponibili;
// se la ricetta ha una categoria (pranzo/cena) si preferiscono quelle adatte al pasto.
export function scegliPastiAutomatici({ indiciGiorni, piano, recipes, dataDelGiorno, random = Math.random, oggi = OGGI }) {
  const usateInQuestoGiro = new Set();
  const assegnazioni = [];

  indiciGiorni.forEach((indiceGiorno) => {
    const data = dataDelGiorno(indiceGiorno);
    PASTI.forEach((pasto) => {
      const occupato = piano.some((m) => m.data === data && m.pasto === pasto && m.recipeId);
      if (occupato) return;

      let pool = recipes.filter((r) => r.categoria.length === 0 || r.categoria.includes(pasto));
      if (pool.length === 0) pool = recipes;

      const scelta = sceglieRicettaPesata(pool, usateInQuestoGiro, random, oggi);
      if (!scelta) return;

      usateInQuestoGiro.add(scelta.id);
      assegnazioni.push({ indiceGiorno, data, pasto, recipeId: scelta.id });
    });
  });

  return assegnazioni;
}
