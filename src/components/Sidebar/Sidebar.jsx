import { useState, useEffect } from "react";
import {
  IconeHome,
  IconePomodoro,
  IconeConteudo,
  IconeTarefas,
  IconeCronograma,
  IconeProgresso,
} from "./icons";
import "./Sidebar.css";

const itensMenu = [
  { id: "home", rotulo: "Home", Icone: IconeHome },
  { id: "pomodoro", rotulo: "Pomodoro", Icone: IconePomodoro },
  { id: "conteudo", rotulo: "Conteúdo", Icone: IconeConteudo },
  { id: "tarefas", rotulo: "Tarefas", Icone: IconeTarefas },
  { id: "progresso", rotulo: "Progresso", Icone: IconeProgresso },
  { id: "cronograma", rotulo: "Cronograma", Icone: IconeCronograma },
];

export default function Sidebar({ paginaAtiva = "home", aoNavegar, aoSair }) {
  // Define o tema escuro como padrão (ou claro dependendo da sua preferência)
  const [modoEscuro, setModoEscuro] = useState(true);

  // Aplica o atributo 'data-theme' no <html> sempre que o tema muda
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      modoEscuro ? "dark" : "light"
    );
  }, [modoEscuro]);

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        S<span className="sidebar__logo-y">y</span>napse
        <img
          className="sidebar__logo-estrela"
          src="shooting-star.png"
          alt="Estrela"
        />
      </div>

      <nav className="sidebar__nav">
        {itensMenu.map(({ id, rotulo, Icone }) => (
          <button
            key={id}
            type="button"
            className={
              "sidebar__item" +
              (id === paginaAtiva ? " sidebar__item--ativo" : "")
            }
            onClick={() => aoNavegar?.(id)}
          >
            <Icone />
            <span>{rotulo}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__rodape">
        <button type="button" className="sidebar__botao-sair" onClick={aoSair}>
          Sair
        </button>

        <button
          type="button"
          className="sidebar__toggle-tema"
          onClick={() => setModoEscuro((atual) => !atual)}
        >
          <span className="sidebar__toggle-bolinha" aria-hidden="true" />
          {modoEscuro ? "Modo claro" : "Modo escuro"}
        </button>
      </div>
    </aside>
  );
}
