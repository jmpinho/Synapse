const PESOS = {
  urgencia: 0.5,
  dificuldade: 0.25,
  conteudo: 0.25,
};

const LIMITE_MEDIA = 4;
const LIMITE_ALTA = 7;

const MS_POR_DIA = 1000 * 60 * 60 * 24;

/**
 * Converte a data de entrega em uma nota de urgência de 0 a 10.
 * - Prazo já vencido ou é hoje -> nota 10 (máxima urgência).
 * - 10 dias ou mais de prazo -> nota 0 (sem urgência).
 * - Entre 0 e 10 dias -> decresce linearmente.
 */
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

// Converte uma escala de 1 a 5 (dificuldade ou quantidade de conteúdo)
// para a escala de 0 a 10 usada no cálculo final.
function converterEscala1a5Para0a10(valor) {
  return (valor - 1) * 2.5;
}

/**
 * Calcula a prioridade de uma tarefa.
 *
 * @param {Object} parametros
 * @param {string|Date} parametros.dataEntrega - data limite da tarefa
 * @param {number} parametros.dificuldade - de 1 (fácil) a 5 (muito difícil)
 * @param {number} parametros.quantidadeConteudo - de 1 (pouco) a 5 (muito conteúdo)
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

const LIMITE_URGENCIA = 5; // nota de urgência (0-10): acima disso, a tarefa é "urgente"
const LIMITE_IMPORTANCIA = 5; // nota de importância (0-10): acima disso, é "importante"

/**
 * Classifica uma tarefa num quadrante da Matriz de Eisenhower, cruzando
 * urgência (prazo) com importância (dificuldade + quantidade de
 * conteúdo) — os mesmos três dados usados em calcularPrioridade(), só
 * que aqui como dois eixos separados em vez de uma nota só.
 *
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
