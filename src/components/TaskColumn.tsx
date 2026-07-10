import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useDroppable } from '@dnd-kit/core';

import TaskCard from './TaskCard';

type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

type Status =
  | 'todo'
  | 'inProgress'
  | 'testing'
  | 'devCompleted'
  | 'peerReview'
  | 'qaMove'
  | 'uatMove'
  | 'prodDeploy'
  | 'done';

type Task = {
  id: number;
  ticketKey: string;
  title: string;
  description: string;
  assignee: string;
  createdAt: string;
  priority: Priority;
};

type Props = {
  column: {
    key: Status;
    label: string;
  };

  tasks: Task[];

  moveTask: (
    taskId: number,
    fromColumn: Status,
    toColumn: Status
  ) => void;

  columns: {
    key: Status;
    label: string;
  }[];
  deleteTask: (
  taskId: number,
  column: Status
) => void;

startEdit: (task: Task) => void;
editingTaskId: number | null;

editTitle: string;

setEditTitle: React.Dispatch<
  React.SetStateAction<string>
>;

editPriority: Priority;

setEditPriority: React.Dispatch<
  React.SetStateAction<Priority>
>;

saveEdit: (
  taskId: number,
  column: Status
) => void;

setEditingTaskId: React.Dispatch<
  React.SetStateAction<number | null>
>;
setSelectedTask: (
  task: Task
) => void;

setDrawerOpen: (
  open: boolean
) => void;
};

export default function TaskColumn({
  column,
  tasks,
  moveTask,
  columns,
  deleteTask,
  startEdit,
  editingTaskId,
  editTitle,
  setEditTitle,
  editPriority,
  setEditPriority,
  saveEdit,
  setEditingTaskId,
setSelectedTask,
setDrawerOpen,
}: Props) {

  const { setNodeRef } = useDroppable({
    id: column.key,
  });

  return (
    <div
      ref={setNodeRef}
className="min-w-[320px] rounded-3xl border border-slate-300 bg-white p-5 shadow-2xl"    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
          {column.label}
        </h2>

        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
      <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
          {tasks.length > 0 ? (
            tasks.map((task) => (
         <TaskCard
  key={task.id}
  task={task}
  column={column.key}
  moveTask={moveTask}
  columns={columns}
  deleteTask={deleteTask}
  startEdit={startEdit}
  editingTaskId={editingTaskId}
editTitle={editTitle}
setEditTitle={setEditTitle}
editPriority={editPriority}
setEditPriority={setEditPriority}
saveEdit={saveEdit}
setEditingTaskId={setEditingTaskId}
setSelectedTask={setSelectedTask}
setDrawerOpen={setDrawerOpen}
/>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-5 text-center text-xs text-slate-500">
              No tasks available
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}