import { useEffect, useMemo, useState } from "react";
import {
  listarEventos,
  criarEvento,
  atualizarEvento,
  removerEvento,
} from "../../services/eventosApi";
import {
  paraISO,
  gerarGradeMensal,
  agruparPorDia,
  formatarMesAno,
  formatarDiaCompleto,
} from "../../utils/calendario";
import "./Cronograma.css";

const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const ROTULOS_TIPO = {
  prova: "Prova",
  trabalho: "Trabalho",
  curso: "Curso",
  outro: "Outro",
};

function formularioVazio() {
  return { titulo: "", tipo: "prova", descricao: "" };
}

export default function Cronograma() {
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [diaSelecionado, setDiaSelecionado] = useState(() =>
    paraISO(new Date())
  );

  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [formulario, setFormulario] = useState(formularioVazio());

  useEffect(() => {
    listarEventos()
      .then((dados) => setEventos(dados))
      .catch(() =>
        setErro(
          "Não foi possível carregar o cronograma. A API fake está rodando? (npm run api)"
        )
      )
      .finally(() => setCarregando(false));
  }, []);

  const grade = useMemo(() => gerarGradeMensal(mesAtual), [mesAtual]);
  const eventosPorDia = useMemo(() => agruparPorDia(eventos), [eventos]);
  const eventosDoDiaSelecionado = eventosPorDia[diaSelecionado] ?? [];

  function irParaMesAdjacente(delta) {
    setMesAtual(
      (atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1)
    );
  }

  function irParaHoje() {
    const hoje = new Date();
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDiaSelecionado(paraISO(hoje));
  }

  function selecionarDia(iso) {
    setDiaSelecionado(iso);
    setFormulario(formularioVazio());
  }

  function atualizarCampo(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  async function cadastrarEvento(evento) {
    evento.preventDefault();
    if (!formulario.titulo.trim() || enviando) return;

    const dadosNovoEvento = {
      titulo: formulario.titulo.trim(),
      tipo: formulario.tipo,
      data: diaSelecionado,
      descricao: formulario.descricao.trim(),
      concluido: false,
    };

    setEnviando(true);
    setErro(null);

    try {
      const eventoCriado = await criarEvento(dadosNovoEvento);
      setEventos((atual) => [...atual, eventoCriado]);
      setFormulario(formularioVazio());
    } catch {
      setErro("Não foi possível cadastrar o evento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function alternarConcluido(id) {
    const eventoAtual = eventos.find((e) => e.id === id);
    const novoValor = !eventoAtual.concluido;

    setEventos((atual) =>
      atual.map((e) => (e.id === id ? { ...e, concluido: novoValor } : e))
    );

    try {
      await atualizarEvento(id, { concluido: novoValor });
    } catch {
      setErro("Não foi possível salvar essa alteração. Tente novamente.");
      setEventos((atual) =>
        atual.map((e) => (e.id === id ? { ...e, concluido: !novoValor } : e))
      );
    }
  }

  async function excluirEvento(id) {
    if (
      !window.confirm("Remover este evento? Essa ação não pode ser desfeita.")
    )
      return;

    const eventosAntes = eventos;
    setEventos((atual) => atual.filter((e) => e.id !== id));

    try {
      await removerEvento(id);
    } catch {
      setErro("Não foi possível remover o evento. Tente novamente.");
      setEventos(eventosAntes);
    }
  }

  const MAX_CHIPS_POR_DIA = 3;

  return (
    <div className="cronograma">
      <div className="cronograma__calendario">
        <div className="cronograma__cabecalho">
          <div className="cronograma__navegacao">
            <button
              type="button"
              className="cronograma__botao-nav"
              onClick={() => irParaMesAdjacente(-1)}
              aria-label="Mês anterior"
            >
              ‹
            </button>
            <h2 className="cronograma__mes-ano">{formatarMesAno(mesAtual)}</h2>
            <button
              type="button"
              className="cronograma__botao-nav"
              onClick={() => irParaMesAdjacente(1)}
              aria-label="Próximo mês"
            >
              ›
            </button>
          </div>

          <button
            type="button"
            className="cronograma__botao-hoje"
            onClick={irParaHoje}
          >
            Hoje
          </button>
        </div>

        {erro && <p className="cronograma__erro">{erro}</p>}

        <div className="cronograma__grade">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="cronograma__dia-semana">
              {dia}
            </div>
          ))}

          {grade.map(({ iso, dia, noMesAtual, ehHoje }) => {
            const eventosDoDia = eventosPorDia[iso] ?? [];
            const restantes = eventosDoDia.length - MAX_CHIPS_POR_DIA;

            return (
              <button
                key={iso}
                type="button"
                className={
                  "cronograma__celula" +
                  (noMesAtual ? "" : " cronograma__celula--fora-do-mes") +
                  (ehHoje ? " cronograma__celula--hoje" : "") +
                  (iso === diaSelecionado
                    ? " cronograma__celula--selecionada"
                    : "")
                }
                onClick={() => selecionarDia(iso)}
              >
                <span className="cronograma__numero-dia">{dia}</span>

                <div className="cronograma__chips">
                  {eventosDoDia.slice(0, MAX_CHIPS_POR_DIA).map((ev) => (
                    <span
                      key={ev.id}
                      className={`cronograma__chip cronograma__chip--${
                        ev.tipo
                      }${ev.concluido ? " cronograma__chip--concluido" : ""}`}
                    >
                      {ev.titulo}
                    </span>
                  ))}
                  {restantes > 0 && (
                    <span className="cronograma__chip-mais">
                      +{restantes} mais
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cronograma__painel-dia">
        <h3 className="cronograma__titulo-dia">
          {formatarDiaCompleto(diaSelecionado)}
        </h3>

        {carregando && (
          <p className="cronograma__vazio">Carregando cronograma...</p>
        )}

        <div className="cronograma__lista-dia">
          {!carregando && eventosDoDiaSelecionado.length === 0 && (
            <p className="cronograma__vazio">Nenhum evento neste dia.</p>
          )}

          {eventosDoDiaSelecionado.map((evento) => (
            <div
              key={evento.id}
              className={
                "cronograma__item" +
                (evento.concluido ? " cronograma__item--concluido" : "")
              }
            >
              <input
                type="checkbox"
                className="cronograma__checkbox"
                checked={evento.concluido}
                onChange={() => alternarConcluido(evento.id)}
                aria-label="Marcar como concluído"
              />

              <span
                className={`cronograma__badge-tipo cronograma__badge-tipo--${evento.tipo}`}
              >
                {ROTULOS_TIPO[evento.tipo]}
              </span>

              <div className="cronograma__item-principal">
                <span className="cronograma__item-descricao">
                  {evento.titulo}
                </span>
                {evento.descricao && (
                  <span className="cronograma__item-observacao">
                    {evento.descricao}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="cronograma__botao-remover"
                onClick={() => excluirEvento(evento.id)}
                aria-label="Remover evento"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <form className="cronograma__formulario" onSubmit={cadastrarEvento}>
          <label className="cronograma__campo">
            Descrição
            <input
              type="text"
              placeholder="Ex: Prova de Cálculo II"
              value={formulario.titulo}
              onChange={(e) => atualizarCampo("titulo", e.target.value)}
              required
            />
          </label>

          <label className="cronograma__campo">
            Tipo
            <select
              value={formulario.tipo}
              onChange={(e) => atualizarCampo("tipo", e.target.value)}
            >
              {Object.entries(ROTULOS_TIPO).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="cronograma__campo">
            Observações (opcional)
            <input
              type="text"
              placeholder="Ex: Sala 12, levar calculadora"
              value={formulario.descricao}
              onChange={(e) => atualizarCampo("descricao", e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="cronograma__botao-cadastrar"
            disabled={enviando}
          >
            {enviando ? "Adicionando..." : "Adicionar a este dia"}
          </button>
        </form>
      </div>
    </div>
  );
}
