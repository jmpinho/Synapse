import { useEffect, useRef, useState } from "react";
import { useTarefaAtiva } from "../../context/TarefaAtivaContext";
import { registrarSessao } from "../../services/sessoesEstudoApi";
import "./Pomodoro.css";

const DURACOES_MIN = {
  foco: 25,
  descansoCurto: 5,
  descansoLongo: 15,
};

const ROTULOS = {
  foco: "Foco",
  descansoCurto: "Descanso curto",
  descansoLongo: "Descanso longo",
};

const FOCOS_ATE_DESCANSO_LONGO = 4;

export default function Pomodoro() {
  const { tarefaAtiva } = useTarefaAtiva();

  const [modo, setModo] = useState("foco");
  const [segundosRestantes, setSegundosRestantes] = useState(
    DURACOES_MIN.foco * 60
  );
  const [rodando, setRodando] = useState(false);
  const [ciclosConcluidos, setCiclosConcluidos] = useState(0);

  // Refs para acessar sempre o valor mais recente dentro do setInterval,
  // sem precisar recriar o intervalo a cada mudança de estado.
  const fimAlvoRef = useRef(null);
  const tarefaAtivaRef = useRef(tarefaAtiva);
  const ciclosConcluidosRef = useRef(ciclosConcluidos);
  const modoRef = useRef(modo);

  useEffect(() => {
    tarefaAtivaRef.current = tarefaAtiva;
  }, [tarefaAtiva]);

  useEffect(() => {
    ciclosConcluidosRef.current = ciclosConcluidos;
  }, [ciclosConcluidos]);

  useEffect(() => {
    modoRef.current = modo;
  }, [modo]);

  // Troca de modo e reseta o tempo do modo escolhido
  const trocarModo = (novoModo) => {
    setModo(novoModo);
    setSegundosRestantes(DURACOES_MIN[novoModo] * 60);
  };

  const concluirCiclo = () => {
    if (modoRef.current === "foco") {
      const novosCiclos = ciclosConcluidosRef.current + 1;
      setCiclosConcluidos(novosCiclos);

      registrarSessao({
        tarefaId: tarefaAtivaRef.current?.id ?? null,
        minutos: DURACOES_MIN.foco,
      }).catch(() => {});

      const ehDescansoLongo = novosCiclos % FOCOS_ATE_DESCANSO_LONGO === 0;
      trocarModo(ehDescansoLongo ? "descansoLongo" : "descansoCurto");
    } else {
      trocarModo("foco");
    }
  };

  // Controla o relógio: em vez de contar "quantos ticks já passaram" (o que
  // quebra quando o navegador limita/atrasa o setInterval em abas em segundo
  // plano), guardamos o horário real em que o timer deve zerar e, a cada
  // disparo, recalculamos o tempo restante a partir do relógio do sistema.
  // Assim, mesmo que o intervalo atrase ou "pule" disparos, o timer sempre
  // mostra o tempo correto assim que volta a rodar.
  useEffect(() => {
    if (!rodando) {
      fimAlvoRef.current = null;
      return;
    }

    fimAlvoRef.current = Date.now() + segundosRestantes * 1000;

    const atualizarTempoRestante = () => {
      const restante = Math.round((fimAlvoRef.current - Date.now()) / 1000);

      if (restante <= 0) {
        setSegundosRestantes(0);
        setRodando(false);
        concluirCiclo();
      } else {
        setSegundosRestantes(restante);
      }
    };

    // Checar mais rápido que 1s ajuda a não perder o disparo final por causa
    // do throttling; o cálculo por timestamp corrige qualquer atraso.
    const intervalo = setInterval(atualizarTempoRestante, 250);

    // Ao voltar para a aba, recalcula na hora em vez de esperar o próximo
    // tick do intervalo (que pode ter ficado bem atrasado em segundo plano).
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "visible") {
        atualizarTempoRestante();
      }
    };
    document.addEventListener("visibilitychange", aoMudarVisibilidade);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando]);

  // Ações dos botões
  const alternarTimer = () => setRodando(!rodando);

  const reiniciarTimer = () => {
    setRodando(false);
    setSegundosRestantes(DURACOES_MIN[modo] * 60);
  };

  const selecionarAbaModo = (novoModo) => {
    setRodando(false);
    trocarModo(novoModo);
  };

  // Formatação de minutos e segundos (MM:SS)
  const minutos = String(Math.floor(segundosRestantes / 60)).padStart(2, "0");
  const segundos = String(segundosRestantes % 60).padStart(2, "0");

  // Cálculo do progresso para o círculo SVG
  const duracaoTotal = DURACOES_MIN[modo] * 60;
  const progresso = 1 - segundosRestantes / duracaoTotal;
  const raio = 100;
  const circunferencia = 2 * Math.PI * raio;

  return (
    <div className="pomodoro">
      {/* Indicador de Tarefa Ativa */}
      <div
        className={`pomodoro__tarefa-ativa${
          tarefaAtiva ? "" : " pomodoro__tarefa-ativa--vazia"
        }`}
      >
        {tarefaAtiva ? (
          <>
            <span className="pomodoro__tarefa-ativa-rotulo">
              Estudando agora
            </span>
            <span className="pomodoro__tarefa-ativa-titulo">
              {tarefaAtiva.titulo}
            </span>
          </>
        ) : (
          <span>Nenhuma tarefa selecionada</span>
        )}
      </div>

      {/* Abas dos Modos */}
      <div className="pomodoro__abas">
        {Object.keys(DURACOES_MIN).map((chaveModo) => (
          <button
            key={chaveModo}
            type="button"
            className={`pomodoro__aba ${
              modo === chaveModo ? "pomodoro__aba--ativa" : ""
            }`}
            onClick={() => selecionarAbaModo(chaveModo)}
          >
            {ROTULOS[chaveModo]}
          </button>
        ))}
      </div>

      {/* Anel de Progresso e Timer */}
      <div className="pomodoro__anel-container">
        <svg width="260" height="260" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r={raio}
            className="pomodoro__anel-trilha"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="130"
            cy="130"
            r={raio}
            className="pomodoro__anel-progresso"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia * (1 - progresso)}
            transform="rotate(-90 130 130)"
          />
        </svg>

        <div className="pomodoro__centro">
          <span className="pomodoro__tempo">
            {minutos}:{segundos}
          </span>
          <span className="pomodoro__modo-atual">{ROTULOS[modo]}</span>
        </div>
      </div>

      {/* Botões de Controle */}
      <div className="pomodoro__controles">
        <button
          type="button"
          className="pomodoro__botao pomodoro__botao--primario"
          onClick={alternarTimer}
        >
          {rodando ? "Pausar" : "Iniciar"}
        </button>
        <button
          type="button"
          className="pomodoro__botao"
          onClick={reiniciarTimer}
        >
          Reiniciar
        </button>
      </div>

      <p className="pomodoro__ciclos">
        Ciclos de foco concluídos: {ciclosConcluidos}
      </p>
    </div>
  );
}
