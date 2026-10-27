// ---------- STATISTICHE (funzioni pure, senza React) ----------

// Dai movimenti dello storico calcola i numeri mostrati nella tab Statistiche.
// Ogni voce dello storico: { nome, tipo: 'acquisto' | 'consumo' | 'spreco', ... }
export function calcolaStatistiche(storico) {
  const acquisti = storico.filter((s) => s.tipo === 'acquisto');
  const consumi = storico.filter((s) => s.tipo === 'consumo');
  const sprechi = storico.filter((s) => s.tipo === 'spreco');

  // I 5 prodotti che compaiono più spesso nella lista
  const raggruppaPerNome = (lista) => {
    const conteggio = {};
    lista.forEach((v) => {
      conteggio[v.nome] = (conteggio[v.nome] || 0) + 1;
    });
    return Object.entries(conteggio)
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Spreco = prodotti buttati dopo la scadenza, sul totale dei prodotti usciti dalla dispensa
  const rimossiTotali = consumi.length + sprechi.length;
  const percentualeSpreco = rimossiTotali > 0 ? Math.round((sprechi.length / rimossiTotali) * 100) : 0;

  return {
    totaleMovimenti: storico.length,
    totaleAcquisti: acquisti.length,
    totaleConsumi: consumi.length,
    totaleSprechi: sprechi.length,
    percentualeSpreco,
    topAcquistati: raggruppaPerNome(acquisti),
    topSprecati: raggruppaPerNome(sprechi)
  };
}
