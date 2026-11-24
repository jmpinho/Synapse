import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// Aqui a numeração faz sentido: é uma sequência real (organizar, focar, acompanhar).
const PASSOS = [
  {
    titulo: "Organize",
    texto:
      "Cadastre tarefas e eventos. O Synapse calcula a prioridade de cada tarefa pelo prazo, pela dificuldade e pela quantidade de conteúdo.",
  },
  {
    titulo: "Foque",
    texto:
      "Escolha a tarefa ativa e inicie o Pomodoro. Cada ciclo de foco concluído vira tempo de estudo registrado.",
  },
  {
    titulo: "Acompanhe",
    texto:
      "Veja sua sequência de dias, a meta diária e as tarefas concluídas, e ajuste o próximo ciclo com base no que realmente estudou.",
  },
];

function Passo({ indice, passo, progresso, reduzir }) {
  // O "neurônio" acende quando a linha de progresso chega até ele
  const limiar = ((indice + 0.5) / PASSOS.length) * 0.9;
  const brilho = useTransform(progresso, [limiar - 0.06, limiar], [0, 1]);

  return (
    <li className="landing__passo">
      <div className="landing__no">
        <motion.span
          className="landing__no-brilho"
          style={{ opacity: reduzir ? 1 : brilho }}
        />
        <span className="landing__no-numero">{indice + 1}</span>
      </div>
      <div className="landing__passo-texto">
        <h3>{passo.titulo}</h3>
        <p>{passo.texto}</p>
      </div>
    </li>
  );
}

export default function Jornada() {
  const secao = useRef(null);
  const reduzir = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: secao,
    offset: ["start 65%", "end 55%"],
  });

  return (
    <section id="como-funciona" className="landing__secao">
      <div className="landing__secao-topo">
        <h2 className="landing__titulo-secao">Do planejamento ao resultado</h2>
        <p className="landing__texto-secao">
          Três passos que se conectam, como o nome sugere.
        </p>
      </div>

      <div className="landing__jornada" ref={secao}>
        <div className="landing__jornada-linha" aria-hidden="true">
          <motion.div
            className="landing__jornada-linha-cheia"
            style={{ scaleY: reduzir ? 1 : scrollYProgress, originY: 0 }}
          />
        </div>
        <ol className="landing__passos">
          {PASSOS.map((passo, i) => (
            <Passo
              key={passo.titulo}
              indice={i}
              passo={passo}
              progresso={scrollYProgress}
              reduzir={reduzir}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
