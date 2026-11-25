import {
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { colecaoDoUsuario, documentoDoUsuario } from "./firebaseConfig";

const colecaoEventos = () => colecaoDoUsuario("eventos");

export async function listarEventos() {
  const snapshot = await getDocs(colecaoEventos());
  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function criarEvento(dadosEvento) {
  const referencia = await addDoc(colecaoEventos(), dadosEvento);
  return { id: referencia.id, ...dadosEvento };
}

export function atualizarEvento(id, camposParaAtualizar) {
  return updateDoc(documentoDoUsuario("eventos", id), camposParaAtualizar);
}

export function removerEvento(id) {
  return deleteDoc(documentoDoUsuario("eventos", id));
}
