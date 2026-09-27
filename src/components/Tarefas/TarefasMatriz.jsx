import { calcularQuadranteEisenhower } from "../../utils/calcularPrioridade";
import TarefaCard from "./TarefaCard";
import "./TarefasMatriz.css";

const QUADRANTES = [
  { chave: "fazer", titulo: "Fazer agora", subtitulo: "Urgente e importante" },
  {
    chave: "planejar",
    titulo: "Planejar",
    subtitulo: "Importante, não urgente",
  },
  {
    chave: "delegar",
    titulo: "Fazer rápido",
    subtitulo: "Urgente, pouco importante",
  },
  {
    chave: "eliminar",
    titulo: "Depois",
    subtitulo: "Nem urgente nem importante",
  },
];

/**
 * Só mostra tarefas ainda não concluídas — a matriz existe pra ajudar a
 * decidir o que atacar agora, então tarefa concluída não tem o que
 * fazer nela (ela continua aparecendo normalmente no Kanban e na Lista).
 */
export default function TarefasMatriz({
  tarefas,
  tarefaAtiva,
  minutosPorTarefa,
  onEstudar,
  onExcluir,
  onMoverQuadrante,
}) {
  const tarefasEmAberto = tarefas.filter(
    (tarefa) => tarefa.status !== "concluida"
  );

  // O quadrante manual, quando definido, sempre vence o cálculo automático.
  // É esse cruzamento que decide em qual coluna a tarefa aparece.
  function quadranteDaTarefa(tarefa) {
    return tarefa.quadranteManual || calcularQuadranteEisenhower(tarefa);
  }

  return (
    <div className="tarefas-matriz">
      {QUADRANTES.map((quadrante) => {
        const tarefasDoQuadrante = tarefasEmAberto.filter(
          (tarefa) => quadranteDaTarefa(tarefa) === quadrante.chave
        );

        return (
          <div
            key={quadrante.chave}
            className={`tarefas-matriz__quadrante tarefas-matriz__quadrante--${quadrante.chave}`}
          >
            <div className="tarefas-matriz__cabecalho-quadrante">
              <h3>{quadrante.titulo}</h3>
              <span>{quadrante.subtitulo}</span>
            </div>

            {tarefasDoQuadrante.length === 0 && (
              <p className="tarefas-matriz__vazio">Nada aqui por enquanto.</p>
            )}

            {tarefasDoQuadrante.map((tarefa) => (
              <TarefaCard
                key={tarefa.id}
                tarefa={tarefa}
                emFoco={tarefaAtiva?.id === tarefa.id}
                minutosEstudados={minutosPorTarefa[tarefa.id]}
                onEstudar={() => onEstudar(tarefa)}
                onExcluir={() => onExcluir(tarefa.id)}
                rodapeExtra={
                  <select
                    className="tarefas-matriz__seletor-quadrante"
                    value={tarefa.quadranteManual || "automatico"}
                    onChange={(evento) =>
                      onMoverQuadrante(
                        tarefa.id,
                        evento.target.value === "automatico"
                          ? null
                          : evento.target.value
                      )
                    }
                    // Evita que o clique no select dispare o drag/outros
                    // cliques do card por baixo dele.
                    onClick={(evento) => evento.stopPropagation()}
                  >
                    <option value="automatico">
                      Automático (prazo/dificuldade)
                    </option>
                    {QUADRANTES.map((opcaoQuadrante) => (
                      <option
                        key={opcaoQuadrante.chave}
                        value={opcaoQuadrante.chave}
                      >
                        {opcaoQuadrante.titulo}
                      </option>
                    ))}
                  </select>
                }
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
