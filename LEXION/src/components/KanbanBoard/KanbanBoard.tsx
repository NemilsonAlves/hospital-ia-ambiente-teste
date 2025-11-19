import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: KanbanTask[];
}

interface SortableTaskProps {
  task: KanbanTask;
  columnId: string;
}

const SortableTask: React.FC<SortableTaskProps> = ({ task, columnId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-600', label: 'Baixa' },
    medium: { color: 'bg-orange-100 text-orange-600', label: 'Média' },
    high: { color: 'bg-red-100 text-red-600', label: 'Alta' },
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-inter font-medium text-gray-900 text-sm">
            {task.title}
          </h4>
          {task.priority && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[task.priority].color}`}>
              {priorityConfig[task.priority].label}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2 font-inter">
            {task.description}
          </p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.assignee && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span className="font-inter">{task.assignee}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span className="font-inter">{task.dueDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function DroppableColumn({ columnId, children }: { columnId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${columnId}`, data: { columnId } });
  return (
    <div ref={setNodeRef} className={`space-y-3 min-h-32 ${isOver ? 'ring-2 ring-lexiom-primary/50 rounded' : ''}`}>{children}</div>
  );
}

interface KanbanBoardProps {
  columns?: KanbanColumn[];
  mode?: 'api' | 'local';
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns: initialColumns,
  mode = 'api',
}) => {
  const [columns, setColumns] = useState<KanbanColumn[]>(
    initialColumns || [
      {
        id: 'todo',
        title: 'A Fazer',
        color: 'bg-gray-100',
        tasks: [
          {
            id: '1',
            title: 'Elaborar petição inicial',
            description: 'Preparar petição para ação de indenização',
            assignee: 'Dr. Silva',
            dueDate: '20/12',
            priority: 'high',
            tags: ['Petição', 'Indenização'],
          },
          {
            id: '2',
            title: 'Analisar contrato',
            description: 'Revisar cláusulas do contrato de locação',
            assignee: 'Dra. Santos',
            dueDate: '22/12',
            priority: 'medium',
            tags: ['Contrato', 'Análise'],
          },
        ],
      },
      {
        id: 'in-progress',
        title: 'Em Andamento',
        color: 'bg-blue-100',
        tasks: [
          {
            id: '3',
            title: 'Protocolar documentos',
            description: 'Entregar documentação no cartório',
            assignee: 'Dr. Oliveira',
            dueDate: '18/12',
            priority: 'high',
            tags: ['Protocolo'],
          },
        ],
      },
      {
        id: 'review',
        title: 'Em Revisão',
        color: 'bg-yellow-100',
        tasks: [
          {
            id: '4',
            title: 'Revisar peça processual',
            description: 'Conferir peça antes do protocolo',
            assignee: 'Dr. Silva',
            dueDate: '19/12',
            priority: 'medium',
            tags: ['Revisão', 'Peça'],
          },
        ],
      },
      {
        id: 'done',
        title: 'Concluído',
        color: 'bg-green-100',
        tasks: [
          {
            id: '5',
            title: 'Realizar audiência',
            description: 'Audiência de conciliação realizada',
            assignee: 'Dra. Santos',
            dueDate: '15/12',
            priority: 'low',
            tags: ['Audiência'],
          },
        ],
      },
    ]
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const LOCAL_STORAGE_KEY = 'kanban_local_board_v1';

  function formatDate(d: Date) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  }

  const generateLocalBoard = React.useCallback((): KanbanColumn[] => {
    const titles = ['Implementar login', 'Testar API', 'Configurar CI', 'Criar cadastro de clientes', 'Refatorar autenticação', 'Corrigir bug de sessão', 'Documentar endpoints', 'Ajustar layout responsivo'];
    const desc = [
      'Definir fluxo completo de autenticação com validação. Garantir recuperação de senha e bloqueio de tentativas.',
      'Criar casos de teste para rotas públicas e privadas. Assegurar tratamento de erros e limites de payload.',
      'Configurar pipeline com build, lint e testes. Integrar notificações em falhas e regras de qualidade.',
      'Implementar formulário e validação de dados. Salvar registros e listar com paginação simples.',
      'Simplificar middleware de autenticação e roles. Remover duplicações e melhorar legibilidade.',
      'Investigar problema de expiração de sessão. Ajustar renovação de token e feedback ao usuário.',
      'Escrever documentação dos endpoints principais. Detalhar parâmetros, respostas e exemplos claros.',
      'Padronizar espaçamentos e tipografia. Garantir responsividade em telas médias e pequenas.'
    ];
    const people = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Eduarda Alves'];
    const priorities: KanbanTask['priority'][] = ['low', 'medium', 'high', 'medium', 'low'];
    const now = new Date();
    const tasks: KanbanTask[] = Array.from({ length: 5 }).map((_, i) => {
      const due = new Date(now.getTime());
      due.setDate(now.getDate() + (i + 2));
      return {
        id: `t-${i + 1}`,
        title: titles[i],
        description: `${desc[i]}. ${desc[(i + 3) % desc.length]}.`,
        assignee: people[i % people.length],
        dueDate: formatDate(due),
        priority: priorities[i],
        tags: ['Projeto']
      };
    });
    const todo = { id: 'todo', title: 'A Fazer', color: 'bg-gray-100', tasks: [tasks[0], tasks[1]] };
    const inProgress = { id: 'in-progress', title: 'Em Progresso', color: 'bg-blue-100', tasks: [tasks[2], tasks[3]] };
    const done = { id: 'done', title: 'Concluído', color: 'bg-green-100', tasks: [tasks[4]] };
    return [todo, inProgress, done];
  }, []);

  function saveLocalBoard(cols: KanbanColumn[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cols));
    } catch (e) {
      console.error('[KANBAN] Falha ao salvar no localStorage:', (e as { message?: string })?.message || e);
    }
  }

  

  const loadBoard = React.useCallback(async () => {
    try {
      setLoading(true);
      if (typeof performance !== 'undefined' && performance.mark) performance.mark('kanban_load_start');
      if (mode === 'local') {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as KanbanColumn[];
            if (Array.isArray(parsed) && parsed.length >= 3) {
              setColumns(parsed);
            } else {
              const gen = generateLocalBoard();
              setColumns(gen);
              saveLocalBoard(gen);
            }
          } else {
            const gen = generateLocalBoard();
            setColumns(gen);
            saveLocalBoard(gen);
          }
        } catch {
          const gen = generateLocalBoard();
          setColumns(gen);
          saveLocalBoard(gen);
        }
      } else {
        const res = await api('/kanban/board');
        const board = (res.board || res) as { stages?: Array<{ key: string; title: string; cards: Array<{ id: string | number; title: string; owner_name?: string }> }> };
        const stages = Array.isArray(board?.stages) ? board.stages : [];
        const mapped: KanbanColumn[] = stages.map((s) => ({
          id: s.key,
          title: s.title,
          color: 'bg-gray-100',
          tasks: (s.cards || []).map((c) => ({
            id: String(c.id),
            title: c.title,
            assignee: c.owner_name,
          })),
        }));
        if (mapped.length > 0) setColumns(mapped);
      }
      setHasLoaded(true);
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('kanban_load_end');
        if (performance.measure) {
          const m = performance.measure('kanban_load', 'kanban_load_start', 'kanban_load_end');
          console.log('[KANBAN] Load duration (ms):', m.duration);
        }
      }
    } catch (e) {
      console.error('[KANBAN] Falha ao carregar board:', (e as { message?: string })?.message || e);
    }
    finally {
      setLoading(false);
    }
  }, [mode, generateLocalBoard]);

  useEffect(() => {
    loadBoard();
  }, [mode, loadBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const activeTask = activeData.task;
    const activeColumnId = activeData.columnId;
    const overColumnId = overData.columnId || (typeof over.id === 'string' && over.id.startsWith('column-') ? over.id.replace('column-','') : over.id);

    if (activeColumnId !== overColumnId) {
      try {
        if (mode === 'local') {
          const next = columns.map(c => ({ ...c }));
          const from = next.find(c => c.id === activeColumnId);
          const to = next.find(c => c.id === overColumnId);
          if (!from || !to) throw new Error('Coluna inválida');
          const idx = from.tasks.findIndex(t => t.id === activeTask.id);
          if (idx === -1) throw new Error('Tarefa não encontrada');
          const [task] = from.tasks.splice(idx, 1);
          to.tasks.push(task);
          setColumns(next);
          saveLocalBoard(next);
        } else {
          await api('/kanban/move', {
            method: 'POST',
            body: JSON.stringify({ process_id: activeTask.id, from_stage: activeColumnId, to_stage: overColumnId }),
          });
          await loadBoard();
        }
      } catch (e) {
        console.error('[KANBAN] Falha ao mover cartão:', (e as { message?: string })?.message || e);
      }
    }

    setActiveId(null);
  };

  const activeTask = columns
    .flatMap(col => col.tasks)
    .find(task => task.id === activeId);

  return (
    <div className="bg-lexiom-background p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-soehne font-bold text-lexiom-text">
          Quadro Kanban
        </h2>
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>Arraste para reorganizar</span>
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-lexiom-primary" />
          <span className="ml-2 text-sm text-gray-600 font-inter">Carregando quadro…</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className={`p-3 rounded-lg ${column.color}`}>
                <h3 className="font-soehne font-semibold text-gray-800 text-center">
                  {column.title}
                </h3>
                <p className="text-center text-sm text-gray-600 font-inter mt-1">
                  {column.tasks.length} tarefas
                </p>
              </div>
              
              <SortableContext items={column.tasks.map(task => task.id)}>
                <DroppableColumn columnId={column.id}>
                  {column.tasks.map((task) => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      columnId={column.id}
                    />
                  ))}
                </DroppableColumn>
              </SortableContext>
            </div>
          ))}
        </div>

        {hasLoaded && columns.reduce((sum, c) => sum + c.tasks.length, 0) === 0 && !loading && (
          <div className="mt-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-soehne font-semibold text-gray-800">Nenhuma tarefa encontrada</div>
              <div className="text-sm text-gray-600 font-inter mt-1">Crie um processo ou mova cartões para iniciar seu fluxo.</div>
            </div>
          </div>
        )}

        <DragOverlay>
          {activeTask && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xl">
              <h4 className="font-inter font-medium text-gray-900 text-sm mb-2">
                {activeTask.title}
              </h4>
              {activeTask.description && (
                <p className="text-xs text-gray-600 line-clamp-2 font-inter">
                  {activeTask.description}
                </p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

interface SimpleBoardStage {
  key: string;
  title: string;
  cards: Array<{ id: string | number; title: string; owner_name?: string }>;
}

interface SimpleBoard {
  stages: SimpleBoardStage[];
}

export function SimpleKanbanBoard({ board, onMove }: { board: SimpleBoard; onMove: (cardId: string | number, fromKey: string, toKey: string) => void }) {
  return (
    <div className="flex gap-4">
      {board.stages.map((stage) => (
        <div key={stage.key} className="w-80 bg-lexiom-background p-3 rounded">
          <h4 className="font-soehne font-semibold text-lexiom-text">{stage.title}</h4>
          <div className="mt-3 space-y-3">
            {stage.cards.map((card) => (
              <div key={card.id} className="bg-white p-3 rounded border border-gray-200">
                <div className="font-inter font-semibold text-gray-900">{card.title}</div>
                <div className="text-sm text-gray-600 font-inter">Responsável: {card.owner_name}</div>
                <div className="mt-2 flex gap-2">
                  {board.stages.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => onMove(card.id, stage.key, s.key)}
                      className="text-xs px-2 py-1 border rounded"
                    >
                      {s.key === stage.key ? '—' : 'Mover para ' + s.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
