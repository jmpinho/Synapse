import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const colecaoConteudos = collection(db, "conteudos");

export async function buscarConteudos() {
  const snapshot = await getDocs(colecaoConteudos);
  const conteudos = snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  return conteudos.sort((a, b) =>
    (b.criadoEm ?? "").localeCompare(a.criadoEm ?? "")
  );
}

export async function criarConteudo(novoConteudo) {
  const dadosConteudo = {
    ...novoConteudo,
    criadoEm: new Date().toISOString(),
  };
  const referencia = await addDoc(colecaoConteudos, dadosConteudo);
  return { id: referencia.id, ...dadosConteudo };
}

export function deletarConteudo(id) {
  return deleteDoc(doc(db, "conteudos", id));
}
