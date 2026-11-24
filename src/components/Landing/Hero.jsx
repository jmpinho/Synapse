import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Ceu from "./Ceu";
import Cidade from "./Cidade";
import { IconeSeta } from "./pecas";

const LINHAS_TITULO = [["Foco", "hoje,"], ["evolução", "amanhã"]];

export default function Hero({ aoEntrar }) {
  const secao = useRef(null);
  const reduzir = useReducedMotion();

  // Mouse: valor entre -1 e 1, suavizado com mola para o movimento ficar "macio"
  const mouseX = useMotionValue(0);
  const mouseSuave = useSpring(mouseX, { stiffness: 50, damping: 18, mass: 0.6 });

  // Rolagem: progresso de 0 a 1 enquanto o hero sai da tela
  const { scrollYProgress } = useScroll({
    target: secao,
    offset: ["start start", "end start"],
  });
  const textoY = useTransform(scrollYProgress, [0, 1], [0, reduzir ? 0 : -80]);
  const textoOpacidade = useTransform(scrollYProgress, [0, 0.55], [1, reduzir ? 1 : 0]);

  function aoMoverMouse(evento) {
    if (reduzir) return;
    const caixa = evento.currentTarget.getBoundingClientRect();
    mouseX.set(((evento.clientX - caixa.left) / caixa.width - 0.5) * 2);
  }

  let indicePalavra = 0;

  return (
    <section
      id="topo"
      ref={secao}
      className="landing__hero"
      onMouseMove={aoMoverMouse}
    >
      <Ceu />
      <div className="landing__hero-brilho" aria-hidden="true" />
      <Cidade x={mouseSuave} progresso={scrollYProgress} reduzir={reduzir} />

      <motion.div
        className="landing__hero-texto"
        style={{ y: textoY, opacity: textoOpacidade }}
      >
        <h1 className="landing__titulo-hero" aria-label="Foco hoje, evolução amanhã">
          {LINHAS_TITULO.map((linha, i) => (
            <span key={i} className="landing__linha-titulo" aria-hidden="true">
              {linha.map((palavra) => {
                const atraso = 0.25 + indicePalavra++ * 0.11;
                return (
                  <span key={palavra} className="landing__palavra">
                    <motion.span
                      className="landing__palavra-interna"
                      initial={reduzir ? false : { y: "115%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {palavra}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          ))}
        </h1>

        <motion.p
          className="landing__subtitulo-hero"
          initial={reduzir ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Pomodoro, tarefas, cronograma e progresso em um só lugar, feito para
          quem estuda.
        </motion.p>

        <motion.div
          initial={reduzir ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <button type="button" className="landing__botao" onClick={aoEntrar}>
            Começar a estudar
            <IconeSeta />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
