import "./TarefaCard.css";

const ROTULOS_PRIORIDADE = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};
export default function TarefaCard({
  tarefa,
  emFoco,
  minutosEstudados,
  onEstudar,
  onEditar,
  onExcluir,
  arrastavel,
  aoComecarArrasto,
}) {
  return (
    <div
      className={`tarefa-card${emFoco ? " tarefa-card--foco" : ""}`}
      draggable={arrastavel}
      onDragStart={aoComecarArrasto}
    >
      <div className="tarefa-card__cabecalho">
        <span className="tarefa-card__titulo">{tarefa.titulo}</span>
        <span
          className={`tarefa-card__badge tarefa-card__badge--${tarefa.prioridade.nivel}`}
        >
          {ROTULOS_PRIORIDADE[tarefa.prioridade.nivel]}
        </span>
      </div>

      <span className="tarefa-card__data">
        Entrega:{" "}
        {new Date(tarefa.dataEntrega + "T00:00:00").toLocaleDateString("pt-BR")}
        {minutosEstudados > 0 && ` · ${minutosEstudados} min estudados`}
      </span>

      <div className="tarefa-card__acoes">
        <button
          type="button"
          className="tarefa-card__botao-estudar"
          onClick={onEstudar}
        >
          {emFoco ? "Estudando agora" : "Estudar agora"}
        </button>

        {onEditar && (
          <button
            type="button"
            className="tarefa-card__botao-icone"
            onClick={onEditar}
            aria-label="Editar tarefa"
          >
            ✎
          </button>
        )}

        <button
          type="button"
          className="tarefa-card__botao-icone"
          onClick={onExcluir}
          aria-label="Remover tarefa"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
