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

export default function Sidebar({ paginaAtiva = "home", aoNavegar, aoSair, usuario }) {
  const [modoEscuro, setModoEscuro] = useState(true);
  const nome = usuario?.displayName || usuario?.email?.split("@")[0] || "Estudante";

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
        {/* Conta conectada: abre a página "Minha conta" */}
        <button
          type="button"
          className={
            "sidebar__conta" +
            (paginaAtiva === "conta" ? " sidebar__conta--ativa" : "")
          }
          onClick={() => aoNavegar?.("conta")}
          aria-label={`Minha conta: ${nome}`}
          title="Minha conta"
        >
          {usuario?.photoURL ? (
            <img
              className="sidebar__avatar"
              src={usuario.photoURL}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="sidebar__avatar" aria-hidden="true">
              {nome.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="sidebar__conta-textos">
            <span className="sidebar__conta-nome">{nome}</span>
            <span className="sidebar__conta-email">{usuario?.email}</span>
          </span>
        </button>

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
