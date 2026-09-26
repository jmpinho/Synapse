// Campos do formulário de tarefa, compartilhados entre o cadastro (Tarefas.jsx)
// e a edição inline (também em Tarefas.jsx). Antes os dois formulários
// repetiam o mesmo JSX; agora só muda o objeto `valores` e o `onMudar`.
export default function CamposTarefa({ valores, onMudar, autoFocusPrimeiro }) {
  return (
    <>
      <label className="tarefas__campo">
        Descrição
        <input
          type="text"
          placeholder="Ex: Resumo do capítulo 4"
          value={valores.titulo}
          onChange={(e) => onMudar("titulo", e.target.value)}
          required
          autoFocus={autoFocusPrimeiro}
        />
      </label>

      <label className="tarefas__campo">
        Data de entrega
        <input
          type="date"
          value={valores.dataEntrega}
          onChange={(e) => onMudar("dataEntrega", e.target.value)}
          required
        />
      </label>

      <label className="tarefas__campo">
        Dificuldade: {valores.dificuldade}
        <input
          type="range"
          min="1"
          max="5"
          value={valores.dificuldade}
          onChange={(e) => onMudar("dificuldade", e.target.value)}
        />
      </label>

      <label className="tarefas__campo">
        Quantidade de conteúdo: {valores.quantidadeConteudo}
        <input
          type="range"
          min="1"
          max="5"
          value={valores.quantidadeConteudo}
          onChange={(e) => onMudar("quantidadeConteudo", e.target.value)}
        />
      </label>
    </>
  );
}
