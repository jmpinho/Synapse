const PESOS = {
  urgencia: 0.5,
  dificuldade: 0.25,
  conteudo: 0.25,
};

const LIMITE_MEDIA = 4;
const LIMITE_ALTA = 7;

const MS_POR_DIA = 1000 * 60 * 60 * 24;

function calcularNotaUrgencia(dataEntrega) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const entrega = new Date(dataEntrega);
  entrega.setHours(0, 0, 0, 0);

  const diasRestantes = Math.round((entrega - hoje) / MS_POR_DIA);

  const JANELA_DIAS = 10; // a partir de quantos dias a urgência já é zero
  const nota = 10 - (diasRestantes / JANELA_DIAS) * 10;

  return Math.max(0, Math.min(10, nota));
}

function converterEscala1a5Para0a10(valor) {
  return (valor - 1) * 2.5;
}

/**
 * @param {Object} parametros
 * @param {string|Date} parametros.dataEntrega
 * @param {number} parametros.dificuldade
 * @param {number} parametros.quantidadeConteudo
 * @returns {{ pontuacao: number, nivel: 'baixa' | 'media' | 'alta' }}
 */
export function calcularPrioridade({
  dataEntrega,
  dificuldade,
  quantidadeConteudo,
}) {
  const notaUrgencia = calcularNotaUrgencia(dataEntrega);
  const notaDificuldade = converterEscala1a5Para0a10(dificuldade);
  const notaConteudo = converterEscala1a5Para0a10(quantidadeConteudo);

  const pontuacao =
    notaUrgencia * PESOS.urgencia +
    notaDificuldade * PESOS.dificuldade +
    notaConteudo * PESOS.conteudo;

  let nivel = "baixa";
  if (pontuacao >= LIMITE_ALTA) {
    nivel = "alta";
  } else if (pontuacao >= LIMITE_MEDIA) {
    nivel = "media";
  }

  return { pontuacao: Math.round(pontuacao * 10) / 10, nivel };
}

const LIMITE_URGENCIA = 5;
const LIMITE_IMPORTANCIA = 5;

/**
 * @returns {'fazer' | 'planejar' | 'delegar' | 'eliminar'}
 */
export function calcularQuadranteEisenhower({
  dataEntrega,
  dificuldade,
  quantidadeConteudo,
}) {
  const notaUrgencia = calcularNotaUrgencia(dataEntrega);
  const notaImportancia =
    (converterEscala1a5Para0a10(dificuldade) +
      converterEscala1a5Para0a10(quantidadeConteudo)) /
    2;

  const urgente = notaUrgencia >= LIMITE_URGENCIA;
  const importante = notaImportancia >= LIMITE_IMPORTANCIA;

  if (urgente && importante) return "fazer";
  if (!urgente && importante) return "planejar";
  if (urgente && !importante) return "delegar";
  return "eliminar";
}
