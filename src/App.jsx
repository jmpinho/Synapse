import { useEffect, useReducer, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebaseConfig";
import { precisaVerificarEmail, sair } from "./services/authApi";
import { useTarefaAtiva } from "./context/TarefaAtivaContext";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./components/Home/Home";
import Pomodoro from "./components/Pomodoro/Pomodoro";
import Tarefas from "./components/Tarefas/Tarefas";
import Conteudo from "./components/Conteudo/Conteudo";
import Cronograma from "./components/Cronograma/Cronograma";
import Progresso from "./components/Progresso/Progresso";
import Conta from "./components/Conta/Conta";
import Landing from "./components/Landing/Landing";
import Login from "./components/login/Login";
import VerificarEmail from "./components/login/VerificarEmail";
import "./styles/theme.css";
import "./App.css";

export default function App() {
  const [paginaAtiva, setPaginaAtiva] = useState("home");
  const [naLanding, setNaLanding] = useState(true);
  const [usuario, setUsuario] = useState(undefined);
  const { limparTarefaAtiva } = useTarefaAtiva();
  // O objeto do usuário é o mesmo após reload()/updateProfile(), então o React
  // não percebe a mudança sozinho. Esta função força uma nova renderização.
  const [, atualizarUsuario] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      if (!u) {
        // Saiu ou excluiu a conta: nada da conta anterior passa para a próxima
        limparTarefaAtiva();
        setPaginaAtiva("home");
      }
    });
  }, [limparTarefaAtiva]);

  function entrarNoApp() {
    window.scrollTo(0, 0);
    setNaLanding(false);
  }

  async function sairDaConta() {
    try {
      await sair();
    } catch (erro) {
      console.error("Erro ao sair:", erro);
    }
  }

  if (naLanding) {
    return <Landing aoEntrar={entrarNoApp} />;
  }

  if (usuario === undefined) {
    return <div className="app__carregando">Carregando...</div>;
  }

  if (!usuario) {
    return <Login aoVoltar={() => setNaLanding(true)} />;
  }

  if (precisaVerificarEmail(usuario)) {
    return <VerificarEmail email={usuario.email} aoVerificar={atualizarUsuario} />;
  }

  const primeiroNome =
    usuario.displayName?.split(" ")[0] || usuario.email?.split("@")[0] || "Estudante";

  return (
    <div className="app" key={usuario.uid}>
      <Sidebar
        paginaAtiva={paginaAtiva}
        aoNavegar={setPaginaAtiva}
        aoSair={sairDaConta}
        usuario={usuario}
      />

      <main className="app__conteudo">
        <header className="app__cabecalho">
          <h1>Olá, {primeiroNome}!</h1>
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
          {paginaAtiva === "conta" && (
            <Conta usuario={usuario} aoAtualizar={atualizarUsuario} />
          )}
        </div>
      </main>
    </div>
  );
}
