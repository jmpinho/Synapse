import { useState } from "react";
import {
  mensagemDeErro,
  recarregarUsuario,
  reenviarVerificacao,
  sair,
} from "../../services/authApi";
import "./Login.css";

// Mostrada para quem criou conta com e-mail/senha e ainda não clicou no link.
// Reaproveita o visual da tela de login.
export default function VerificarEmail({ email, aoVerificar }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  async function jaConfirmei() {
    setErro("");
    setAviso("");
    setCarregando(true);
    try {
      const usuario = await recarregarUsuario();
      if (usuario.emailVerified) {
        aoVerificar(); // avisa o App para liberar o acesso
      } else {
        setErro("Ainda não identificamos a confirmação. Clique no link do e-mail e tente de novo.");
      }
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  async function reenviar() {
    setErro("");
    setAviso("");
    setCarregando(true);
    try {
      await reenviarVerificacao();
      setAviso("Link reenviado! Confira também a caixa de spam.");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

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

        <h1 className="login__titulo">Confirme seu e-mail</h1>
        <p className="login__subtitulo">
          Enviamos um link de confirmação para <strong>{email}</strong>. Clique
          nele e depois volte aqui.
        </p>

        <div className="login__form">
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

          <button
            type="button"
            className="login__botao"
            onClick={jaConfirmei}
            disabled={carregando}
          >
            {carregando ? "Aguarde..." : "Já confirmei"}
          </button>
          <button
            type="button"
            className="login__botao-google"
            onClick={reenviar}
            disabled={carregando}
          >
            Reenviar link
          </button>
        </div>

        <button type="button" className="login__voltar" onClick={sair}>
          Usar outra conta
        </button>
      </main>
    </div>
  );
}
