import React, { useState } from 'react';

type TeamRole = 'Team Leader' | 'Developer' | 'Tester' | 'Designer' | 'Viewer';

type Member = {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  role: TeamRole;
};

const initialMembers: Member[] = [];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('Developer');

  const addMember = () => {
    if (!name || !employeeId || !email) {
      alert('Please fill all member details');
      return;
    }

    const newMember: Member = {
      id: Date.now(),
      name,
      employeeId,
      email,
      role,
    };

    setMembers([newMember, ...members]);

    setName('');
    setEmployeeId('');
    setEmail('');
    setRole('Developer');
  };

  const removeMember = (id: number) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Team Members</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage project members, employee IDs, and project roles.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Add Team Member</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          />

          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="Team Leader">Team Leader</option>
            <option value="Developer">Developer</option>
            <option value="Tester">Tester</option>
            <option value="Designer">Designer</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <button
          onClick={addMember}
          className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {member.name.charAt(0)}
                </div>

                <div>
                  <h3 className="font-bold text-slate-950">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.email}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Employee ID: {member.employeeId}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {member.role}
              </span>
            </div>

            <button
              onClick={() => removeMember(member.id)}
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              Remove Member
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}