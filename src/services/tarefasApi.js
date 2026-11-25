import {
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { colecaoDoUsuario, documentoDoUsuario } from "./firebaseConfig";

const colecaoTarefas = () => colecaoDoUsuario("tarefas");

export async function listarTarefas() {
  const snapshot = await getDocs(colecaoTarefas());
  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function criarTarefa(dadosTarefa) {
  const referencia = await addDoc(colecaoTarefas(), dadosTarefa);
  return { id: referencia.id, ...dadosTarefa };
}

export function atualizarTarefa(id, camposParaAtualizar) {
  return updateDoc(documentoDoUsuario("tarefas", id), camposParaAtualizar);
}

export function removerTarefa(id) {
  return deleteDoc(documentoDoUsuario("tarefas", id));
}
