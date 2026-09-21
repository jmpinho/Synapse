import { useEffect, useState } from "react";
import { calcularPrioridade } from "../../utils/calcularPrioridade";
import {
  listarTarefas,
  criarTarefa,
  atualizarTarefa,
  removerTarefa,
} from "../../services/tarefasApi";
import {
  listarSessoes,
  somarMinutosPorTarefa,
} from "../../services/sessoesEstudoApi";
import { useTarefaAtiva } from "../../context/TarefaAtivaContext";
import TarefasKanban from "./TarefasKanban";
import TarefasMatriz from "./TarefasMatriz";
import "./Tarefas.css";

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

function dataDeAmanha() {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return amanha.toISOString().slice(0, 10);
}

function formularioVazio() {
  return {
    titulo: "",
    dataEntrega: dataDeAmanha(),
    dificuldade: 3,
    quantidadeConteudo: 3,
  };
}

function formularioAPartirDe(tarefa) {
  return {
    titulo: tarefa.titulo,
    dataEntrega: tarefa.dataEntrega,
    dificuldade: tarefa.dificuldade,
    quantidadeConteudo: tarefa.quantidadeConteudo,
  };
}

export default function Tarefas() {
  const { tarefaAtiva, definirTarefaAtiva, limparTarefaAtiva } =
    useTarefaAtiva();

  const [tarefas, setTarefas] = useState([]);
  const [formulario, setFormulario] = useState(formularioVazio());

  // Quantos minutos já foram estudados de cada tarefa, a partir do
  // histórico de sessões do Pomodoro. Chave = id da tarefa, valor = minutos.
  const [minutosPorTarefa, setMinutosPorTarefa] = useState({});

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [formularioEdicao, setFormularioEdicao] = useState(null);

  const [visualizacao, setVisualizacao] = useState("lista");

  useEffect(() => {
    listarTarefas()
      .then((dados) => setTarefas(dados))
      .catch(() =>
        setErro("Não foi possível carregar as tarefas. Verifique sua conexão.")
      )
      .finally(() => setCarregando(false));
  }, []);

  // Busca o histórico de sessões de estudo separadamente — se isso
  // falhar, a tela de tarefas continua funcionando normalmente, só sem
  // os minutinhos de "já estudado" (por isso não usa o mesmo estado de
  // erro do carregamento principal).
  useEffect(() => {
    listarSessoes()
      .then((sessoes) => setMinutosPorTarefa(somarMinutosPorTarefa(sessoes)))
      .catch(() => {});
  }, []);

  function atualizarCampo(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarCampoEdicao(campo, valor) {
    setFormularioEdicao((atual) => ({ ...atual, [campo]: valor }));
  }

  async function cadastrarTarefa(evento) {
    evento.preventDefault();
    if (!formulario.titulo.trim() || enviando) return;

    const dadosNovaTarefa = {
      titulo: formulario.titulo.trim(),
      dataEntrega: formulario.dataEntrega,
      dificuldade: Number(formulario.dificuldade),
      quantidadeConteudo: Number(formulario.quantidadeConteudo),
      status: "pendente",
    };

    setEnviando(true);
    setErro(null);

    try {
      const tarefaCriada = await criarTarefa(dadosNovaTarefa);
      setTarefas((atual) => [...atual, tarefaCriada]);
      setFormulario(formularioVazio());
    } catch {
      setErro("Não foi possível cadastrar a tarefa. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicao(tarefa) {
    setIdEmEdicao(tarefa.id);
    setFormularioEdicao(formularioAPartirDe(tarefa));
  }

  function cancelarEdicao() {
    setIdEmEdicao(null);
    setFormularioEdicao(null);
  }

  async function salvarEdicao(evento, id) {
    evento.preventDefault();
    if (!formularioEdicao.titulo.trim() || enviando) return;

    const dadosAtualizados = {
      titulo: formularioEdicao.titulo.trim(),
      dataEntrega: formularioEdicao.dataEntrega,
      dificuldade: Number(formularioEdicao.dificuldade),
      quantidadeConteudo: Number(formularioEdicao.quantidadeConteudo),
    };

    const tarefasAntes = tarefas;
    setTarefas((atual) =>
      atual.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, ...dadosAtualizados } : tarefa
      )
    );
    cancelarEdicao();

    try {
      await atualizarTarefa(id, dadosAtualizados);
    } catch {
      setErro("Não foi possível salvar as alterações. Tente novamente.");
      setTarefas(tarefasAntes);
    }
  }

  async function alterarStatus(id, novoStatus) {
    const statusAnterior = tarefas.find((t) => t.id === id)?.status;

    setTarefas((atual) =>
      atual.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, status: novoStatus } : tarefa
      )
    );

    try {
      await atualizarTarefa(id, { status: novoStatus });
    } catch {
      setErro("Não foi possível salvar o novo status. Tente novamente.");
      setTarefas((atual) =>
        atual.map((tarefa) =>
          tarefa.id === id ? { ...tarefa, status: statusAnterior } : tarefa
        )
      );
    }
  }

  async function excluirTarefa(id) {
    if (
      !window.confirm("Remover esta tarefa? Essa ação não pode ser desfeita.")
    )
      return;

    // Se a tarefa removida era a que estava "ativa" no Pomodoro, limpa
    // essa referência — senão o Pomodoro ficaria mostrando o título de
    // uma tarefa que não existe mais.
    if (tarefaAtiva?.id === id) limparTarefaAtiva();

    const tarefasAntes = tarefas;
    setTarefas((atual) => atual.filter((tarefa) => tarefa.id !== id));

    try {
      await removerTarefa(id);
    } catch {
      setErro("Não foi possível remover a tarefa. Tente novamente.");
      setTarefas(tarefasAntes);
    }
  }

  function alternarFoco(tarefa) {
    if (tarefaAtiva?.id === tarefa.id) {
      limparTarefaAtiva();
    } else {
      definirTarefaAtiva(tarefa);
    }
  }

  const tarefasComPrioridade = tarefas
    .map((tarefa) => ({
      ...tarefa,
      prioridade: calcularPrioridade(tarefa),
    }))
    .sort((a, b) => b.prioridade.pontuacao - a.prioridade.pontuacao);

  return (
    <div className="tarefas">
      <form className="tarefas__formulario" onSubmit={cadastrarTarefa}>
        <h2 className="tarefas__titulo-secao">Nova tarefa</h2>

        <label className="tarefas__campo">
          Descrição
          <input
            type="text"
            placeholder="Ex: Resumo do capítulo 4"
            value={formulario.titulo}
            onChange={(e) => atualizarCampo("titulo", e.target.value)}
            required
          />
        </label>

        <label className="tarefas__campo">
          Data de entrega
          <input
            type="date"
            value={formulario.dataEntrega}
            onChange={(e) => atualizarCampo("dataEntrega", e.target.value)}
            required
          />
        </label>

        <label className="tarefas__campo">
          Dificuldade: {formulario.dificuldade}
          <input
            type="range"
            min="1"
            max="5"
            value={formulario.dificuldade}
            onChange={(e) => atualizarCampo("dificuldade", e.target.value)}
          />
        </label>

        <label className="tarefas__campo">
          Quantidade de conteúdo: {formulario.quantidadeConteudo}
          <input
            type="range"
            min="1"
            max="5"
            value={formulario.quantidadeConteudo}
            onChange={(e) =>
              atualizarCampo("quantidadeConteudo", e.target.value)
            }
          />
        </label>

        <button
          type="submit"
          className="tarefas__botao-cadastrar"
          disabled={enviando}
        >
          {enviando ? "Cadastrando..." : "Cadastrar tarefa"}
        </button>
      </form>

      <div className="tarefas__conteudo">
        <div className="tarefas__cabecalho-conteudo">
          <h2 className="tarefas__titulo-secao">
            Tarefas ({tarefasComPrioridade.length})
          </h2>

          <div className="tarefas__seletor-visualizacao">
            {[
              { chave: "lista", rotulo: "Lista" },
              { chave: "kanban", rotulo: "Kanban" },
              { chave: "matriz", rotulo: "Matriz" },
            ].map((opcao) => (
              <button
                key={opcao.chave}
                type="button"
                className={
                  "tarefas__botao-visualizacao" +
                  (visualizacao === opcao.chave
                    ? " tarefas__botao-visualizacao--ativo"
                    : "")
                }
                onClick={() => setVisualizacao(opcao.chave)}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        {erro && <p className="tarefas__erro">{erro}</p>}

        {carregando && <p className="tarefas__vazio">Carregando tarefas...</p>}

        {!carregando && tarefasComPrioridade.length === 0 && !erro && (
          <p className="tarefas__vazio">Nenhuma tarefa cadastrada ainda.</p>
        )}

        {!carregando &&
          tarefasComPrioridade.length > 0 &&
          visualizacao === "kanban" && (
            <TarefasKanban
              tarefas={tarefasComPrioridade}
              tarefaAtiva={tarefaAtiva}
              minutosPorTarefa={minutosPorTarefa}
              onAlterarStatus={alterarStatus}
              onEstudar={alternarFoco}
              onExcluir={excluirTarefa}
            />
          )}

        {!carregando &&
          tarefasComPrioridade.length > 0 &&
          visualizacao === "matriz" && (
            <TarefasMatriz
              tarefas={tarefasComPrioridade}
              tarefaAtiva={tarefaAtiva}
              minutosPorTarefa={minutosPorTarefa}
              onEstudar={alternarFoco}
              onExcluir={excluirTarefa}
            />
          )}

        {!carregando &&
          tarefasComPrioridade.length > 0 &&
          visualizacao === "lista" && (
            <div className="tarefas__lista">
              {tarefasComPrioridade.map((tarefa) => {
                if (tarefa.id === idEmEdicao) {
                  return (
                    <form
                      key={tarefa.id}
                      className="tarefas__item-edicao"
                      onSubmit={(e) => salvarEdicao(e, tarefa.id)}
                    >
                      <label className="tarefas__campo">
                        Descrição
                        <input
                          type="text"
                          value={formularioEdicao.titulo}
                          onChange={(e) =>
                            atualizarCampoEdicao("titulo", e.target.value)
                          }
                          required
                          autoFocus
                        />
                      </label>

                      <label className="tarefas__campo">
                        Data de entrega
                        <input
                          type="date"
                          value={formularioEdicao.dataEntrega}
                          onChange={(e) =>
                            atualizarCampoEdicao("dataEntrega", e.target.value)
                          }
                          required
                        />
                      </label>

                      <label className="tarefas__campo">
                        Dificuldade: {formularioEdicao.dificuldade}
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={formularioEdicao.dificuldade}
                          onChange={(e) =>
                            atualizarCampoEdicao("dificuldade", e.target.value)
                          }
                        />
                      </label>

                      <label className="tarefas__campo">
                        Quantidade de conteúdo:{" "}
                        {formularioEdicao.quantidadeConteudo}
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={formularioEdicao.quantidadeConteudo}
                          onChange={(e) =>
                            atualizarCampoEdicao(
                              "quantidadeConteudo",
                              e.target.value
                            )
                          }
                        />
                      </label>

                      <div className="tarefas__acoes-edicao">
                        <button
                          type="submit"
                          className="tarefas__botao-cadastrar"
                        >
                          Salvar alterações
                        </button>
                        <button
                          type="button"
                          className="tarefas__botao-cancelar"
                          onClick={cancelarEdicao}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={tarefa.id}
                    className={`tarefas__item tarefas__item--${tarefa.status}${
                      tarefaAtiva?.id === tarefa.id
                        ? " tarefas__item--ativa"
                        : ""
                    }`}
                  >
                    <div className="tarefas__item-principal">
                      <span className="tarefas__item-descricao">
                        {tarefa.titulo}
                      </span>
                      <span className="tarefas__item-data">
                        Entrega:{" "}
                        {new Date(
                          tarefa.dataEntrega + "T00:00:00"
                        ).toLocaleDateString("pt-BR")}
                        {minutosPorTarefa[tarefa.id] > 0 &&
                          ` · ${minutosPorTarefa[tarefa.id]} min estudados`}
                      </span>
                    </div>

                    <select
                      className="tarefas__select-status"
                      value={tarefa.status}
                      onChange={(e) => alterarStatus(tarefa.id, e.target.value)}
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
                        (tarefaAtiva?.id === tarefa.id
                          ? " tarefas__botao-estudar--ativa"
                          : "")
                      }
                      onClick={() =>
                        tarefaAtiva?.id === tarefa.id
                          ? limparTarefaAtiva()
                          : definirTarefaAtiva(tarefa)
                      }
                    >
                      {tarefaAtiva?.id === tarefa.id
                        ? "Estudando agora"
                        : "Estudar agora"}
                    </button>

                    <button
                      type="button"
                      className="tarefas__botao-editar"
                      onClick={() => iniciarEdicao(tarefa)}
                      aria-label="Editar tarefa"
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      className="tarefas__botao-remover"
                      onClick={() => excluirTarefa(tarefa.id)}
                      aria-label="Remover tarefa"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
