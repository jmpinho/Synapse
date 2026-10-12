const MS_POR_DIA = 1000 * 60 * 60 * 24;

/**
 *
 * @param {{ data: string, concluido: boolean }} evento
 * @returns {'atrasado' | 'hoje' | 'futuro'}
 */
export function calcularSituacao({ data, concluido }) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataEvento = new Date(data + 'T00:00:00');
  const diasRestantes = Math.round((dataEvento - hoje) / MS_POR_DIA);

  if (diasRestantes < 0) return concluido ? 'futuro' : 'atrasado';
  if (diasRestantes === 0) return 'hoje';
  return 'futuro';
}

/**
 *
 * @param {Array<{data: string, concluido: boolean}>} eventos
 */
export function agruparPorSituacao(eventos) {
  const comSituacao = eventos.map((evento) => ({
    ...evento,
    situacao: calcularSituacao(evento),
  }));

  const porData = (a, b) => new Date(a.data) - new Date(b.data);

  return {
    atrasados: comSituacao.filter((e) => e.situacao === 'atrasado').sort(porData),
    hoje: comSituacao.filter((e) => e.situacao === 'hoje').sort(porData),
    futuros: comSituacao.filter((e) => e.situacao === 'futuro').sort(porData),
  };
}
