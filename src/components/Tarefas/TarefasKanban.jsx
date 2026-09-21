import TarefaCard from "./TarefaCard";
import "./TarefasKanban.css";

const COLUNAS = [
  { status: "pendente", titulo: "Pendente" },
  { status: "em_andamento", titulo: "Em andamento" },
  { status: "concluida", titulo: "Concluída" },
];

export default function TarefasKanban({
  tarefas,
  tarefaAtiva,
  minutosPorTarefa,
  onAlterarStatus,
  onEstudar,
  onExcluir,
}) {
  function permitirSoltar(evento) {
    evento.preventDefault();
  }

  function soltarNaColuna(evento, status) {
    const idTarefa = evento.dataTransfer.getData("text/plain");
    if (idTarefa) onAlterarStatus(idTarefa, status);
  }

  return (
    <div className="tarefas-kanban">
      {COLUNAS.map((coluna) => {
        const tarefasDaColuna = tarefas.filter(
          (t) => t.status === coluna.status
        );

        return (
          <div
            key={coluna.status}
            className="tarefas-kanban__coluna"
            onDragOver={permitirSoltar}
            onDrop={(evento) => soltarNaColuna(evento, coluna.status)}
          >
            <h3 className="tarefas-kanban__titulo-coluna">
              {coluna.titulo} ({tarefasDaColuna.length})
            </h3>

            {tarefasDaColuna.length === 0 && (
              <p className="tarefas-kanban__vazio">
                Arraste uma tarefa pra cá.
              </p>
            )}

            {tarefasDaColuna.map((tarefa) => (
              <TarefaCard
                key={tarefa.id}
                tarefa={tarefa}
                emFoco={tarefaAtiva?.id === tarefa.id}
                minutosEstudados={minutosPorTarefa[tarefa.id]}
                onEstudar={() => onEstudar(tarefa)}
                onExcluir={() => onExcluir(tarefa.id)}
                arrastavel
                aoComecarArrasto={(evento) =>
                  evento.dataTransfer.setData("text/plain", tarefa.id)
                }
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
