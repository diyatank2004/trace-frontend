import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import TeamPage from './TeamPage';
import KanbanPage from './KanbanPage';
import FloatingAIBot from './FloatingAIBot';
import BacklogPage from './BacklogPage';
import SprintPage from './SprintPage';
import TeamChatPage from './TeamChatPage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Bell,
  Calendar,
  FolderKanban,
  FolderOpen,
  ChevronDown,
  CheckCircle2,
  LogOut,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  UserPlus,
  FolderPlus,
} from 'lucide-react';
import {
  buildWorkspacePath,
  getDefaultProjectSlug,
  getProjectBySlug,
  NAV_ITEMS,
  PROJECTS,
  parseWorkspacePath,
  type ProjectData,
  type WorkspaceView,
} from '../lib/projectData';


interface DashboardProps {
  workspace: {
    workspaceName: string;
    workspaceKey: string;
    employeeId: string;
  };
  token?: string;
  onLogout: () => void;
}

interface EmployeeProjectSummary {
  project_id: string;
  project_name: string;
  project_key: string;
  slug: string;
  user_role_in_project: string;
  user_designation: string;
}

const buildProjectSlug = (projectName: string) =>
  projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const Dashboard: React.FC<DashboardProps> = ({ workspace, token, onLogout }) => {
  const [route, setRoute] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        projectSlug: getDefaultProjectSlug(
          workspace.workspaceName,
          workspace.workspaceKey
        ),
        view: 'dashboard' as WorkspaceView,
      };
    }

    const parsed = parseWorkspacePath(window.location.pathname);
    const safeSlug = getProjectBySlug(parsed.projectSlug)
      ? parsed.projectSlug
      : getDefaultProjectSlug(workspace.workspaceName, workspace.workspaceKey);

    return { projectSlug: safeSlug, view: parsed.view };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [projectActionsOpen, setProjectActionsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [employeeProjects, setEmployeeProjects] = useState<EmployeeProjectSummary[]>([]);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberStatus, setMemberStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [memberForm, setMemberForm] = useState({
    employeeId: '',
    designation: 'Developer',
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectStatus, setProjectStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [projectForm, setProjectForm] = useState({
    projectName: '',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const notifications = [
    {
      id: 1,
      title: 'Task Assigned',
      message: 'TRACE-12 has been assigned to you.',
      time: '2 min ago',
    },
    {
      id: 2,
      title: 'Status Updated',
      message: 'TRACE-4 moved to Testing.',
      time: '10 min ago',
    },
    {
      id: 3,
      title: 'Member Joined',
      message: 'Priya joined Team Tej.',
      time: '30 min ago',
    },
  ];

  const searchRef = useRef<HTMLInputElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const workspaceProject = useMemo(
    () => employeeProjects.find((project) => project.project_id === workspace.workspaceKey) ?? null,
    [employeeProjects, workspace.workspaceKey]
  );

  const routeProject = useMemo(
    () => employeeProjects.find((project) => project.slug === route.projectSlug) ?? null,
    [employeeProjects, route.projectSlug]
  );

  const activeProject = routeProject ?? workspaceProject ?? employeeProjects[0] ?? null;
  const roleString = String(activeProject?.user_role_in_project ?? 'Member').toLowerCase();
  const canManageMembers = roleString.includes('team') && roleString.includes('leader');

  const currentProject = useMemo(() => {
    const currentProjectSlug = activeProject?.slug ?? route.projectSlug;
    const matchedProject = getProjectBySlug(currentProjectSlug);

    if (matchedProject) {
      return matchedProject;
    }

    const fallbackName = activeProject?.project_name ?? workspace.workspaceName;
    const fallbackKey = activeProject?.project_key ?? workspace.workspaceKey;

    return {
      slug: currentProjectSlug as ProjectData['slug'],
      projectLabel: 'Current Project',
      name: fallbackName,
      key: fallbackKey,
      description: 'Workspace overview and team collaboration.',
      members: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        backlogTasks: 0,
      },
      recentActivity: [],
      accentClass: 'from-blue-500 to-cyan-400',
    };
  }, [activeProject, route.projectSlug, workspace.workspaceKey, workspace.workspaceName]);

  const sidebarProjects = useMemo(() => {
    if (employeeProjects.length > 0) {
      return employeeProjects;
    }

    return PROJECTS.map((project) => ({
      project_id: project.slug,
      project_name: project.name,
      project_key: project.key,
      slug: project.slug,
      user_role_in_project: 'Member',
      user_designation: 'Not Assigned',
    }));
  }, [employeeProjects]);

  const progress = Math.round(
    currentProject.stats.totalTasks > 0
      ? (currentProject.stats.completedTasks / currentProject.stats.totalTasks) *
        100
      : 0
  );

  const handleAddMemberSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeProject?.project_id) {
      setMemberStatus({ kind: 'error', text: 'Select a project before adding members.' });
      return;
    }

    setMemberStatus(null);
    setIsAddingMember(true);

    try {
      const res = await fetch('http://localhost:8000/projects/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          project_id: activeProject.project_id,
          employee_id: memberForm.employeeId.trim(),
          designation: memberForm.designation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Unable to add member to project.');
      }

      setMemberStatus({ kind: 'success', text: data.message || 'Member added to the project.' });
      setMemberForm({ employeeId: '', designation: 'Developer' });
    } catch (error: any) {
      setMemberStatus({ kind: 'error', text: error.message || 'Unable to add member to project.' });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleCreateProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!projectForm.projectName.trim()) {
      setProjectStatus({ kind: 'error', text: 'Enter a project name to continue.' });
      return;
    }

    setProjectStatus(null);
    setIsCreatingProject(true);

    try {
      const slug = buildProjectSlug(projectForm.projectName);
      const res = await fetch('http://localhost:8000/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: projectForm.projectName.trim(),
          slug,
          employee_id: workspace.employeeId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Unable to create project.');
      }

      const createdProject = {
        project_id: data.id || data.project_id || slug,
        project_name: data.name || projectForm.projectName.trim(),
        project_key: data.project_key || '',
        slug: data.slug || slug,
        user_role_in_project: 'Team Leader',
        user_designation: 'Product Manager',
      };

      setEmployeeProjects((currentProjects) => {
        const nextProjects = currentProjects.filter((project) => project.slug !== createdProject.slug);
        return [createdProject, ...nextProjects];
      });
      setProjectStatus({ kind: 'success', text: 'Project created successfully. Redirecting to the new workspace.' });
      setProjectForm({ projectName: '' });
      navigateTo(createdProject.slug as ProjectData['slug'], 'dashboard', true);
    } catch (error: any) {
      setProjectStatus({ kind: 'error', text: error.message || 'Unable to create project.' });
    } finally {
      setIsCreatingProject(false);
    }
  };

  useEffect(() => {
    const loadEmployeeProjects = async () => {
      if (!workspace.employeeId) return;

      try {
        const res = await fetch(
          `http://localhost:8000/projects/dashboard/${encodeURIComponent(workspace.employeeId)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await res.json();
        if (res.ok && Array.isArray(data.active_projects)) {
          // Normalize different backend shapes so `project_id`, `slug`, and role are available
          const normalized = data.active_projects.map((p: any) => {
            const projectName = p.project_name ?? p.name ?? p.title ?? workspace.workspaceName;
            return {
              project_id: p.project_id ?? p.id ?? p.projectId ?? '',
              project_name: projectName,
              project_key: p.project_key ?? p.key ?? p.project_key ?? workspace.workspaceKey,
              slug: p.slug ?? buildProjectSlug(projectName),
              user_role_in_project: (p.user_role_in_project ?? p.user_role ?? p.role ?? 'Member'),
              user_designation: p.user_designation ?? p.user_designation ?? p.designation ?? 'Not Assigned',
            } as EmployeeProjectSummary;
          });

          setEmployeeProjects(normalized);
        } else {
          setEmployeeProjects([]);
        }
      } catch {
        setEmployeeProjects([]);
      }
    };

    loadEmployeeProjects();
  }, [workspace.employeeId]);

  useEffect(() => {
    if (!employeeProjects.length) return;

    const routeMatch = employeeProjects.find((project) => project.slug === route.projectSlug);
    if (routeMatch) return;

    const preferredProject = workspaceProject ?? employeeProjects[0];

    if (preferredProject?.slug && preferredProject.slug !== route.projectSlug) {
      const nextPath = buildWorkspacePath(preferredProject.slug as ProjectData['slug'], route.view);

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', nextPath);
      }

      setRoute({
        projectSlug: preferredProject.slug as ProjectData['slug'],
        view: route.view,
      });
    }
  }, [employeeProjects, route.projectSlug, route.view, workspaceProject]);

  const navigateTo = (
    projectSlug: ProjectData['slug'],
    view: WorkspaceView,
    replace = false
  ) => {
    const nextPath = buildWorkspacePath(projectSlug, view);

    if (typeof window !== 'undefined') {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', nextPath);
    }

    setRoute({ projectSlug, view });
    setProfileOpen(false);
    setProjectActionsOpen(false);
  };

  useEffect(() => {
    const onPopState = () => {
      if (typeof window === 'undefined') return;

      const parsed = parseWorkspacePath(window.location.pathname);
      const safeSlug = getProjectBySlug(parsed.projectSlug)
        ? parsed.projectSlug
        : getDefaultProjectSlug(workspace.workspaceName, workspace.workspaceKey);

      setRoute({ projectSlug: safeSlug, view: parsed.view });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === 'Escape') {
        setProfileOpen(false);
        setProjectActionsOpen(false);
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [workspace.workspaceKey, workspace.workspaceName]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.location.pathname === '/' || window.location.pathname === '') {
      navigateTo(
        getDefaultProjectSlug(workspace.workspaceName, workspace.workspaceKey),
        'dashboard',
        true
      );
    }
  }, [workspace.workspaceKey, workspace.workspaceName]);

  const renderContent = () => {
    switch (route.view) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Overview
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                  {currentProject.name} <span className="text-slate-400 dark:text-slate-500">·</span> {currentProject.key}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {currentProject.description}
                </p>
              </div>

              <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm">
                /{currentProject.slug}/dashboard
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Tasks"
                value={currentProject.stats.totalTasks}
                icon={CheckCircle2}
                accent="text-blue-600"
              />
              <StatCard
                title="Completed"
                value={currentProject.stats.completedTasks}
                icon={TrendingUp}
                accent="text-emerald-600"
                progress={progress}
              />
              <StatCard
                title="In Progress"
                value={currentProject.stats.inProgressTasks}
                icon={AlertCircle}
                accent="text-amber-600"
              />
              <StatCard
                title="Team Members"
                value={currentProject.members.length}
                icon={Users}
                accent="text-cyan-600"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                      Activity Feed
                    </h2>
                    <p className="text-sm text-slate-500">
                      Recent work in {currentProject.name}
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-sky-500" />
                </div>

                <div className="mt-5 space-y-3">
                  {currentProject.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm"
                    >
                      <p className="text-sm text-slate-800">
                        <span className="font-semibold text-slate-950 dark:text-white">
                          {activity.user}
                        </span>{' '}
                        {activity.action}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {activity.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                      Team Snapshot
                    </h2>
                    <p className="text-sm text-slate-500">
                      People currently active on this project
                    </p>
                  </div>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>

                <div className="mt-5 space-y-3">
                  {currentProject.members.map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${currentProject.accentClass} text-sm font-bold text-white`}
                      >
                        {member.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          {member}
                        </p>
                        <p className="text-xs text-slate-500">
                          Project contributor
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Backlog
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {currentProject.stats.backlogTasks} items waiting in queue
                    for {currentProject.name}.
                  </p>
                </div>
              </section>
            </div>
          </motion.div>
        );

      case 'kanban':
        return (
          <KanbanPage
            projectId={activeProject?.project_id ?? null}
            projectName={currentProject.name}
            projectKey={currentProject.key}
            currentEmployeeId={workspace.employeeId}
          />
        );

      case 'backlog':
        return <BacklogPage />;

      case 'sprint':
        return (
          <SprintPage
            projectId={activeProject?.project_id ?? null}
            projectName={activeProject?.project_name ?? currentProject.name}
            projectKey={activeProject?.project_key ?? currentProject.key}
            projectSlug={currentProject.slug}
            onNavigate={(view) => navigateTo(currentProject.slug, view)}
          />
        );

      case 'chat':
        return <TeamChatPage />;

      

      case 'create-project':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Create Project
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                  Start a new workspace
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Create a new project from this employee account. The creator will be assigned as the team leader automatically.
                </p>
              </div>

              <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm">
                /{currentProject.slug}/create-project
              </div>
            </div>

            <section className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <form className="space-y-4" onSubmit={handleCreateProjectSubmit}>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Project Name
                  </label>
                  <input
                    value={projectForm.projectName}
                    onChange={(event) => setProjectForm({ projectName: event.target.value })}
                    placeholder="e.g. Trace Mobile Revamp"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Project Slug Preview
                    </p>
                    <p className="mt-2 font-mono text-sm text-slate-700 dark:text-slate-200">
                      {projectForm.projectName ? buildProjectSlug(projectForm.projectName) : 'project-slug'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Creator Employee ID
                    </p>
                    <p className="mt-2 font-mono text-sm text-slate-700 dark:text-slate-200">
                      {workspace.employeeId || 'Not available'}
                    </p>
                  </div>
                </div>

                {projectStatus ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      projectStatus.kind === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {projectStatus.text}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.96),rgba(14,165,233,0.96))] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FolderPlus className="h-4 w-4" />
                  {isCreatingProject ? 'Creating Project...' : 'Create Project'}
                </button>
              </form>
            </section>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)] dark:text-white">
      <aside className={`flex shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90 transition-width duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72 lg:w-80'}`}>
        <header className="relative flex-none border-b border-slate-200 px-4 py-4 dark:border-slate-700">
          <div className="flex flex-col gap-1.5">

            <div className="flex min-w-0 items-baseline gap-2">
              <h2 className="truncate text-lg font-bold text-slate-950 dark:text-white">
                {currentProject.name}
              </h2>
            </div>

            <p className="truncate text-xs text-slate-500">
              {activeProject?.project_key || currentProject.key} · {workspace.employeeId}
            </p>
          </div>

          <button
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setIsSidebarCollapsed((s) => !s)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-transform hover:scale-95"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-90' : '-rotate-90'}`} />
          </button>
        </header>

        <nav className="sidebar-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-gutter:stable]">
          <section className="flex flex-col gap-3">
            <div className="flex items-center px-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Primary Navigation
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = route.view === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => navigateTo(currentProject.slug, item.id)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex h-14 w-full items-center rounded-2xl border px-4 text-left transition-[background-color,color,box-shadow,transform] duration-200 ${
                      active
                        ? 'border-blue-200 bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                        : 'border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex w-full items-center justify-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70 text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700">
                        <Icon
                          className={`h-5 w-5 transition-colors ${
                            active ? 'text-blue-600' : 'text-slate-500'
                          }`}
                        />
                      </div>

                      {!isSidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold leading-5">
                            {item.label}
                          </p>
                          <p className="truncate text-xs leading-4 text-slate-500">
                            {item.hint}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center px-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Secondary Navigation
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {sidebarProjects.map((project) => {
                const active = project.slug === currentProject.slug;

                return (
                  <motion.button
                    key={project.project_id}
                    onClick={() => {
                      navigateTo(project.slug as ProjectData['slug'], 'dashboard');
                    }}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex h-14 w-full items-center rounded-2xl border px-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ${
                      active
                        ? 'border-blue-200 bg-blue-50 shadow-sm shadow-blue-100'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <FolderOpen className="h-5 w-5" />
                      </div>

                      {!isSidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            {project.project_key}
                          </p>
                          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                            {project.project_name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {project.user_role_in_project} · {project.user_designation}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center px-1">
              <Sparkles className="h-4 w-4 shrink-0 text-slate-500" />
              <p className="ml-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                Utility Actions
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {canManageMembers ? (
                <button
                  onClick={() => {
                    setMemberStatus(null);
                    setMemberModalOpen(true);
                  }}
                  className="flex h-14 w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50/50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700"
                >
                  <div className="flex w-full items-center justify-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100 dark:bg-slate-700 dark:text-cyan-300 dark:ring-slate-600">
                      <UserPlus className="h-4 w-4" />
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                          Add Members
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          Invite team members to the current project.
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ) : null}
              <button
                onClick={() => navigateTo(currentProject.slug, 'create-project')}
                className="flex h-14 w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left transition-all duration-200 hover:border-sky-200 hover:bg-sky-50/50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700"
              >
                <div className="flex w-full items-center justify-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 dark:bg-slate-700 dark:text-sky-300 dark:ring-slate-600">
                    <FolderPlus className="h-4 w-4" />
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                        Create Project
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        Start a new workspace from this account.
                      </p>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </section>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-5 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80">
          <div className="min-w-0 flex-1">
            <div className="relative mx-auto max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tasks, docs, and team notes"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-24 text-sm text-slate-950 dark:text-white outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Ctrl+K
              </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition hover:bg-slate-100"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-slate-700" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
            >
              <Bell className="h-4 w-4 text-slate-700" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <h3 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.message}
                        </p>
                        <p className="mt-2 text-[11px] text-slate-400">
                          {item.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-left transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                {(
                  workspace.employeeId
                    ? workspace.employeeId[0]
                    : workspace.workspaceName[0]
                ).toUpperCase()}
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 top-14 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl"
                >
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-100">
                    <Settings className="h-4 w-4 text-slate-500" />
                    Settings
                  </button>

                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto p-5 md:p-6">
        
          <AnimatePresence mode="wait">
            <motion.div
              key={`${route.projectSlug}-${route.view}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>
        {memberModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
            onClick={() => setMemberModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Team Leader Access
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                    Add member to project
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Project: {currentProject.name}
                  </p>
                </div>

                <button
                  onClick={() => setMemberModalOpen(false)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleAddMemberSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Employee ID
                    </label>
                    <input
                      value={memberForm.employeeId}
                      onChange={(event) => setMemberForm((current) => ({ ...current, employeeId: event.target.value }))}
                      placeholder="EMP-1024"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Designation
                    </label>
                    <select
                      value={memberForm.designation}
                      onChange={(event) => setMemberForm((current) => ({ ...current, designation: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="Developer">Developer</option>
                      <option value="Tester">Tester</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Product Manager">Product Manager</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Project Name
                  </p>
                  <p className="mt-2 font-mono text-sm text-slate-700 dark:text-slate-200">
                    {activeProject?.project_name ?? activeProject?.slug ?? 'No active project selected'}
                  </p>
                </div>

                {memberStatus ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      memberStatus.kind === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {memberStatus.text}
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isAddingMember}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.96),rgba(14,165,233,0.96))] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <UserPlus className="h-4 w-4" />
                    {isAddingMember ? 'Adding Member...' : 'Add Member'}
                  </button>

                  <p className="text-xs text-slate-500">
                    Only Team Leaders can add members to the current project.
                  </p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <FloatingAIBot />
    
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  accent,
  progress,
}) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
      </div>
      <Icon className={`h-8 w-8 ${accent}`} />
    </div>

    {typeof progress === 'number' ? (
      <div className="mt-4 h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(14,165,233,0.95))]"
          style={{ width: `${progress}%` }}
        />
      </div>
    ) : null}
  </section>
);

interface PlaceholderViewProps {
  project: ProjectData;
  title: string;
  subtitle: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  project,
  title,
  subtitle,
}) => (
  <div className="space-y-6">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {project.projectLabel}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
        {project.name} - {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm text-slate-500">
        This contextual view is tied to{' '}
        <span className="font-semibold text-slate-950 dark:text-white">
          /{project.slug}/{title.toLowerCase().replace(/\s+/g, '-')}
        </span>
        .
      </p>
    </div>
  </div>

);

export default Dashboard;
