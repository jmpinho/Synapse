// Gerador pseudoaleatório com semente fixa: a cidade e as estrelas ficam sempre
// iguais entre renderizações (sem "pulos" visuais e sem diferenças entre builds).
export function mulberry32(semente) {
  let a = semente;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Rolagem suave até uma seção, respeitando "reduzir movimento" do sistema.
export function rolarPara(id) {
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (id === "topo") {
    window.scrollTo({ top: 0, behavior: reduzir ? "auto" : "smooth" });
    return;
  }
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
}
