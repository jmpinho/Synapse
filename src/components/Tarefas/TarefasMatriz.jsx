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
}) {
  const tarefasEmAberto = tarefas.filter(
    (tarefa) => tarefa.status !== "concluida"
  );

  return (
    <div className="tarefas-matriz">
      {QUADRANTES.map((quadrante) => {
        const tarefasDoQuadrante = tarefasEmAberto.filter(
          (tarefa) => calcularQuadranteEisenhower(tarefa) === quadrante.chave
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
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
