export function paraISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function gerarGradeMensal(mesReferencia) {
  const ano = mesReferencia.getFullYear();
  const mes = mesReferencia.getMonth();

  const primeiroDiaDoMes = new Date(ano, mes, 1);
  const diaDaSemanaInicial = primeiroDiaDoMes.getDay(); // 0 = domingo

  const inicioDaGrade = new Date(ano, mes, 1 - diaDaSemanaInicial);
  const hojeISO = paraISO(new Date());

  return Array.from({ length: 42 }, (_, indice) => {
    const data = new Date(inicioDaGrade);
    data.setDate(inicioDaGrade.getDate() + indice);
    const iso = paraISO(data);

    return {
      iso,
      dia: data.getDate(),
      noMesAtual: data.getMonth() === mes,
      ehHoje: iso === hojeISO,
    };
  });
}

export function agruparPorDia(eventos) {
  return eventos.reduce((acumulado, evento) => {
    const lista = acumulado[evento.data] ?? [];
    acumulado[evento.data] = [...lista, evento];
    return acumulado;
  }, {});
}

export function formatarMesAno(data) {
  const texto = data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatarDiaCompleto(iso) {
  const texto = new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
