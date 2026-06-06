import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  Priority,
  Status,
  Task,
} from './KanbanBoard';


type Props = {
  task: Task;
  column: Status;
  moveTask: (
    taskId: number,
    fromColumn: Status,
    toColumn: Status
  ) => void;
  columns: { key: Status; label: string }[];
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

export default function TaskCard({
  task,
  column,
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
}: Props)
{
const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
} = useSortable({
  id: task.id,
});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityClass = (
    taskPriority: Priority
  ) => {
    if (taskPriority === 'Urgent') {
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    }

    if (taskPriority === 'High') {
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    }

    if (taskPriority === 'Medium') {
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }

    return 'bg-slate-500/10 text-slate-300 border border-slate-500/20';
  };

  return (
    <div
      {...attributes}
  {...listeners}
      ref={setNodeRef}
      style={style}
onPointerUp={(e) => {
  setSelectedTask(task);
  setDrawerOpen(true);
}}
    
className="cursor-grab rounded-2xl border border-slate-300 bg-white p-4 shadow-xl active:cursor-grabbing dark:border-slate-700 dark:bg-[#111827]"    >
<div
 
  className="flex cursor-grab items-center justify-between"
>        <p className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-bold tracking-wide text-blue-400">
          {task.ticketKey}
        </p>

        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${getPriorityClass(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
      </div>
{editingTaskId === task.id ? (
  <>
    <input
      value={editTitle}
      onChange={(e) =>
        setEditTitle(e.target.value)
      }
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-[#0f172a] dark:text-white"
    />

    <select
      value={editPriority}
      onChange={(e) =>
        setEditPriority(
          e.target.value as Priority
        )
      }
      className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-[#0f172a] dark:text-white"
    >
      <option value="Low">
        Low Priority
      </option>

      <option value="Medium">
        Medium Priority
      </option>

      <option value="High">
        High Priority
      </option>

      <option value="Urgent">
        Urgent Priority
      </option>
    </select>

    <div className="mt-3 flex gap-2">

<button
  onPointerDown={(e) =>
    e.stopPropagation()
  }
  onPointerUp={(e) =>
    e.stopPropagation()
  }
  onClick={(e) => {
    e.stopPropagation();
    saveEdit(task.id, column);
  }}
  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
>
  Save
</button>

<button
  onPointerDown={(e) =>
    e.stopPropagation()
  }
  onPointerUp={(e) =>
    e.stopPropagation()
  }
  onClick={(e) => {
    e.stopPropagation();
    setEditingTaskId(null);
  }}
  className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
>
  Cancel
</button>
    </div>
  </>
) : (
  <>
    <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
      {task.title}
    </h3>

    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
      {task.description}
    </p>

    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-2">

        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-xs font-bold text-blue-400">
          {task.assignee.charAt(0)}
        </div>

        <span className="text-xs text-slate-700 dark:text-slate-300">
          {task.assignee}
        </span>

      </div>

      <span className="text-xs text-slate-700 dark:text-slate-400">
        {task.createdAt}
      </span>
    </div>

    <select
      value={column}
      onChange={(e) =>
        moveTask(
          task.id,
          column,
          e.target.value as Status
        )
      }
      className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#0f172a] dark:text-white"
    >
      {columns.map((col) => (
        <option
          key={col.key}
          value={col.key}
        >
          {col.label}
        </option>
      ))}
    </select>

    <div className="mt-4 flex gap-2">

      <button
  onPointerDown={(e) =>
    e.stopPropagation()
  }
  onPointerUp={(e) =>
    e.stopPropagation()
  }
  onClick={(e) => {
    e.stopPropagation();
    startEdit(task);
  }}
  className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
>
  Edit
</button>

   <button
  onPointerDown={(e) =>
    e.stopPropagation()
  }
  onPointerUp={(e) =>
    e.stopPropagation()
  }
  onClick={(e) => {
    e.stopPropagation();
    deleteTask(task.id, column);
  }}
  className="rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400"
>
  Delete
</button>

    </div>
  </>
)}


   </div>
  );
}