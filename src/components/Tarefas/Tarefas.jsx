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
import CamposTarefa from "./CamposTarefa";
import TarefaItemLista from "./TarefaItemLista";
import "./Tarefas.css";

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

  async function atualizarComReversao(atualizarLocal, chamarApi, mensagemErro) {
    const tarefasAntes = tarefas;
    atualizarLocal();

    try {
      await chamarApi();
    } catch {
      setErro(mensagemErro);
      setTarefas(tarefasAntes);
    }
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

    cancelarEdicao();

    await atualizarComReversao(
      () =>
        setTarefas((atual) =>
          atual.map((tarefa) =>
            tarefa.id === id ? { ...tarefa, ...dadosAtualizados } : tarefa
          )
        ),
      () => atualizarTarefa(id, dadosAtualizados),
      "Não foi possível salvar as alterações. Tente novamente."
    );
  }

  async function alterarStatus(id, novoStatus) {
    if (novoStatus === "concluida" && tarefaAtiva?.id === id) {
      limparTarefaAtiva();
    }

    await atualizarComReversao(
      () =>
        setTarefas((atual) =>
          atual.map((tarefa) =>
            tarefa.id === id ? { ...tarefa, status: novoStatus } : tarefa
          )
        ),
      () => atualizarTarefa(id, { status: novoStatus }),
      "Não foi possível salvar o novo status. Tente novamente."
    );
  }

  async function excluirTarefa(id) {
    if (
      !window.confirm("Remover esta tarefa? Essa ação não pode ser desfeita.")
    )
      return;

    if (tarefaAtiva?.id === id) limparTarefaAtiva();

    await atualizarComReversao(
      () => setTarefas((atual) => atual.filter((tarefa) => tarefa.id !== id)),
      () => removerTarefa(id),
      "Não foi possível remover a tarefa. Tente novamente."
    );
  }
  async function moverQuadrante(id, quadrante) {
    await atualizarComReversao(
      () =>
        setTarefas((atual) =>
          atual.map((tarefa) =>
            tarefa.id === id
              ? { ...tarefa, quadranteManual: quadrante }
              : tarefa
          )
        ),
      () => atualizarTarefa(id, { quadranteManual: quadrante }),
      "Não foi possível mover a tarefa de quadrante. Tente novamente."
    );
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

        <CamposTarefa valores={formulario} onMudar={atualizarCampo} />

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
              onMoverQuadrante={moverQuadrante}
            />
          )}

        {!carregando &&
          tarefasComPrioridade.length > 0 &&
          visualizacao === "lista" && (
            <div className="tarefas__lista">
              {tarefasComPrioridade.map((tarefa) =>
                tarefa.id === idEmEdicao ? (
                  <form
                    key={tarefa.id}
                    className="tarefas__item-edicao"
                    onSubmit={(e) => salvarEdicao(e, tarefa.id)}
                  >
                    <CamposTarefa
                      valores={formularioEdicao}
                      onMudar={atualizarCampoEdicao}
                      autoFocusPrimeiro
                    />

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
                ) : (
                  <TarefaItemLista
                    key={tarefa.id}
                    tarefa={tarefa}
                    emFoco={tarefaAtiva?.id === tarefa.id}
                    minutosEstudados={minutosPorTarefa[tarefa.id]}
                    onAlterarStatus={alterarStatus}
                    onEstudar={() => alternarFoco(tarefa)}
                    onEditar={() => iniciarEdicao(tarefa)}
                    onExcluir={() => excluirTarefa(tarefa.id)}
                  />
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}
