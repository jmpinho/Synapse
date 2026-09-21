import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const colecaoTarefas = collection(db, "tarefas");

export async function listarTarefas() {
  const snapshot = await getDocs(colecaoTarefas);
  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function criarTarefa(dadosTarefa) {
  const referencia = await addDoc(colecaoTarefas, dadosTarefa);
  return { id: referencia.id, ...dadosTarefa };
}

export function atualizarTarefa(id, camposParaAtualizar) {
  return updateDoc(doc(db, "tarefas", id), camposParaAtualizar);
}

export function removerTarefa(id) {
  return deleteDoc(doc(db, "tarefas", id));
}
