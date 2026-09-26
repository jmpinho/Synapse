const ROTULOS_STATUS = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

const ROTULOS_PRIORIDADE = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

// Uma linha da visualização em Lista (fora do modo de edição).
// Extraído de Tarefas.jsx para tirar o JSX de dentro do .map() gigante.
export default function TarefaItemLista({
  tarefa,
  emFoco,
  minutosEstudados,
  onAlterarStatus,
  onEstudar,
  onEditar,
  onExcluir,
}) {
  return (
    <div
      className={`tarefas__item tarefas__item--${tarefa.status}${
        emFoco ? " tarefas__item--ativa" : ""
      }`}
    >
      <div className="tarefas__item-principal">
        <span className="tarefas__item-descricao">{tarefa.titulo}</span>
        <span className="tarefas__item-data">
          Entrega:{" "}
          {new Date(tarefa.dataEntrega + "T00:00:00").toLocaleDateString(
            "pt-BR"
          )}
          {minutosEstudados > 0 && ` · ${minutosEstudados} min estudados`}
        </span>
      </div>

      <select
        className="tarefas__select-status"
        value={tarefa.status}
        onChange={(e) => onAlterarStatus(tarefa.id, e.target.value)}
      >
        {Object.entries(ROTULOS_STATUS).map(([valor, rotulo]) => (
          <option key={valor} value={valor}>
            {rotulo}
          </option>
        ))}
      </select>

      <span
        className={`tarefas__badge-prioridade tarefas__badge-prioridade--${tarefa.prioridade.nivel}`}
        title={`Pontuação: ${tarefa.prioridade.pontuacao}/10`}
      >
        {ROTULOS_PRIORIDADE[tarefa.prioridade.nivel]}
      </span>

      <button
        type="button"
        className={
          "tarefas__botao-estudar" +
          (emFoco ? " tarefas__botao-estudar--ativa" : "")
        }
        onClick={onEstudar}
      >
        {emFoco ? "Estudando agora" : "Estudar agora"}
      </button>

      <button
        type="button"
        className="tarefas__botao-editar"
        onClick={onEditar}
        aria-label="Editar tarefa"
      >
        ✎
      </button>

      <button
        type="button"
        className="tarefas__botao-remover"
        onClick={onExcluir}
        aria-label="Remover tarefa"
      >
        ✕
      </button>
    </div>
  );
}
