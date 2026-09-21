import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const colecaoSessoes = collection(db, "sessoesEstudo");

export async function registrarSessao({ tarefaId, minutos }) {
  const dadosSessao = {
    tarefaId,
    minutos,
    concluidaEm: new Date().toISOString(),
  };
  const referencia = await addDoc(colecaoSessoes, dadosSessao);
  return { id: referencia.id, ...dadosSessao };
}

export async function listarSessoes() {
  const snapshot = await getDocs(colecaoSessoes);
  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export function somarMinutosPorTarefa(sessoes) {
  return sessoes.reduce((totais, sessao) => {
    const totalAtual = totais[sessao.tarefaId] ?? 0;
    return { ...totais, [sessao.tarefaId]: totalAtual + sessao.minutos };
  }, {});
}

export function somarMinutosDoDia(sessoes, diaISO) {
  return sessoes
    .filter((sessao) => sessao.concluidaEm.slice(0, 10) === diaISO)
    .reduce((total, sessao) => total + sessao.minutos, 0);
}
