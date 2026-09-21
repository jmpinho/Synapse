import { useEffect, useMemo, useState } from "react";
import { listarTarefas } from "../../services/tarefasApi";
import { listarEventos } from "../../services/eventosApi";
import {
  listarSessoes,
  somarMinutosDoDia,
} from "../../services/sessoesEstudoApi";
import { buscarConteudos } from "../../services/conteudosApi";
import { calcularPrioridade } from "../../utils/calcularPrioridade";
import { paraISO } from "../../utils/calendario";
import { useTarefaAtiva } from "../../context/TarefaAtivaContext";
import {
  IconeTarefas,
  IconeCronograma,
  IconePomodoro,
  IconeConteudo,
} from "../Sidebar/icons";
import "./Home.css";

const ROTULOS_TIPO = {
  prova: "Prova",
  trabalho: "Trabalho",
  curso: "Curso",
  outro: "Outro",
};

const ROTULOS_PRIORIDADE = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const FRASES_MOTIVACIONAIS = [
  "Um pouco de progresso todo dia já é o suficiente.",
  "Você não precisa terminar hoje, só precisa começar.",
  "25 minutos de foco rendem mais do que parecem.",
  "Estudar um pouco é sempre melhor que não estudar nada.",
  "O cronograma de hoje é só um rascunho — ajuste sem culpa.",
];

function obterSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function obterIntervaloDaSemana() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const fimDaSemana = new Date(hoje);
  fimDaSemana.setDate(hoje.getDate() + 6);

  return { inicioISO: paraISO(hoje), fimISO: paraISO(fimDaSemana) };
}

export default function Home({ aoNavegar }) {
  const { tarefaAtiva } = useTarefaAtiva();

  const [tarefas, setTarefas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [totalConteudos, setTotalConteudos] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [fraseDoDia] = useState(
    () =>
      FRASES_MOTIVACIONAIS[
        Math.floor(Math.random() * FRASES_MOTIVACIONAIS.length)
      ]
  );

  useEffect(() => {
    Promise.allSettled([
      listarTarefas(),
      listarEventos(),
      listarSessoes(),
      buscarConteudos(),
    ]).then(([resTarefas, resEventos, resSessoes, resConteudos]) => {
      if (resTarefas.status === "fulfilled") setTarefas(resTarefas.value);
      if (resEventos.status === "fulfilled") setEventos(resEventos.value);
      if (resSessoes.status === "fulfilled") setSessoes(resSessoes.value);
      if (resConteudos.status === "fulfilled") {
        setTotalConteudos(resConteudos.value.length);
      }

      const algumFalhou = [
        resTarefas,
        resEventos,
        resSessoes,
        resConteudos,
      ].some((resultado) => resultado.status === "rejected");

      if (algumFalhou) {
        setErro(
          "Alguns dados do resumo não carregaram. Verifique se a API está rodando."
        );
      }

      setCarregando(false);
    });
  }, []);

  const { inicioISO, fimISO } = useMemo(() => obterIntervaloDaSemana(), []);

  const tarefasAbertas = useMemo(
    () =>
      tarefas
        .filter((tarefa) => tarefa.status !== "concluida")
        .map((tarefa) => ({
          ...tarefa,
          prioridade: calcularPrioridade(tarefa),
        }))
        .sort((a, b) => b.prioridade.pontuacao - a.prioridade.pontuacao),
    [tarefas]
  );

  const eventosDaSemana = useMemo(
    () =>
      eventos
        .filter((evento) => evento.data >= inicioISO && evento.data <= fimISO)
        .sort((a, b) => (a.data > b.data ? 1 : -1)),
    [eventos, inicioISO, fimISO]
  );

  const minutosHoje = useMemo(
    () => somarMinutosDoDia(sessoes, paraISO(new Date())),
    [sessoes]
  );

  return (
    <div className="home">
      <header className="home__header">
        <h1>{obterSaudacao()}, Estudante! 👋</h1>
        <p className="home__frase">💡 {fraseDoDia}</p>
      </header>

      {/* Banner de Foco / Pomodoro */}
      <section
        className={`home__banner-foco ${
          tarefaAtiva ? "home__banner-foco--ativo" : ""
        }`}
      >
        <div className="home__banner-conteudo">
          <span className="home__banner-tag">
            <IconePomodoro tamanho={14} />
            {tarefaAtiva ? "Em andamento" : "Pomodoro"}
          </span>
          <h3>
            {tarefaAtiva
              ? tarefaAtiva.titulo
              : "Pronto para focar nos estudos hoje?"}
          </h3>
          <p>
            {tarefaAtiva
              ? "Sua sessão de estudos está pronta para ser continuada."
              : "Inicie um ciclo de foco para manter suas metas em dia."}
          </p>
        </div>
        <button
          type="button"
          className="home__botao-primario"
          onClick={() => aoNavegar?.("pomodoro")}
        >
          {tarefaAtiva ? "Continuar foco" : "Ir para o Pomodoro"}
        </button>
      </section>

      {/* Estatísticas */}
      <div className="home__estatisticas">
        <div className="home__estatistica-card">
          <div className="home__estatistica-icone">
            <IconeTarefas tamanho={22} />
          </div>
          <div className="home__estatistica-info">
            <span className="home__estatistica-valor">
              {tarefasAbertas.length}
            </span>
            <span className="home__estatistica-rotulo">Tarefas abertas</span>
          </div>
        </div>

        <div className="home__estatistica-card">
          <div className="home__estatistica-icone">
            <IconeCronograma tamanho={22} />
          </div>
          <div className="home__estatistica-info">
            <span className="home__estatistica-valor">
              {eventosDaSemana.length}
            </span>
            <span className="home__estatistica-rotulo">
              Eventos esta semana
            </span>
          </div>
        </div>

        <div className="home__estatistica-card home__estatistica-card--destaque">
          <div className="home__estatistica-icone">
            <IconePomodoro tamanho={22} />
          </div>
          <div className="home__estatistica-info">
            <span className="home__estatistica-valor">{minutosHoje} min</span>
            <span className="home__estatistica-rotulo">Estudados hoje</span>
          </div>
        </div>

        <div className="home__estatistica-card">
          <div className="home__estatistica-icone">
            <IconeConteudo tamanho={22} />
          </div>
          <div className="home__estatistica-info">
            <span className="home__estatistica-valor">
              {totalConteudos ?? "–"}
            </span>
            <span className="home__estatistica-rotulo">Anotações salvas</span>
          </div>
        </div>
      </div>

      {erro && <p className="home__erro">{erro}</p>}
      {carregando && <p className="home__vazio">Carregando resumo...</p>}

      {/* Cronograma + Tarefas */}
      <div className="home__grade">
        <section className="home__cartao">
          <div className="home__cartao-cabecalho">
            <h2>Cronograma da semana</h2>
            <button
              type="button"
              className="home__botao-ver-tudo"
              onClick={() => aoNavegar?.("cronograma")}
            >
              Ver tudo →
            </button>
          </div>

          {!carregando && eventosDaSemana.length === 0 && (
            <p className="home__vazio">Nada marcado pros próximos 7 dias. ✨</p>
          )}

          <div className="home__lista">
            {eventosDaSemana.slice(0, 5).map((evento) => (
              <div key={evento.id} className="home__item">
                <span
                  className={`home__badge-tipo home__badge-tipo--${evento.tipo}`}
                >
                  {ROTULOS_TIPO[evento.tipo]}
                </span>
                <span className="home__item-titulo">{evento.titulo}</span>
                <span className="home__item-data">
                  {new Date(evento.data + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                    { day: "2-digit", month: "short" }
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="home__cartao">
          <div className="home__cartao-cabecalho">
            <h2>Tarefas priorizadas</h2>
            <button
              type="button"
              className="home__botao-ver-tudo"
              onClick={() => aoNavegar?.("tarefas")}
            >
              Ver tudo →
            </button>
          </div>

          {!carregando && tarefasAbertas.length === 0 && (
            <p className="home__vazio">Nenhuma tarefa pendente. 🎉</p>
          )}

          <div className="home__lista">
            {tarefasAbertas.slice(0, 5).map((tarefa) => (
              <div key={tarefa.id} className="home__item">
                <span
                  className={`home__badge-prioridade home__badge-prioridade--${tarefa.prioridade.nivel}`}
                >
                  {ROTULOS_PRIORIDADE[tarefa.prioridade.nivel]}
                </span>
                <span className="home__item-titulo">{tarefa.titulo}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
