import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const colecaoConteudos = collection(db, "conteudos");

export async function buscarConteudos() {
  const snapshot = await getDocs(colecaoConteudos);
  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function criarConteudo(novoConteudo) {
  const referencia = await addDoc(colecaoConteudos, novoConteudo);
  return { id: referencia.id, ...novoConteudo };
}

export function deletarConteudo(id) {
  return deleteDoc(doc(db, "conteudos", id));
}
