import { createContext, useContext } from "react";

export const TarefaAtivaContext = createContext(null);

export function useTarefaAtiva() {
  const contexto = useContext(TarefaAtivaContext);

  if (!contexto) {
    throw new Error(
      "useTarefaAtiva precisa ser usado dentro de um <TarefaAtivaProvider>"
    );
  }

  return contexto;
}
