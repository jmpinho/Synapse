import { useEffect, useMemo, useState } from "react";
import {
  buscarConteudos,
  criarConteudo,
  deletarConteudo,
} from "../../services/conteudosApi";
import "./Conteudo.css";

const CATEGORIAS = ["Resumo", "Exercício", "Revisão", "Dúvida"];

function anotacaoVazia() {
  return {
    disciplina: "",
    titulo: "",
    categoria: CATEGORIAS[0],
    conteudo: "",
    linkUtil: "",
  };
}

function normalizarLink(link) {
  const limpo = link.trim();
  if (!limpo) return "";
  return /^https?:\/\//i.test(limpo) ? limpo : `https://${limpo}`;
}

export default function Conteudo() {
  const [anotacoes, setAnotacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [filtroDisciplina, setFiltroDisciplina] = useState("Todas");

  const [exibirForm, setExibirForm] = useState(false);
  const [novaAnotacao, setNovaAnotacao] = useState(anotacaoVazia());

  useEffect(() => {
    buscarConteudos()
      .then((dados) => setAnotacoes(dados))
      .catch(() =>
        setErro(
          "Não foi possível carregar as anotações. Verifique sua conexão e recarregue a página."
        )
      )
      .finally(() => setCarregando(false));
  }, []);

  const disciplinas = useMemo(
    () => [...new Set(anotacoes.map((item) => item.disciplina))],
    [anotacoes]
  );

  const filtroAtivo = disciplinas.includes(filtroDisciplina)
    ? filtroDisciplina
    : "Todas";

  const anotacoesFiltradas = useMemo(
    () =>
      filtroAtivo === "Todas"
        ? anotacoes
        : anotacoes.filter((item) => item.disciplina === filtroAtivo),
    [anotacoes, filtroAtivo]
  );

  function atualizarCampo(campo, valor) {
    setNovaAnotacao((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSalvar(evento) {
    evento.preventDefault();

    const disciplina = novaAnotacao.disciplina.trim();
    const titulo = novaAnotacao.titulo.trim();
    if (!disciplina || !titulo || enviando) return;

    setEnviando(true);
    setErro(null);

    try {
      const itemSalvo = await criarConteudo({
        ...novaAnotacao,
        disciplina,
        titulo,
        conteudo: novaAnotacao.conteudo.trim(),
        linkUtil: normalizarLink(novaAnotacao.linkUtil),
      });

      setAnotacoes((atual) => [itemSalvo, ...atual]);
      setNovaAnotacao(anotacaoVazia());
      setExibirForm(false);
    } catch {
      setErro(
        "Não foi possível salvar a anotação. O texto continua no formulário; tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleDeletar(id) {
    if (
      !window.confirm("Excluir esta anotação? Essa ação não pode ser desfeita.")
    )
      return;

    setErro(null);

    try {
      await deletarConteudo(id);
      setAnotacoes((atual) => atual.filter((item) => item.id !== id));
    } catch {
      setErro("Não foi possível excluir a anotação. Tente novamente.");
    }
  }

  return (
    <div className="conteudo">
      <div className="conteudo__cabecalho">
        <h2>Cadernos e anotações</h2>
        <button
          type="button"
          className="conteudo__botao-novo"
          onClick={() => setExibirForm(!exibirForm)}
        >
          {exibirForm ? "Fechar formulário" : "+ Nova anotação"}
        </button>
      </div>

      {erro && (
        <p className="conteudo__erro" role="alert">
          {erro}
        </p>
      )}

      {exibirForm && (
        <form className="conteudo__formulario" onSubmit={handleSalvar}>
          <input
            type="text"
            list="conteudo-disciplinas"
            placeholder="Disciplina (ex: Cálculo I)"
            aria-label="Disciplina"
            value={novaAnotacao.disciplina}
            onChange={(e) => atualizarCampo("disciplina", e.target.value)}
            required
          />
          <datalist id="conteudo-disciplinas">
            {disciplinas.map((disciplina) => (
              <option key={disciplina} value={disciplina} />
            ))}
          </datalist>

          <input
            type="text"
            placeholder="Título da anotação"
            aria-label="Título da anotação"
            value={novaAnotacao.titulo}
            onChange={(e) => atualizarCampo("titulo", e.target.value)}
            required
          />

          <select
            aria-label="Categoria"
            value={novaAnotacao.categoria}
            onChange={(e) => atualizarCampo("categoria", e.target.value)}
          >
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Escreva aqui o conteúdo principal..."
            aria-label="Conteúdo da anotação"
            value={novaAnotacao.conteudo}
            onChange={(e) => atualizarCampo("conteudo", e.target.value)}
            rows="3"
          />

          <input
            type="text"
            placeholder="Link útil (opcional - ex: www.google.com)"
            aria-label="Link útil"
            value={novaAnotacao.linkUtil}
            onChange={(e) => atualizarCampo("linkUtil", e.target.value)}
          />

          <button
            type="submit"
            className="conteudo__botao-salvar"
            disabled={enviando}
          >
            {enviando ? "Salvando..." : "Salvar anotação"}
          </button>
        </form>
      )}

      {disciplinas.length > 0 && (
        <div className="conteudo__filtros">
          {["Todas", ...disciplinas].map((disciplina) => (
            <button
              key={disciplina}
              type="button"
              className={`conteudo__tag ${
                filtroAtivo === disciplina ? "conteudo__tag--ativa" : ""
              }`}
              onClick={() => setFiltroDisciplina(disciplina)}
            >
              {disciplina}
            </button>
          ))}
        </div>
      )}

      {carregando ? (
        <p className="conteudo__mensagem">Carregando anotações...</p>
      ) : anotacoesFiltradas.length === 0 ? (
        !erro && (
          <p className="conteudo__mensagem">
            {anotacoes.length === 0
              ? "Nenhuma anotação ainda. Use “Nova anotação” para criar a primeira."
              : "Nenhuma anotação nesta disciplina."}
          </p>
        )
      ) : (
        <div className="conteudo__grid">
          {anotacoesFiltradas.map((item) => (
            <div key={item.id} className="conteudo__card">
              <div className="conteudo__card-header">
                <span className="conteudo__card-disciplina">
                  {item.disciplina}
                </span>
                <div className="conteudo__card-acoes">
                  <span className="conteudo__card-categoria">
                    {item.categoria}
                  </span>
                  <button
                    type="button"
                    className="conteudo__botao-deletar"
                    onClick={() => handleDeletar(item.id)}
                    aria-label="Excluir anotação"
                    title="Excluir anotação"
                  >
                    ×
                  </button>
                </div>
              </div>
              <h3 className="conteudo__card-titulo">{item.titulo}</h3>
              <p className="conteudo__card-texto">{item.conteudo}</p>
              {item.linkUtil && item.linkUtil.trim() !== "" && (
                <a
                  href={item.linkUtil}
                  target="_blank"
                  rel="noreferrer"
                  className="conteudo__card-link"
                >
                  Abrir link útil ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
