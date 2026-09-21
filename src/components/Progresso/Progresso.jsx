import { useEffect, useMemo, useState } from "react";
import { listarTarefas } from "../../services/tarefasApi";
import { listarSessoes } from "../../services/sessoesEstudoApi";
import { paraISO } from "../../utils/calendario";
import "./Progresso.css";

const META_MINUTOS_DIARIOS = 120; // 2h/dia — meta fixa por enquanto

function obterUltimos7Dias() {
  return Array.from({ length: 7 }, (_, indice) => {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    data.setDate(data.getDate() - (6 - indice));
    return data;
  });
}

/**
 * Conta quantos dias seguidos (contando pra trás a partir de hoje) tiveram
 * pelo menos uma sessão de estudo registrada. Se hoje ainda não teve
 * nenhuma sessão, a sequência já quebra em 0 — simples e direto.
 */
function calcularSequenciaDeDias(diasComEstudo) {
  let sequencia = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (diasComEstudo.has(paraISO(cursor))) {
    sequencia += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return sequencia;
}

export default function Progresso() {
  const [sessoes, setSessoes] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    Promise.allSettled([listarSessoes(), listarTarefas()]).then(
      ([resSessoes, resTarefas]) => {
        if (resSessoes.status === "fulfilled") setSessoes(resSessoes.value);
        if (resTarefas.status === "fulfilled") setTarefas(resTarefas.value);

        if (
          resSessoes.status === "rejected" ||
          resTarefas.status === "rejected"
        ) {
          setErro(
            "Alguns dados de progresso não carregaram. Verifique se a API está rodando."
          );
        }

        setCarregando(false);
      }
    );
  }, []);

  const ultimos7Dias = useMemo(() => obterUltimos7Dias(), []);

  // Soma os minutos por dia (chave = data em ISO), a partir das sessões.
  const minutosPorDia = useMemo(() => {
    const totais = {};
    for (const sessao of sessoes) {
      const dia = sessao.concluidaEm.slice(0, 10);
      totais[dia] = (totais[dia] ?? 0) + sessao.minutos;
    }
    return totais;
  }, [sessoes]);

  const diasComMinutos = useMemo(
    () =>
      ultimos7Dias.map((data) => {
        const iso = paraISO(data);
        return {
          iso,
          rotulo: data
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .replace(".", ""),
          minutos: minutosPorDia[iso] ?? 0,
        };
      }),
    [ultimos7Dias, minutosPorDia]
  );

  const minutosHoje = minutosPorDia[paraISO(new Date())] ?? 0;
  const progressoMeta = Math.min(minutosHoje / META_MINUTOS_DIARIOS, 1);

  const sequenciaDeDias = useMemo(
    () => calcularSequenciaDeDias(new Set(Object.keys(minutosPorDia))),
    [minutosPorDia]
  );

  const totalConcluidas = tarefas.filter(
    (tarefa) => tarefa.status === "concluida"
  ).length;
  const taxaConclusao =
    tarefas.length === 0
      ? 0
      : Math.round((totalConcluidas / tarefas.length) * 100);

  return (
    <div className="progresso">
      {erro && <p className="progresso__erro">{erro}</p>}
      {carregando && (
        <p className="progresso__vazio">Carregando progresso...</p>
      )}

      <div className="progresso__metas">
        <div className="progresso__cartao-meta">
          <span className="progresso__meta-valor">
            {sequenciaDeDias} {sequenciaDeDias === 1 ? "dia" : "dias"}
          </span>
          <span className="progresso__meta-rotulo">Sequência de estudo</span>
        </div>

        <div className="progresso__cartao-meta progresso__cartao-meta--barra">
          <div className="progresso__meta-cabecalho">
            <span className="progresso__meta-rotulo">Meta de hoje</span>
            <span className="progresso__meta-valor-pequeno">
              {minutosHoje} / {META_MINUTOS_DIARIOS} min
            </span>
          </div>
          <div className="progresso__barra-fundo">
            <div
              className="progresso__barra-preenchida"
              style={{ width: `${progressoMeta * 100}%` }}
            />
          </div>
        </div>

        <div className="progresso__cartao-meta">
          <span className="progresso__meta-valor">{taxaConclusao}%</span>
          <span className="progresso__meta-rotulo">
            Tarefas concluídas ({totalConcluidas}/{tarefas.length})
          </span>
        </div>
      </div>

      <section className="progresso__cartao-grafico">
        <h2>Minutos estudados nos últimos 7 dias</h2>

        <div className="progresso__lista-dias">
          {diasComMinutos.map((dia) => (
            <div key={dia.iso} className="progresso__dia">
              <span className="progresso__dia-rotulo">{dia.rotulo}</span>
              <span className="progresso__dia-minutos">{dia.minutos} min</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
