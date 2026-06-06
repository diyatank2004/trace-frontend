import React, { useState } from 'react';

type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

type BacklogItem = {
  id: number;
  title: string;
  description: string;
  priority: Priority;
};

const initialBacklog: BacklogItem[] = [
  {
    id: 1,
    title: 'Add notification system',
    description: 'Notify users when tasks are assigned or updated.',
    priority: 'High',
  },
  {
    id: 2,
    title: 'Create analytics dashboard',
    description: 'Show project progress and task completion reports.',
    priority: 'Medium',
  },
];

export default function BacklogPage() {
  const [items, setItems] = useState<BacklogItem[]>(initialBacklog);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');

  const addBacklogItem = () => {
    if (!title.trim()) {
      alert('Please enter backlog title');
      return;
    }

    const newItem: BacklogItem = {
      id: Date.now(),
      title,
      description,
      priority,
    };

    setItems([newItem, ...items]);
    setTitle('');
    setDescription('');
    setPriority('Medium');
  };

  const deleteBacklogItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const getPriorityClass = (value: Priority) => {
    if (value === 'Urgent') return 'bg-red-600 text-white';
    if (value === 'High') return 'bg-red-100 text-red-600';
    if (value === 'Medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Project Backlog</h1>
        <p className="mt-2 text-sm text-slate-500">
          Plan future tasks, ideas, bugs, and upcoming project work.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Add Backlog Item
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Backlog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          />

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Urgent">Urgent Priority</option>
          </select>
        </div>

        <button
          onClick={addBacklogItem}
          className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add to Backlog
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {item.description}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                  item.priority
                )}`}
              >
                {item.priority}
              </span>
            </div>

            <button
              onClick={() => deleteBacklogItem(item.id)}
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}