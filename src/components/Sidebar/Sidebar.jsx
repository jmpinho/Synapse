import { useState, useEffect } from "react";
import "./Sidebar.css";

const itensMenu = [
  { id: "home", rotulo: "Home", Icone: "/icons/house-24.png" },
  { id: "pomodoro", rotulo: "Pomodoro", Icone: "/icons/clock-24.png" },
  { id: "conteudo", rotulo: "Conteúdo", Icone: "/icons/book-16-24.png" },
  { id: "tarefas", rotulo: "Tarefas", Icone: "/icons/task-24.png" },
  { id: "progresso", rotulo: "Progresso", Icone: "/icons/combo-24.png" },
  { id: "cronograma", rotulo: "Cronograma", Icone: "/icons/calendar-24.png" },
];

export default function Sidebar({ paginaAtiva = "home", aoNavegar, aoSair }) {
  const [modoEscuro, setModoEscuro] = useState(true);

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
            <img src={Icone} alt={rotulo} className="w-5 h-5" />
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
