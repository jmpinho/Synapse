import { useEffect, useState } from "react";
import {
  buscarConteudos,
  criarConteudo,
  deletarConteudo,
} from "../../services/conteudosApi";
import "./conteudo.estilo.css";

export default function Conteudo() {
  const [anotacoes, setAnotacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroDisciplina, setFiltroDisciplina] = useState("Todas");

  const [exibirForm, setExibirForm] = useState(false);
  const [novaAnotacao, setNovaAnotacao] = useState({
    disciplina: "",
    titulo: "",
    categoria: "Resumo",
    conteudo: "",
    linkUtil: "",
  });

  useEffect(() => {
    buscarConteudos()
      .then((dados) => {
        setAnotacoes(dados);
        setCarregando(false);
      })
      .catch((erro) => {
        console.error("Erro ao carregar conteúdos:", erro);
        setCarregando(false);
      });
  }, []);

  const disciplinas = [
    "Todas",
    ...new Set(anotacoes.map((item) => item.disciplina)),
  ];

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!novaAnotacao.titulo || !novaAnotacao.disciplina) return;

    // Formata o link caso o usuário tenha digitado sem http/https
    let linkFormatado = novaAnotacao.linkUtil.trim();
    if (
      linkFormatado &&
      !linkFormatado.startsWith("http://") &&
      !linkFormatado.startsWith("https://")
    ) {
      linkFormatado = `https://${linkFormatado}`;
    }

    const payload = { ...novaAnotacao, linkUtil: linkFormatado };

    criarConteudo(payload)
      .then((itemSalvo) => {
        setAnotacoes([itemSalvo, ...anotacoes]);
        setNovaAnotacao({
          disciplina: "",
          titulo: "",
          categoria: "Resumo",
          conteudo: "",
          linkUtil: "",
        });
        setExibirForm(false);
      })
      .catch((erro) => console.error("Erro ao criar conteúdo:", erro));
  };

  const handleDeletar = (id) => {
    deletarConteudo(id)
      .then(() => {
        setAnotacoes(anotacoes.filter((item) => item.id !== id));
      })
      .catch((erro) => console.error("Erro ao deletar conteúdo:", erro));
  };

  const anotacoesFiltradas =
    filtroDisciplina === "Todas"
      ? anotacoes
      : anotacoes.filter((item) => item.disciplina === filtroDisciplina);

  return (
    <div className="conteudo">
      <div className="conteudo__cabecalho">
        <h2>Cadernos e Anotações</h2>
        <button
          type="button"
          className="conteudo__botao-novo"
          onClick={() => setExibirForm(!exibirForm)}
        >
          {exibirForm ? "Fechar Formulário" : "+ Nova Anotação"}
        </button>
      </div>

      {exibirForm && (
        <form className="conteudo__formulario" onSubmit={handleSalvar}>
          <input
            type="text"
            placeholder="Disciplina (ex: Cálculo I)"
            value={novaAnotacao.disciplina}
            onChange={(e) =>
              setNovaAnotacao({ ...novaAnotacao, disciplina: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Título da anotação"
            value={novaAnotacao.titulo}
            onChange={(e) =>
              setNovaAnotacao({ ...novaAnotacao, titulo: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Escreva aqui o conteúdo principal..."
            value={novaAnotacao.conteudo}
            onChange={(e) =>
              setNovaAnotacao({ ...novaAnotacao, conteudo: e.target.value })
            }
            rows="3"
          />
          <input
            type="text"
            placeholder="Link útil (opcional - ex: www.google.com)"
            value={novaAnotacao.linkUtil}
            onChange={(e) =>
              setNovaAnotacao({ ...novaAnotacao, linkUtil: e.target.value })
            }
          />
          <button type="submit" className="conteudo__botao-salvar">
            Salvar Anotação
          </button>
        </form>
      )}

      {disciplinas.length > 1 && (
        <div className="conteudo__filtros">
          {disciplinas.map((disc) => (
            <button
              key={disc}
              type="button"
              className={`conteudo__tag ${
                filtroDisciplina === disc ? "conteudo__tag--ativa" : ""
              }`}
              onClick={() => setFiltroDisciplina(disc)}
            >
              {disc}
            </button>
          ))}
        </div>
      )}

      {carregando ? (
        <p className="conteudo__mensagem">Carregando anotações...</p>
      ) : anotacoesFiltradas.length === 0 ? (
        <p className="conteudo__mensagem">Nenhuma anotação encontrada.</p>
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
                  Abrir Link Útil ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
