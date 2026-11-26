import { useState } from "react";
import {
  cadastrarComEmail,
  demoDisponivel,
  entrarComDemo,
  entrarComEmail,
  entrarComGoogle,
  mensagemDeErro,
  recuperarSenha,
} from "../../services/authApi";
import "./Login.css";

const TEXTOS = {
  entrar: {
    titulo: "Bem-vindo de volta",
    subtitulo: "Entre para continuar seus estudos",
    botao: "Entrar",
  },
  cadastrar: {
    titulo: "Crie sua conta",
    subtitulo: "Comece a organizar seus estudos hoje",
    botao: "Criar conta",
  },
  recuperar: {
    titulo: "Recuperar senha",
    subtitulo: "Enviaremos um link para o seu e-mail",
    botao: "Enviar link",
  },
};

export default function Login({ aoVoltar }) {
  const [modo, setModo] = useState("entrar"); // entrar | cadastrar | recuperar
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  function trocarModo(novoModo) {
    setModo(novoModo);
    setErro("");
    setAviso("");
    setSenha("");
    setConfirmarSenha("");
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setAviso("");

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }
    if (modo === "cadastrar" && senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      if (modo === "entrar") {
        await entrarComEmail(email, senha, lembrar);
      } else if (modo === "cadastrar") {
        await cadastrarComEmail(nome, email, senha);
      } else {
        await recuperarSenha(email);
        setAviso(
          "Confira a caixa de email para redefinir a senha!"
        );
      }
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  async function entrarGoogle() {
    setErro("");
    setCarregando(true);
    try {
      await entrarComGoogle(lembrar);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  async function entrarDemo() {
    setErro("");
    setCarregando(true);
    try {
      await entrarComDemo();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  const textos = TEXTOS[modo];

  return (
    <div className="login">
      <div className="login__brilho login__brilho--1" aria-hidden="true" />
      <div className="login__brilho login__brilho--2" aria-hidden="true" />
      <div className="login__brilho login__brilho--3" aria-hidden="true" />

      <main className="login__cartao">
        <div className="login__logo">
          S<span className="login__logo-y">y</span>napse
          <img className="login__logo-estrela" src="/shooting-star.png" alt="" />
        </div>

        <h1 className="login__titulo">{textos.titulo}</h1>
        <p className="login__subtitulo">{textos.subtitulo}</p>

        <form className="login__form" onSubmit={enviar} noValidate>
          {modo === "cadastrar" && (
            <label className="login__campo">
              <span>Nome</span>
              <input
                type="text"
                placeholder="Digite seu nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </label>
          )}

          <label className="login__campo">
            <span>E-mail</span>
            <input
              type="email"
              placeholder="exemplo@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {modo !== "recuperar" && (
            <label className="login__campo">
              <span>Senha</span>
              <div className="login__senha">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder={
                    modo === "cadastrar" ? "Mínimo de 6 caracteres" : "Sua senha"
                  }
                  autoComplete={
                    modo === "cadastrar" ? "new-password" : "current-password"
                  }
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  className="login__ver-senha"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </label>
          )}

          {modo === "cadastrar" && (
            <label className="login__campo">
              <span>Confirmar senha</span>
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Repita a senha"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </label>
          )}

          {modo === "entrar" && (
            <label className="login__lembrar">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              <span>Lembrar de mim</span>
            </label>
          )}

          {erro && (
            <p className="login__mensagem login__mensagem--erro" role="alert">
              {erro}
            </p>
          )}
          {aviso && (
            <p className="login__mensagem login__mensagem--ok" role="status">
              {aviso}
            </p>
          )}

          <button type="submit" className="login__botao" disabled={carregando}>
            {carregando ? "Aguarde..." : textos.botao}
          </button>
        </form>

        {modo !== "recuperar" && (
          <>
            <div className="login__divisor">
              <span>ou</span>
            </div>
            <button
              type="button"
              className="login__botao-google"
              onClick={entrarGoogle}
              disabled={carregando}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Continuar com Google
            </button>
            {demoDisponivel && (
              <button
                type="button"
                className="login__botao-demo"
                onClick={entrarDemo}
                disabled={carregando}
              >
                Só quero testar: entrar na conta de demonstração
              </button>
            )}
          </>
        )}

        <div className="login__links">
          {modo === "entrar" && (
            <>
              <button type="button" onClick={() => trocarModo("recuperar")}>
                Esqueceu a senha?
              </button>
              <button type="button" onClick={() => trocarModo("cadastrar")}>
                Não tem conta? <strong>Cadastre-se</strong>
              </button>
            </>
          )}
          {modo === "cadastrar" && (
            <button type="button" onClick={() => trocarModo("entrar")}>
              Já tem conta? <strong>Entrar</strong>
            </button>
          )}
          {modo === "recuperar" && (
            <button type="button" onClick={() => trocarModo("entrar")}>
              Voltar para o login
            </button>
          )}
        </div>

        {aoVoltar && (
          <button type="button" className="login__voltar" onClick={aoVoltar}>
            ← Voltar para o início
          </button>
        )}
      </main>
    </div>
  );
}
