import { useState } from "react";
import {
  alterarEmail,
  alterarSenha,
  atualizarNome,
  excluirConta,
  mensagemDeErro,
  usaSenha,
} from "../../services/authApi";
import "./Conta.css";

function useAcao() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function executar(funcao, mensagemSucesso) {
    setErro("");
    setSucesso("");
    setCarregando(true);
    try {
      await funcao();
      setSucesso(mensagemSucesso);
      return true;
    } catch (e) {
      setErro(e.message && !e.code ? e.message : mensagemDeErro(e));
      return false;
    } finally {
      setCarregando(false);
    }
  }

  return { carregando, erro, sucesso, executar };
}

function Mensagens({ erro, sucesso }) {
  return (
    <>
      {erro && (
        <p className="conta__mensagem conta__mensagem--erro" role="alert">
          {erro}
        </p>
      )}
      {sucesso && (
        <p className="conta__mensagem conta__mensagem--ok" role="status">
          {sucesso}
        </p>
      )}
    </>
  );
}

// ---------- Nome ----------

function SecaoPerfil({ usuario, aoAtualizar }) {
  const [nome, setNome] = useState(usuario.displayName ?? "");
  const { carregando, erro, sucesso, executar } = useAcao();

  async function salvar(evento) {
    evento.preventDefault();
    const ok = await executar(async () => {
      if (!nome.trim()) throw new Error("O nome não pode ficar vazio.");
      await atualizarNome(nome);
    }, "Nome atualizado!");
    if (ok) aoAtualizar();
  }

  return (
    <form className="conta__secao" onSubmit={salvar}>
      <h3>Perfil</h3>
      <label className="conta__campo">
        <span>Nome</span>
        <input
          type="text"
          value={nome}
          autoComplete="name"
          onChange={(e) => setNome(e.target.value)}
        />
      </label>
      <Mensagens erro={erro} sucesso={sucesso} />
      <button type="submit" className="conta__botao" disabled={carregando}>
        {carregando ? "Salvando..." : "Salvar nome"}
      </button>
    </form>
  );
}

// ---------- E-mail ----------

function SecaoEmail({ usuario }) {
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const { carregando, erro, sucesso, executar } = useAcao();

  async function salvar(evento) {
    evento.preventDefault();
    const ok = await executar(async () => {
      if (!novoEmail.trim()) throw new Error("Informe o novo e-mail.");
      if (novoEmail.trim() === usuario.email) {
        throw new Error("Este já é o seu e-mail atual.");
      }
      await alterarEmail(novoEmail, senhaAtual);
    }, `Enviamos um link para ${novoEmail.trim()}. O e-mail só muda depois que você clicar nele.`);
    if (ok) {
      setNovoEmail("");
      setSenhaAtual("");
    }
  }

  return (
    <form className="conta__secao" onSubmit={salvar}>
      <h3>E-mail</h3>
      <p className="conta__descricao">
        Atual: <strong>{usuario.email}</strong>
      </p>
      <label className="conta__campo">
        <span>Novo e-mail</span>
        <input
          type="email"
          value={novoEmail}
          autoComplete="email"
          onChange={(e) => setNovoEmail(e.target.value)}
        />
      </label>
      <label className="conta__campo">
        <span>Senha atual</span>
        <input
          type="password"
          value={senhaAtual}
          autoComplete="current-password"
          onChange={(e) => setSenhaAtual(e.target.value)}
        />
      </label>
      <Mensagens erro={erro} sucesso={sucesso} />
      <button type="submit" className="conta__botao" disabled={carregando}>
        {carregando ? "Enviando..." : "Alterar e-mail"}
      </button>
    </form>
  );
}

// ---------- Senha ----------

function SecaoSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const { carregando, erro, sucesso, executar } = useAcao();

  async function salvar(evento) {
    evento.preventDefault();
    const ok = await executar(async () => {
      if (novaSenha !== confirmar) throw new Error("As senhas não coincidem.");
      await alterarSenha(senhaAtual, novaSenha);
    }, "Senha alterada!");
    if (ok) {
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmar("");
    }
  }

  return (
    <form className="conta__secao" onSubmit={salvar}>
      <h3>Senha</h3>
      <label className="conta__campo">
        <span>Senha atual</span>
        <input
          type="password"
          value={senhaAtual}
          autoComplete="current-password"
          onChange={(e) => setSenhaAtual(e.target.value)}
        />
      </label>
      <label className="conta__campo">
        <span>Nova senha</span>
        <input
          type="password"
          value={novaSenha}
          placeholder="Mínimo de 6 caracteres"
          autoComplete="new-password"
          onChange={(e) => setNovaSenha(e.target.value)}
        />
      </label>
      <label className="conta__campo">
        <span>Confirmar nova senha</span>
        <input
          type="password"
          value={confirmar}
          autoComplete="new-password"
          onChange={(e) => setConfirmar(e.target.value)}
        />
      </label>
      <Mensagens erro={erro} sucesso={sucesso} />
      <button type="submit" className="conta__botao" disabled={carregando}>
        {carregando ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}

// ---------- Excluir conta ----------

const PALAVRA_CONFIRMACAO = "EXCLUIR";

function SecaoExcluir({ comSenha }) {
  const [aberta, setAberta] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const { carregando, erro, executar } = useAcao();

  const podeExcluir =
    confirmacao === PALAVRA_CONFIRMACAO && (!comSenha || senhaAtual);

  async function excluir(evento) {
    evento.preventDefault();
    await executar(() => excluirConta(senhaAtual), "");
  }

  return (
    <section className="conta__secao conta__secao--perigo">
      <h3>Excluir conta</h3>
      <p className="conta__descricao">
        Apaga permanentemente sua conta e todos os seus dados: tarefas,
        anotações, eventos e sessões de estudo. Não é possível desfazer.
      </p>

      {!aberta ? (
        <button
          type="button"
          className="conta__botao conta__botao--perigo"
          onClick={() => setAberta(true)}
        >
          Quero excluir minha conta
        </button>
      ) : (
        <form className="conta__confirmar" onSubmit={excluir}>
          <label className="conta__campo">
            <span>
              Digite <strong>{PALAVRA_CONFIRMACAO}</strong> para confirmar
            </span>
            <input
              type="text"
              value={confirmacao}
              autoComplete="off"
              onChange={(e) => setConfirmacao(e.target.value)}
            />
          </label>
          {comSenha ? (
            <label className="conta__campo">
              <span>Senha atual</span>
              <input
                type="password"
                value={senhaAtual}
                autoComplete="current-password"
                onChange={(e) => setSenhaAtual(e.target.value)}
              />
            </label>
          ) : (
            <p className="conta__descricao">
              Você vai confirmar com sua conta do Google em uma janela.
            </p>
          )}
          <Mensagens erro={erro} />
          <div className="conta__acoes">
            <button
              type="button"
              className="conta__botao conta__botao--secundario"
              onClick={() => {
                setAberta(false);
                setConfirmacao("");
                setSenhaAtual("");
              }}
              disabled={carregando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="conta__botao conta__botao--perigo"
              disabled={!podeExcluir || carregando}
            >
              {carregando ? "Excluindo..." : "Excluir definitivamente"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

// ---------- Página ----------

export default function Conta({ usuario, aoAtualizar }) {
  const comSenha = usaSenha(usuario);

  return (
    <div className="conta">
      <h2>Minha conta</h2>
      {!comSenha && (
        <p className="conta__descricao">
          Dados gerenciados pela sua conta do Google. Para alterar e-mail ou
          senha, use a página de configurações da sua conta Google.
        </p>
      )}

      <SecaoPerfil usuario={usuario} aoAtualizar={aoAtualizar} />
      {comSenha && <SecaoEmail usuario={usuario} />}
      {comSenha && <SecaoSenha />}
      <SecaoExcluir comSenha={comSenha} />
    </div>
  );
}
