import { mulberry32 } from "./utilitarios";

const ESTRELAS = (() => {
  const aleatorio = mulberry32(99);
  return Array.from({ length: 90 }, () => ({
    x: aleatorio() * 100,
    y: aleatorio() * 62,
    tamanho: 1 + aleatorio() * 1.8,
    atraso: (aleatorio() * 5).toFixed(2),
    duracao: (2.5 + aleatorio() * 4).toFixed(2),
    opacidade: (0.35 + aleatorio() * 0.6).toFixed(2),
  }));
})();

export default function Ceu() {
  return (
    <div className="landing__ceu" aria-hidden="true">
      {ESTRELAS.map((e, i) => (
        <span
          key={i}
          className="landing__estrela"
          style={{
            left: `${e.x}%`,
            top: `${e.y}%`,
            width: e.tamanho,
            height: e.tamanho,
            animationDelay: `${e.atraso}s`,
            animationDuration: `${e.duracao}s`,
            "--opacidade": e.opacidade,
          }}
        />
      ))}
      {/* Estrelas cadentes: a mesma ideia do logo do Synapse */}
      <span className="landing__cadente landing__cadente--1" />
      <span className="landing__cadente landing__cadente--2" />
      <span className="landing__cadente landing__cadente--3" />
    </div>
  );
}
