import { createContext, useCallback, useContext, useState } from 'react';

/*
  TarefaAtivaContext.jsx
  -----------------------
  Guarda qual tarefa está "em foco" no momento — ou seja, qual tarefa o
  aluno está estudando agora. Tarefas.jsx e Pomodoro.jsx são componentes
  irmãos (nenhum é filho do outro), então a forma mais simples de os
  dois lerem/mudarem essa mesma informação é um Context, em vez de ficar
  passando prop por vários níveis (o que nem seria possível aqui, já que
  eles não têm relação de pai/filho).

  Guardamos só o essencial (id + título) — não a tarefa inteira — porque
  é só isso que o Pomodoro precisa pra exibir "Estudando: <título>" e
  pra saber pra qual id registrar a sessão de estudo.
*/

const TarefaAtivaContext = createContext(null);

export function TarefaAtivaProvider({ children }) {
  // null = nenhuma tarefa selecionada pra estudar agora.
  const [tarefaAtiva, setTarefaAtiva] = useState(null);

  const definirTarefaAtiva = useCallback((tarefa) => {
    setTarefaAtiva({ id: tarefa.id, titulo: tarefa.titulo });
  }, []);

  const limparTarefaAtiva = useCallback(() => {
    setTarefaAtiva(null);
  }, []);

  return (
    <TarefaAtivaContext.Provider value={{ tarefaAtiva, definirTarefaAtiva, limparTarefaAtiva }}>
      {children}
    </TarefaAtivaContext.Provider>
  );
}

/**
 * Hook de conveniência — em vez de todo componente importar
 * "useContext" e "TarefaAtivaContext" separadamente.
 */
export function useTarefaAtiva() {
  const contexto = useContext(TarefaAtivaContext);

  if (!contexto) {
    throw new Error('useTarefaAtiva precisa ser usado dentro de um <TarefaAtivaProvider>');
  }

  return contexto;
}
