import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./components/Home/Home";
import Pomodoro from "./components/Pomodoro/Pomodoro";
import Tarefas from "./components/Tarefas/Tarefas";
import Conteudo from "./components/Conteudo/Conteudo";
import Cronograma from "./components/Cronograma/Cronograma";
import Progresso from "./components/Progresso/Progresso";
import "./styles/theme.css";
import "./App.css";

export default function App() {
  const [paginaAtiva, setPaginaAtiva] = useState("home");

  return (
    <div className="app">
      <Sidebar
        paginaAtiva={paginaAtiva}
        aoNavegar={setPaginaAtiva}
        aoSair={() => alert("Sair (ligue isso à sua lógica de autenticação)")}
      />

      <main className="app__conteudo">
        <header className="app__cabecalho">
          <h1>Olá, Estudante!</h1>
          <p>Pronto para mais um ciclo de estudos?</p>
        </header>

        <div className="app__area-pagina">
          {paginaAtiva === "home" && <Home aoNavegar={setPaginaAtiva} />}
          <div
            className={paginaAtiva === "pomodoro" ? "" : "app__pagina-oculta"}
          >
            <Pomodoro />
          </div>
          {paginaAtiva === "tarefas" && <Tarefas />}
          {paginaAtiva === "conteudo" && <Conteudo />}
          {paginaAtiva === "cronograma" && <Cronograma />}
          {paginaAtiva === "progresso" && <Progresso />}
        </div>
      </main>
    </div>
  );
}
