import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Prévia 1: Pomodoro (timer de verdade, com os 3 modos do app)       */
/* ------------------------------------------------------------------ */

const MODOS = [
  { id: "foco", rotulo: "Foco", minutos: 25 },
  { id: "curto", rotulo: "Descanso curto", minutos: 5 },
  { id: "longo", rotulo: "Descanso longo", minutos: 15 },
];

const RAIO = 88;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function formatarTempo(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, "0");
  const s = String(segundos % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function PainelPomodoro() {
  const [modo, setModo] = useState(MODOS[0]);
  const [restante, setRestante] = useState(MODOS[0].minutos * 60 - 95);
  const [rodando, setRodando] = useState(true);

  useEffect(() => {
    if (!rodando) return undefined;
    const intervalo = setInterval(
      () => setRestante((r) => (r > 0 ? r - 1 : 0)),
      1000
    );
    return () => clearInterval(intervalo);
  }, [rodando]);

  function trocarModo(novo) {
    setModo(novo);
    setRestante(novo.minutos * 60);
  }

  const total = modo.minutos * 60;
  const progresso = restante / total;

  return (
    <div className="landing__pomo">
      <div className="landing__pomo-modos" role="group" aria-label="Modo do timer">
        {MODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={
              "landing__chip" + (m.id === modo.id ? " landing__chip--ativo" : "")
            }
            aria-pressed={m.id === modo.id}
            onClick={() => trocarModo(m)}
          >
            {m.rotulo}
          </button>
        ))}
      </div>

      <div className="landing__pomo-anel">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r={RAIO} className="landing__anel-trilho" />
          <circle
            cx="100"
            cy="100"
            r={RAIO}
            className="landing__anel-progresso"
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={CIRCUNFERENCIA * (1 - progresso)}
          />
        </svg>
        <div className="landing__pomo-tempo">
          <strong>{formatarTempo(restante)}</strong>
          <span>{modo.rotulo}</span>
        </div>
      </div>

      <p className="landing__pomo-tarefa">
        Estudando agora: <strong>Resumo de Cálculo II</strong>
      </p>

      <div className="landing__pomo-acoes">
        <button
          type="button"
          className="landing__botao landing__botao--pequeno landing__botao--cheio"
          onClick={() => setRodando((r) => !r)}
        >
          {rodando ? "Pausar" : "Continuar"}
        </button>
        <button
          type="button"
          className="landing__botao landing__botao--pequeno"
          onClick={() => {
            setRestante(total);
            setRodando(false);
          }}
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Prévia 2: Kanban (clique no cartão para mudar o status)            */
/* ------------------------------------------------------------------ */

const STATUS = ["pendente", "em_andamento", "concluida"];
const ROTULO_STATUS = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};
const TAREFAS_INICIAIS = [
  { id: 1, titulo: "Resumo de Cálculo II", prioridade: "Alta", status: "em_andamento" },
  { id: 2, titulo: "Lista de algoritmos", prioridade: "Média", status: "pendente" },
  { id: 3, titulo: "Estudar para a prova de Redes", prioridade: "Alta", status: "pendente" },
  { id: 4, titulo: "Artigo de Física", prioridade: "Baixa", status: "concluida" },
];

function PainelTarefas() {
  const [tarefas, setTarefas] = useState(TAREFAS_INICIAIS);

  function avancar(id) {
    setTarefas((lista) =>
      lista.map((t) =>
        t.id === id
          ? { ...t, status: STATUS[(STATUS.indexOf(t.status) + 1) % STATUS.length] }
          : t
      )
    );
  }

  return (
    <LayoutGroup>
      <div className="landing__kanban">
        {STATUS.map((status) => (
          <div key={status} className="landing__coluna">
            <h3 className="landing__coluna-titulo">{ROTULO_STATUS[status]}</h3>
            <div className="landing__coluna-lista">
              {tarefas
                .filter((t) => t.status === status)
                .map((t) => (
                  <motion.button
                    key={t.id}
                    layoutId={`tarefa-${t.id}`}
                    type="button"
                    className={`landing__cartao-tarefa landing__cartao-tarefa--${status}`}
                    onClick={() => avancar(t.id)}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  >
                    <span className="landing__cartao-titulo">{t.titulo}</span>
                    <span className="landing__cartao-prioridade">
                      Prioridade {t.prioridade.toLowerCase()}
                    </span>
                  </motion.button>
                ))}
            </div>
          </div>
        ))}
      </div>
      <p className="landing__dica">Clique em um cartão para mudar o status.</p>
    </LayoutGroup>
  );
}

/* ------------------------------------------------------------------ */
/* Prévia 3: Progresso (sequência, meta diária, tarefas concluídas)   */
/* ------------------------------------------------------------------ */

const ULTIMOS_DIAS = [
  ["Seg", 95],
  ["Ter", 120],
  ["Qua", 60],
  ["Qui", 110],
  ["Sex", 125],
  ["Sáb", 45],
  ["Dom", 84],
];

function Barra({ rotulo, valor, detalhe }) {
  return (
    <div className="landing__barra">
      <div className="landing__barra-texto">
        <span>{rotulo}</span>
        <span>{detalhe}</span>
      </div>
      <div className="landing__barra-trilho">
        <motion.div
          className="landing__barra-preenchida"
          initial={{ width: 0 }}
          animate={{ width: `${valor}%` }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function PainelProgresso() {
  return (
    <div className="landing__progresso">
      <div className="landing__sequencia">
        <strong>7</strong>
        <span>dias seguidos estudando</span>
      </div>
      <Barra rotulo="Meta diária" valor={70} detalhe="84 de 120 min" />
      <Barra rotulo="Tarefas concluídas" valor={67} detalhe="4 de 6" />
      <ul className="landing__dias" aria-label="Minutos estudados nos últimos 7 dias">
        {ULTIMOS_DIAS.map(([dia, minutos]) => (
          <li key={dia}>
            <span>{dia}</span>
            <strong>{minutos}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Prévia 4: Cronograma (calendário mensal, clique em um dia)         */
/* ------------------------------------------------------------------ */

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const EVENTOS = {
  3: { tipo: "estudo", nome: "Revisão de Cálculo" },
  9: { tipo: "entrega", nome: "Entrega da lista de algoritmos" },
  12: { tipo: "prova", nome: "Prova de Redes" },
  18: { tipo: "estudo", nome: "Grupo de estudos" },
  24: { tipo: "entrega", nome: "Relatório final" },
  27: { tipo: "prova", nome: "Prova de Física" },
};
// Novembro de 2026 começa em um domingo e tem 30 dias
const DIAS_DO_MES = Array.from({ length: 30 }, (_, i) => i + 1);

function PainelCronograma() {
  const [selecionado, setSelecionado] = useState(12);
  const evento = EVENTOS[selecionado];

  return (
    <div className="landing__calendario">
      <h3 className="landing__calendario-mes">Novembro</h3>
      <div className="landing__calendario-grade">
        {DIAS_SEMANA.map((d, i) => (
          <span key={i} className="landing__calendario-semana" aria-hidden="true">
            {d}
          </span>
        ))}
        {DIAS_DO_MES.map((dia) => (
          <button
            key={dia}
            type="button"
            className={
              "landing__dia" + (dia === selecionado ? " landing__dia--ativo" : "")
            }
            aria-pressed={dia === selecionado}
            aria-label={`Dia ${dia}${EVENTOS[dia] ? `: ${EVENTOS[dia].nome}` : ""}`}
            onClick={() => setSelecionado(dia)}
          >
            {dia}
            {EVENTOS[dia] && (
              <i className={`landing__dia-marca landing__dia-marca--${EVENTOS[dia].tipo}`} />
            )}
          </button>
        ))}
      </div>
      <p className="landing__calendario-detalhe" aria-live="polite">
        {evento ? (
          <>
            <i className={`landing__dia-marca landing__dia-marca--${evento.tipo}`} />
            {selecionado} de novembro: <strong>{evento.nome}</strong>
          </>
        ) : (
          `${selecionado} de novembro: nenhum evento neste dia`
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vitrine: abas + janela de aplicativo                               */
/* ------------------------------------------------------------------ */

const ABAS = [
  {
    id: "pomodoro",
    titulo: "Pomodoro",
    texto:
      "Timer com três modos: foco, descanso curto e descanso longo. Cada ciclo de foco vira tempo registrado na tarefa que você está estudando.",
    Painel: PainelPomodoro,
  },
  {
    id: "tarefas",
    titulo: "Tarefas",
    texto:
      "Veja suas tarefas em lista, Kanban ou Matriz de Eisenhower. A prioridade é calculada pelo prazo, pela dificuldade e pela quantidade de conteúdo.",
    Painel: PainelTarefas,
  },
  {
    id: "progresso",
    titulo: "Progresso",
    texto:
      "Acompanhe sua sequência de dias, a meta diária de estudo e a porcentagem de tarefas concluídas.",
    Painel: PainelProgresso,
  },
  {
    id: "cronograma",
    titulo: "Cronograma",
    texto:
      "Calendário mensal com provas, entregas e sessões de estudo. Clique em um dia para ver o que está marcado.",
    Painel: PainelCronograma,
  },
];

export default function Vitrine() {
  const [ativaId, setAtivaId] = useState("pomodoro");
  const ativa = ABAS.find((a) => a.id === ativaId);
  const Painel = ativa.Painel;

  return (
    <section id="recursos" className="landing__secao">
      <div className="landing__secao-topo">
        <h2 className="landing__titulo-secao">Seu ciclo de estudos em um só lugar</h2>
        <p className="landing__texto-secao">
          Experimente as ferramentas abaixo. As prévias são interativas e usam
          dados de exemplo.
        </p>
      </div>

      <div className="landing__vitrine-grade">
        <div className="landing__vitrine-lateral">
          <LayoutGroup id="abas-vitrine">
            <div className="landing__abas" role="tablist" aria-label="Recursos do Synapse">
              {ABAS.map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  role="tab"
                  id={`aba-${aba.id}`}
                  aria-selected={aba.id === ativaId}
                  aria-controls="painel-vitrine"
                  className="landing__aba"
                  onClick={() => setAtivaId(aba.id)}
                >
                  {aba.id === ativaId && (
                    <motion.span
                      layoutId="marcador-aba"
                      className="landing__aba-marcador"
                      transition={{ type: "spring", stiffness: 400, damping: 36 }}
                    />
                  )}
                  <span className="landing__aba-titulo">{aba.titulo}</span>
                  <span className="landing__aba-texto">{aba.texto}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <p className="landing__aba-descricao-movel">{ativa.texto}</p>
        </div>

        <div
          className="landing__app"
          role="tabpanel"
          id="painel-vitrine"
          aria-labelledby={`aba-${ativaId}`}
        >
          <div className="landing__app-barra">{ativa.titulo}</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={ativaId}
              className="landing__painel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <Painel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
