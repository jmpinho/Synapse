import { useState, useCallback } from "react";
import { TarefaAtivaContext } from "./TarefaAtivaContext";

export function TarefaAtivaProvider({ children }) {
  const [tarefaAtiva, setTarefaAtiva] = useState(null);

  const definirTarefaAtiva = useCallback((tarefa) => {
    setTarefaAtiva({ id: tarefa.id, titulo: tarefa.titulo });
  }, []);

  const limparTarefaAtiva = useCallback(() => {
    setTarefaAtiva(null);
  }, []);

  return (
    <TarefaAtivaContext.Provider
      value={{ tarefaAtiva, definirTarefaAtiva, limparTarefaAtiva }}
    >
      {children}
    </TarefaAtivaContext.Provider>
  );
}
