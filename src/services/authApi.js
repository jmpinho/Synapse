import {
  EmailAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { getDocs, writeBatch } from "firebase/firestore";
import { auth, colecaoDoUsuario, db } from "./firebaseConfig";

// Subcoleções que cada usuário tem em usuarios/{uid}/...
// Se criar uma coleção nova, adicione aqui para ela ser apagada junto com a conta.
const COLECOES_DO_USUARIO = ["tarefas", "conteudos", "eventos", "sessoesEstudo"];

function definirPersistencia(lembrar) {
  return setPersistence(
    auth,
    lembrar ? browserLocalPersistence : browserSessionPersistence
  );
}

// ---------- Entrar / cadastrar / sair ----------

export async function entrarComEmail(email, senha, lembrar = true) {
  await definirPersistencia(lembrar);
  return signInWithEmailAndPassword(auth, email.trim(), senha);
}

export async function cadastrarComEmail(nome, email, senha) {
  await definirPersistencia(true);
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), senha);
  if (nome.trim()) {
    await updateProfile(user, { displayName: nome.trim() });
  }
  // Manda o link de confirmação logo após criar a conta
  await sendEmailVerification(user);
  return user;
}

export async function entrarComGoogle(lembrar = true) {
  await definirPersistencia(lembrar);
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function recuperarSenha(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

export function sair() {
  return signOut(auth);
}

// ---------- Verificação de e-mail ----------

// true quando a conta foi criada com e-mail/senha (e não só com o Google)
export function usaSenha(usuario) {
  return usuario?.providerData.some((p) => p.providerId === "password") ?? false;
}

// Contas do Google já chegam verificadas; só quem usa senha precisa confirmar
export function precisaVerificarEmail(usuario) {
  return Boolean(usuario) && usaSenha(usuario) && !usuario.emailVerified;
}

export function reenviarVerificacao() {
  return sendEmailVerification(auth.currentUser);
}

// O Firebase não avisa o app quando a pessoa clica no link:
// reload() busca o estado atualizado (emailVerified, e-mail novo etc.)
export async function recarregarUsuario() {
  await auth.currentUser.reload();
  // Renova o token para que ele também reflita a verificação
  await auth.currentUser.getIdToken(true);
  return auth.currentUser;
}

// ---------- Minha conta ----------

// Ações sensíveis (trocar e-mail/senha, excluir) exigem login recente.
// Quem usa senha digita a senha atual; quem usa Google confirma na janela do Google.
async function reautenticar(senhaAtual) {
  const usuario = auth.currentUser;
  if (usaSenha(usuario)) {
    const credencial = EmailAuthProvider.credential(usuario.email, senhaAtual);
    await reauthenticateWithCredential(usuario, credencial);
  } else {
    await reauthenticateWithPopup(usuario, new GoogleAuthProvider());
  }
}

export function atualizarNome(nome) {
  return updateProfile(auth.currentUser, { displayName: nome.trim() });
}

// O e-mail só muda depois que a pessoa clicar no link enviado ao endereço NOVO
export async function alterarEmail(novoEmail, senhaAtual) {
  await reautenticar(senhaAtual);
  await verifyBeforeUpdateEmail(auth.currentUser, novoEmail.trim());
}

export async function alterarSenha(senhaAtual, novaSenha) {
  await reautenticar(senhaAtual);
  await updatePassword(auth.currentUser, novaSenha);
}

// Apaga todos os documentos de usuarios/{uid}/... em lotes de até 500
async function apagarDadosDoUsuario() {
  for (const nome of COLECOES_DO_USUARIO) {
    const snapshot = await getDocs(colecaoDoUsuario(nome));
    for (let i = 0; i < snapshot.docs.length; i += 500) {
      const lote = writeBatch(db);
      snapshot.docs.slice(i, i + 500).forEach((d) => lote.delete(d.ref));
      await lote.commit();
    }
  }
}

// A ordem importa: primeiro os dados (as regras do Firestore só deixam o
// próprio usuário apagá-los), depois o login. deleteUser sozinho NÃO apaga os dados.
export async function excluirConta(senhaAtual) {
  await reautenticar(senhaAtual);
  await apagarDadosDoUsuario();
  await deleteUser(auth.currentUser);
}

// ---------- Mensagens de erro ----------

// Traduz os códigos de erro do Firebase para mensagens amigáveis
const MENSAGENS_ERRO = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/missing-email": "Informe seu e-mail.",
  "auth/missing-password": "Informe sua senha.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/user-mismatch": "Confirme com a mesma conta do Google que está logada.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/email-already-in-use": "Já existe uma conta com este e-mail.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/requires-recent-login": "Por segurança, saia e entre de novo antes de fazer isso.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
  "auth/popup-blocked": "O navegador bloqueou a janela do Google. Libere pop-ups e tente de novo.",
  "auth/operation-not-allowed": "Este método de login não está ativado no Firebase.",
  "permission-denied": "Sem permissão para acessar estes dados.",
};

export function mensagemDeErro(erro) {
  if (
    erro?.code === "auth/popup-closed-by-user" ||
    erro?.code === "auth/cancelled-popup-request"
  ) {
    return "";
  }
  return MENSAGENS_ERRO[erro?.code] ?? "Algo deu errado. Tente novamente.";
}
