import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import Hero from "./Hero";
import Vitrine from "./Vitrine";
import Jornada from "./Jornada";
import { IconeSeta, Logo } from "./pecas";
import { rolarPara } from "./utilitarios";
import "./Landing.css";

const LINKS_MENU = [
  { id: "recursos", rotulo: "Recursos" },
  { id: "como-funciona", rotulo: "Como funciona" },
  { id: "sobre", rotulo: "Sobre" },
];

function Cabecalho({ aoEntrar }) {
  const { scrollY } = useScroll();
  const [rolou, setRolou] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setRolou(v > 24));

  function irPara(evento, id) {
    evento.preventDefault();
    rolarPara(id);
  }

  return (
    <header
      className={"landing__cabecalho" + (rolou ? " landing__cabecalho--rolado" : "")}
    >
      <div className="landing__cabecalho-interno">
        <a
          href="#topo"
          aria-label="Synapse, voltar ao topo"
          onClick={(e) => irPara(e, "topo")}
        >
          <Logo />
        </a>
        <nav className="landing__menu" aria-label="Seções da página">
          {LINKS_MENU.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={(e) => irPara(e, link.id)}>
              {link.rotulo}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="landing__botao landing__botao--pequeno"
          onClick={aoEntrar}
        >
          Acessar o app
        </button>
      </div>
    </header>
  );
}

function ChamadaFinal({ aoEntrar }) {
  return (
    <section className="landing__final">
      <div className="landing__final-cartao">
        <h2 className="landing__titulo-secao">Pronto para o próximo ciclo de estudos?</h2>
        <p className="landing__texto-secao">
          Abra o Synapse, cadastre sua primeira tarefa e inicie o Pomodoro.
        </p>
        <button
          type="button"
          className="landing__botao landing__botao--cheio"
          onClick={aoEntrar}
        >
          Começar a estudar
          <IconeSeta />
        </button>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer id="sobre" className="landing__rodape">
      <div className="landing__rodape-interno">
        <div className="landing__rodape-marca">
          <Logo />
          <p>
            Synapse: plataforma web para gestão de tempo e organização do
            aprendizado. Trabalho de conclusão do curso de Ciência da
            Computação da Unifeso.
          </p>
        </div>
        <div className="landing__rodape-autor">
          <p>
            Desenvolvido por <strong>João Mateus Pinho da Silva</strong>
          </p>
          <p>Feito com React, Vite e Firebase</p>
          <nav className="landing__rodape-links" aria-label="Contato">
            <a href="https://github.com/jmpinho" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/joao-mateus-pinho"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default function Landing({ aoEntrar }) {
  return (
    <div className="landing">
      <Cabecalho aoEntrar={aoEntrar} />
      <main>
        <Hero aoEntrar={aoEntrar} />
        <Vitrine />
        <Jornada />
        <ChamadaFinal aoEntrar={aoEntrar} />
      </main>
      <Rodape />
    </div>
  );
}
