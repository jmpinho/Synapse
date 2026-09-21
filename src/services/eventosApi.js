import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const colecaoEventos = collection(db, "eventos");

export async function listarEventos() {
  const snapshot = await getDocs(colecaoEventos);
  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function criarEvento(dadosEvento) {
  const referencia = await addDoc(colecaoEventos, dadosEvento);
  return { id: referencia.id, ...dadosEvento };
}

export function atualizarEvento(id, camposParaAtualizar) {
  return updateDoc(doc(db, "eventos", id), camposParaAtualizar);
}

export function removerEvento(id) {
  return deleteDoc(doc(db, "eventos", id));
}
