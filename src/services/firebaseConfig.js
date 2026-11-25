import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Inicializa o Firestore ativando o cache local no navegador
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Autenticação (login por e-mail/senha e Google)
export const auth = getAuth(app);

// Cada usuário tem os próprios dados em usuarios/{uid}/<coleção>.
// Só é chamado com alguém logado (o App só mostra as páginas após o login).
function uidAtual() {
  const usuario = auth.currentUser;
  if (!usuario) throw new Error("Nenhum usuário logado.");
  return usuario.uid;
}

export function colecaoDoUsuario(nome) {
  return collection(db, "usuarios", uidAtual(), nome);
}

export function documentoDoUsuario(nome, id) {
  return doc(db, "usuarios", uidAtual(), nome, id);
}
