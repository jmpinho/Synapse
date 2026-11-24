import { motion, useTransform } from "framer-motion";
import { mulberry32 } from "./utilitarios";


const LARGURA = 1440;
const ALTURA = 520;
const TONS_JANELA = ["rosa", "lavanda", "ambar"];

const TORRES = [
  { x: 300, w: 78, h: 330, tipo: "espiral" },
  { x: 930, w: 70, h: 375, tipo: "espiral" },
  { x: 1190, w: 92, h: 200, tipo: "trapezio" },
];

const CAMADAS = [
  {
    id: "fundo",
    semente: 7,
    altMin: 80,
    altMax: 220,
    largMin: 40,
    largMax: 90,
    janelas: false,
    linhas: true,
    densidade: 0,
    cores: ["#5a47c9", "#2b2183"],
    opacidade: 0.7,
    mouse: 6, 
    rolagem: 70,
  },
  {
    id: "meio",
    semente: 21,
    altMin: 120,
    altMax: 270,
    largMin: 50,
    largMax: 110,
    janelas: true,
    linhas: true,
    densidade: 0.13,
    cores: ["#8465e6", "#3a2a9a"],
    opacidade: 1,
    mouse: 16,
    rolagem: 45,
    torres: TORRES,
  },
  {
    id: "frente",
    semente: 42,
    altMin: 50,
    altMax: 150,
    largMin: 90,
    largMax: 190,
    janelas: true,
    linhas: false,
    densidade: 0.16,
    cores: ["#a58bfa", "#4631b8"],
    opacidade: 1,
    mouse: 32,
    rolagem: 20,
  },
].map(gerarCamada);

function gerarCamada(config) {
  const aleatorio = mulberry32(config.semente);
  const predios = [];
  const janelas = [];
  let x = -30;

  while (x < LARGURA + 30) {
    const w = config.largMin + aleatorio() * (config.largMax - config.largMin);
    const h = config.altMin + aleatorio() * (config.altMax - config.altMin);
    const topo = ALTURA - h;

    predios.push({
      x,
      w,
      h,
      topo,
      linhas: config.linhas ? Math.floor(aleatorio() * 4) : 0,
      antena: aleatorio() < 0.18 ? 14 + aleatorio() * 22 : 0,
      degrau: aleatorio() < 0.35,
    });

    if (config.janelas) {
      const colunas = Math.max(1, Math.floor((w - 12) / 13));
      const fileiras = Math.max(1, Math.floor((h - 24) / 17));
      for (let i = 0; i < colunas; i++) {
        for (let j = 0; j < fileiras; j++) {
          if (aleatorio() < config.densidade) {
            janelas.push({
              x: x + 7 + i * 13,
              y: topo + 12 + j * 17,
              tom: TONS_JANELA[Math.floor(aleatorio() * 3)],
              pisca: aleatorio() < 0.4,
              atraso: (aleatorio() * 6).toFixed(2),
              duracao: (2.5 + aleatorio() * 4).toFixed(2),
            });
          }
        }
      }
    }
    x += w + (aleatorio() * 8 - 2);
  }
  return { ...config, predios, janelas };
}

function Torre({ torre, indice, gradiente }) {
  const { x, w, h, tipo } = torre;
  const esquerda = x - w / 2;
  const direita = x + w / 2;
  const idCorte = `landing-corte-${indice}`;

  const forma =
    tipo === "espiral"
      ? `M${esquerda},${ALTURA} L${esquerda},${ALTURA - h + 70} Q${esquerda},${ALTURA - h} ${x},${ALTURA - h} Q${direita},${ALTURA - h} ${direita},${ALTURA - h + 70} L${direita},${ALTURA}Z`
      : `M${esquerda},${ALTURA} L${x - w * 0.3},${ALTURA - h} L${x + w * 0.3},${ALTURA - h} L${direita},${ALTURA}Z`;

  return (
    <g>
      <clipPath id={idCorte}>
        <path d={forma} />
      </clipPath>
      <path d={forma} fill={`url(#${gradiente})`} />
      <g clipPath={`url(#${idCorte})`}>
        {/* faixas diagonais que dão a sensação de torre "torcida" */}
        {Array.from({ length: tipo === "espiral" ? 8 : 3 }, (_, k) => {
          const y = ALTURA - 50 - k * (h / (tipo === "espiral" ? 8 : 3.4));
          return (
            <path
              key={k}
              d={`M${esquerda - 4},${y} Q${x},${y - 46} ${direita + 4},${y - 105}`}
              stroke="#241a73"
              strokeOpacity="0.5"
              strokeWidth="9"
              fill="none"
            />
          );
        })}
        {/* lado sombreado e fio de luz */}
        <rect
          x={x + w * 0.12}
          y={ALTURA - h}
          width={w}
          height={h}
          fill="#0d0d26"
          opacity="0.28"
        />
        <rect
          x={esquerda + w * 0.18}
          y={ALTURA - h}
          width="3"
          height={h}
          fill="#fff"
          opacity="0.2"
        />
      </g>
    </g>
  );
}

function Camada({ camada, x, progresso, reduzir }) {
  // Movimento horizontal (mouse) e vertical (rolagem) por camada = paralaxe
  const deslocX = useTransform(x, (v) => (reduzir ? 0 : v * camada.mouse));
  const deslocY = useTransform(progresso, [0, 1], [0, reduzir ? 0 : camada.rolagem]);
  const gid = `landing-grad-${camada.id}`;

  return (
    <motion.svg
      className="landing__camada"
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      preserveAspectRatio="xMidYMax slice"
      style={{ x: deslocX, y: deslocY, opacity: camada.opacidade }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={camada.cores[0]} />
          <stop offset="1" stopColor={camada.cores[1]} />
        </linearGradient>
        {camada.torres && (
          <linearGradient id="landing-grad-torre" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d2b6ff" />
            <stop offset="0.5" stopColor="#8a68ea" />
            <stop offset="1" stopColor="#3a2a9a" />
          </linearGradient>
        )}
      </defs>

      {camada.predios.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.topo} width={p.w} height={p.h + 2} fill={`url(#${gid})`} />
          <rect
            x={p.x + p.w * 0.62}
            y={p.topo}
            width={p.w * 0.38}
            height={p.h + 2}
            fill="#0d0d26"
            opacity="0.22"
          />
          {p.degrau && (
            <rect
              x={p.x + p.w * 0.18}
              y={p.topo - 12}
              width={p.w * 0.5}
              height="13"
              fill={`url(#${gid})`}
            />
          )}
          {p.antena > 0 && (
            <rect
              x={p.x + p.w * 0.5 - 1}
              y={p.topo - p.antena}
              width="2"
              height={p.antena}
              fill="#8f7be8"
              opacity="0.7"
            />
          )}
          {Array.from({ length: p.linhas }, (_, k) => (
            <rect
              key={k}
              x={p.x}
              y={p.topo + 10 + k * 9}
              width={p.w}
              height="1.5"
              fill="#fff"
              opacity="0.1"
            />
          ))}
        </g>
      ))}

      {camada.torres?.map((t, i) => (
        <Torre key={i} torre={t} indice={i} gradiente="landing-grad-torre" />
      ))}

      {camada.janelas.map((j, i) => (
        <rect
          key={i}
          className={
            `landing__janela landing__janela--${j.tom}` +
            (j.pisca ? " landing__janela--pisca" : "")
          }
          x={j.x}
          y={j.y}
          width="5"
          height="8"
          rx="1"
          style={
            j.pisca
              ? { animationDelay: `${j.atraso}s`, animationDuration: `${j.duracao}s` }
              : undefined
          }
        />
      ))}
    </motion.svg>
  );
}

export default function Cidade({ x, progresso, reduzir }) {
  return (
    <div className="landing__cidade" aria-hidden="true">
      {CAMADAS.map((camada) => (
        <Camada
          key={camada.id}
          camada={camada}
          x={x}
          progresso={progresso}
          reduzir={reduzir}
        />
      ))}
    </div>
  );
}
