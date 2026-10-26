
import { useEffect, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  project: string;
  priority: "High" | "Medium" | "Low";
  status: "In progress" | "Done" | "To do";
  due: string;
};

type Project = {
  id: number;
  name: string;
  color: string;
  description: string;
  progress: number;
};

const initialTasks: Task[] = [
  { id: 1, title: "Finalize homepage redesign", project: "Website redesign", priority: "High", status: "In progress", due: "Today" },
  { id: 2, title: "Review mobile wireframes", project: "Mobile application", priority: "Medium", status: "To do", due: "Tomorrow" },
  { id: 3, title: "Prepare brand guidelines", project: "Brand identity", priority: "High", status: "Done", due: "Yesterday" },
  { id: 4, title: "Create social media assets", project: "Marketing launch", priority: "Low", status: "In progress", due: "Oct 28" },
  { id: 5, title: "Update component library", project: "Website redesign", priority: "Medium", status: "To do", due: "Oct 29" },
  { id: 6, title: "Test responsive layouts", project: "Mobile application", priority: "High", status: "To do", due: "Oct 30" },
];

const initialProjects: Project[] = [
  { id: 1, name: "Website redesign", color: "#a78bfa", description: "A fresh digital experience", progress: 72 },
  { id: 2, name: "Mobile application", color: "#60a5fa", description: "Mobile product experience", progress: 45 },
  { id: 3, name: "Brand identity", color: "#34d399", description: "Visual identity and guidelines", progress: 100 },
  { id: 4, name: "Marketing launch", color: "#fb923c", description: "Campaign planning and assets", progress: 28 },
];

const defaultProfile = {
  name: "User",
  email: "user@nexus.app",
  role: "Personal workspace",
};

const navItems = [
  { label: "Overview", icon: "◫" },
  { label: "My tasks", icon: "☷" },
  { label: "Projects", icon: "▣" },
  { label: "Board", icon: "▤" },
  { label: "Calendar", icon: "▦" },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [profile, setProfile] = useState(() =>
    readStorage("nexus-profile", defaultProfile)
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    readStorage("nexus-tasks", initialTasks)
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    readStorage("nexus-projects", initialProjects)
  );
  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskProject, setTaskProject] = useState("Website redesign");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("Medium");
  const [taskDue, setTaskDue] = useState("Today");
  const [profileDraft, setProfileDraft] = useState(profile);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState("#a78bfa");
  const [projectFilter, setProjectFilter] = useState("All");

  useEffect(() => {
    localStorage.setItem("nexus-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("nexus-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("nexus-projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("nexus-search")?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        openNewTask();
      }
      if (event.key === "Escape") {
        setProfileOpen(false);
        setTaskOpen(false);
        setProjectOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const completed = tasks.filter((task) => task.status === "Done").length;
  const active = tasks.filter((task) => task.status === "In progress").length;
  const completion = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase().trim();
    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.project.toLowerCase().includes(query);
      const matchesPage =
        activePage !== "My tasks" ||
        task.status !== "Done";
      const matchesProject =
        projectFilter === "All" || task.project === projectFilter;
      return matchesSearch && matchesPage && matchesProject;
    });
  }, [tasks, search, activePage, projectFilter]);

  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase().trim();
    return (
      !query ||
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    );
  });

  function openNewTask() {
    setEditingId(null);
    setTaskTitle("");
    setTaskProject(projects[0]?.name ?? "Personal");
    setTaskPriority("Medium");
    setTaskDue("Today");
    setTaskOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingId(task.id);
    setTaskTitle(task.title);
    setTaskProject(task.project);
    setTaskPriority(task.priority);
    setTaskDue(task.due);
    setTaskOpen(true);
  }

  function saveTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingId !== null) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingId
            ? {
              ...task,
              title: taskTitle.trim(),
              project: taskProject,
              priority: taskPriority,
              due: taskDue,
            }
            : task
        )
      );
      setToast("Task updated successfully");
    } else {
      const newTask: Task = {
        id: Date.now(),
        title: taskTitle.trim(),
        project: taskProject,
        priority: taskPriority,
        status: "To do",
        due: taskDue,
      };
      setTasks((previous) => [newTask, ...previous]);
      setToast("New task created");
    }
    setTaskOpen(false);
  }

  function toggleTask(task: Task) {
    const nextStatus: Task["status"] =
      task.status === "Done" ? "To do" : "Done";
    setTasks((previous) =>
      previous.map((item) =>
        item.id === task.id ? { ...item, status: nextStatus } : item
      )
    );
    setToast(nextStatus === "Done" ? "Task completed ✓" : "Task reopened");
  }

  function deleteTask(id: number) {
    setTasks((previous) => previous.filter((task) => task.id !== id));
    setToast("Task deleted");
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileDraft.name.trim() || !profileDraft.email.trim()) {
      setToast("Name and email are required");
      return;
    }
    setProfile({
      ...profileDraft,
      name: profileDraft.name.trim(),
      email: profileDraft.email.trim(),
    });
    setProfileOpen(false);
    setToast("Profile saved successfully");
  }

  function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectName.trim()) return;
    if (
      projects.some(
        (project) =>
          project.name.toLowerCase() === projectName.trim().toLowerCase()
      )
    ) {
      setToast("A project with that name already exists");
      return;
    }
    const project: Project = {
      id: Date.now(),
      name: projectName.trim(),
      description: projectDescription.trim() || "Your next great project",
      color: projectColor,
      progress: 0,
    };
    setProjects((previous) => [...previous, project]);
    setProjectName("");
    setProjectDescription("");
    setProjectOpen(false);
    setToast("Project created successfully");
  }

  function deleteProject(project: Project) {
    const hasTasks = tasks.some((task) => task.project === project.name);
    if (
      !window.confirm(
        hasTasks
          ? `Delete "${project.name}" and its associated tasks?`
          : `Delete "${project.name}"?`
      )
    ) {
      return;
    }
    setProjects((previous) => previous.filter((item) => item.id !== project.id));
    setTasks((previous) => previous.filter((task) => task.project !== project.name));
    setToast("Project deleted");
  }

  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part: string) => part[0])
      .join("")
      .toUpperCase() || "U";

  const greeting = new Date().getHours() < 12
    ? "Good morning"
    : new Date().getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date()).toUpperCase();

  return (
    <div className={`nexus ${dark ? "theme-dark" : "theme-light"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        .nexus{--bg:#0b0b10;--side:#101016;--panel:#15151d;--panel2:#191821;--line:rgba(255,255,255,.075);--text:#f4f1fa;--muted:#9693a9;--purple:#a78bfa;--purple2:#8b5cf6;--green:#34d399;--blue:#60a5fa;--orange:#fb923c;min-height:100vh;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;display:flex;overflow:hidden;transition:background .3s,color .3s}
        .theme-light{--bg:#f6f5fa;--side:#fff;--panel:#fff;--panel2:#f1eef8;--line:rgba(28,20,45,.1);--text:#242033;--muted:#777187;--purple:#7955d9;--purple2:#6840ca}
        button,input,select,textarea{font:inherit}
        button{cursor:pointer}
        button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--purple);outline-offset:3px}
        .sidebar{width:250px;flex-shrink:0;background:var(--side);border-right:1px solid var(--line);padding:24px 16px;display:flex;flex-direction:column;min-height:100vh;z-index:5}
        .brand{display:flex;align-items:center;gap:11px;padding:0 8px;margin-bottom:30px;font:700 20px 'Space Grotesk',sans-serif;letter-spacing:2px}
        .brand-mark{width:35px;height:35px;border-radius:11px;background:linear-gradient(145deg,#c4a8ff,#7c4de3);display:grid;place-items:center;color:white;font-size:21px;box-shadow:0 5px 22px #8b5cf640}
        .brand-dot{color:var(--purple)}
        .workspace{width:100%;border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:12px;display:flex;align-items:center;gap:10px;text-align:left;color:var(--text);margin-bottom:30px;transition:transform .2s,border-color .2s}
        .workspace:hover{border-color:#a78bfa70;transform:translateY(-1px)}
        .workspace-icon{width:32px;height:32px;border-radius:10px;background:#8b5cf630;display:grid;place-items:center;color:var(--purple);font-weight:bold}
        .workspace-copy{flex:1;min-width:0}.workspace-copy b{display:block;font-size:12px}.workspace-copy small{color:var(--muted);font-size:11px;display:block;margin-top:3px}
        .section-label{font-size:9px;letter-spacing:2px;color:var(--muted);padding:0 9px;margin:0 0 11px}
        .nav{display:grid;gap:5px}
        .nav-button{width:100%;display:flex;align-items:center;gap:12px;border:1px solid transparent;background:transparent;color:var(--muted);padding:11px 12px;border-radius:10px;text-align:left;font-size:13px;transition:background .2s,color .2s,transform .2s}
        .nav-button:hover{background:var(--panel2);color:var(--text);transform:translateX(2px)}
        .nav-button.active{background:#a78bfa17;border-color:#a78bfa18;color:var(--purple)}
        .nav-icon{width:17px;font-size:17px;text-align:center}
        .nav-count{margin-left:auto;background:var(--panel2);padding:3px 7px;border-radius:7px;font-size:10px}
        .project-heading{display:flex;align-items:center;justify-content:space-between;margin:29px 0 11px}
        .mini-add{background:none;border:0;color:var(--muted);font-size:20px}
        .side-project{display:flex;align-items:center;gap:10px;background:none;border:0;color:var(--muted);padding:10px 11px;width:100%;font-size:11px;text-align:left;border-radius:8px}
        .side-project:hover{background:var(--panel2);color:var(--text)}
        .project-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
        .side-project span:nth-child(2){flex:1}
        .side-project small{font-size:10px}
        .sidebar-bottom{margin-top:auto}
        .focus-card{position:relative;overflow:hidden;background:radial-gradient(ellipse at top right,#8b5cf635,transparent 70%),var(--panel2);border:1px solid #a78bfa25;border-radius:14px;padding:15px}
        .focus-icon{width:29px;height:29px;background:#a78bfa22;color:var(--purple);border-radius:9px;display:grid;place-items:center;margin-bottom:12px}
        .focus-card b{font-size:12px}.focus-card p{font-size:11px;line-height:1.6;color:var(--muted);margin:7px 0 12px}
        .text-button{background:none;border:0;color:var(--purple);font-size:11px;font-weight:600;padding:0}
        .main{flex:1;min-width:0}
        .topbar{height:64px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px;padding:0 32px;background:var(--bg);position:sticky;top:0;z-index:4}
        .breadcrumbs{display:flex;gap:11px;align-items:center;font-size:11px;color:var(--muted);white-space:nowrap}
        .breadcrumbs b{color:var(--text);font-weight:500}
        .top-actions{margin-left:auto;display:flex;align-items:center;gap:10px}
        .search-box{display:flex;align-items:center;gap:9px;border:1px solid var(--line);background:var(--panel);padding:0 11px;border-radius:10px;width:min(260px,30vw);height:39px;color:var(--muted)}
        .search-box input{width:100%;background:transparent;border:0;outline:none;color:var(--text);font-size:11px;min-width:0}
        .search-box kbd{white-space:nowrap;border:1px solid var(--line);padding:3px 5px;border-radius:5px;font-size:10px}
        .icon-button{position:relative;width:36px;height:36px;border-radius:10px;border:1px solid transparent;background:transparent;color:var(--muted);font-size:17px;transition:background .2s,color .2s}
        .icon-button:hover{background:var(--panel2);color:var(--text)}
        .notification-dot{position:absolute;right:7px;top:6px;width:6px;height:6px;border-radius:50%;background:#c4a8ff}
        .avatar{width:35px;height:35px;border:2px solid #ffffff28;border-radius:50%;background:linear-gradient(145deg,#f4d1a3,#916d5d);color:#33231e;font-size:12px;font-weight:700;display:grid;place-items:center;flex-shrink:0}
        .avatar:hover{box-shadow:0 0 0 4px #a78bfa28}
        .content{max-width:1500px;margin:0 auto;padding:35px 32px 60px}
        .welcome-row{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:25px;animation:rise .5s ease both}
        .eyebrow{font-size:9px;letter-spacing:1.7px;color:var(--muted);display:flex;align-items:center;gap:8px;margin-bottom:12px}
        .eyebrow-dot{width:7px;height:7px;background:var(--purple);border-radius:50%;box-shadow:0 0 12px var(--purple)}
        h1,h2,h3,p{margin-top:0}
        h1{font:600 clamp(25px,3vw,35px) 'Space Grotesk',sans-serif;letter-spacing:-1.4px;margin-bottom:8px}
        .subtitle{font-size:12px;color:var(--muted);margin:0;line-height:1.7}
        .primary-button{border:0;border-radius:10px;background:linear-gradient(115deg,#b49aff,#8b68ec);color:#171021;padding:12px 16px;font-weight:700;font-size:11px;display:inline-flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 6px 20px #8b5cf625;transition:transform .2s,box-shadow .2s}
        .primary-button:hover{transform:translateY(-2px);box-shadow:0 9px 26px #8b5cf645}
        .secondary-button{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:9px;padding:10px 13px;font-size:11px;transition:background .2s,border-color .2s}
        .secondary-button:hover{background:var(--panel2);border-color:#a78bfa60}
        .hero{min-height:265px;border:1px solid #a78bfa3d;border-radius:20px;padding:29px 34px;position:relative;overflow:hidden;display:flex;align-items:center;background:radial-gradient(ellipse at 80% 45%,#8b5cf621,transparent 43%),linear-gradient(110deg,#1a1625,var(--panel));animation:rise .6s .06s ease both}
        .theme-light .hero{background:radial-gradient(ellipse at 80% 45%,#8b5cf61b,transparent 43%),linear-gradient(110deg,#f3edff,#fff)}
        .hero-copy{max-width:430px;position:relative;z-index:2}
        .hero-label{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;background:#a78bfa17;border:1px solid #a78bfa25;border-radius:7px;color:var(--purple);font-size:9px;font-weight:700;letter-spacing:.7px;margin-bottom:16px}
        .hero h2{font:600 clamp(25px,3vw,36px)/1.15 'Space Grotesk',sans-serif;letter-spacing:-1.3px;margin-bottom:12px}
        .hero h2 span{color:var(--purple)}
        .hero p{max-width:330px;color:var(--muted);font-size:11px;line-height:1.8;margin-bottom:18px}
        .orbit-art{position:absolute;width:360px;height:300px;right:3%;top:50%;transform:translateY(-50%);display:grid;place-items:center;pointer-events:none}
        .orbit{position:absolute;border:1px solid #a78bfa20;border-radius:50%;animation:orbitPulse 5s ease-in-out infinite}
        .orbit.one{width:280px;height:280px}.orbit.two{width:220px;height:220px;border-style:dashed;animation-delay:-1s}.orbit.three{width:155px;height:155px;border-color:#a78bfa50;animation-delay:-2s}
        .core{width:78px;height:78px;display:grid;place-items:center;border-radius:24px;border:1px solid #c4a8ff62;background:linear-gradient(145deg,#8b5cf650,#312345);box-shadow:0 0 55px #8b5cf62c;color:#d9c9ff;font-size:33px;animation:float 4s ease-in-out infinite}
        .floating-pill{position:absolute;background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:10px 12px;display:flex;align-items:center;gap:9px;box-shadow:0 12px 35px #0002;font-size:10px}
        .floating-pill small{display:block;color:var(--muted);font-size:9px;margin-top:4px}
        .floating-pill b{font-size:10px}.pill-left{left:0;top:30%}.pill-right{right:0;top:43%}
        .section-head{display:flex;align-items:center;justify-content:space-between;gap:15px;margin:31px 0 16px}
        .section-head h3{font:600 15px 'Space Grotesk',sans-serif;letter-spacing:-.3px;margin:0 0 5px}
        .section-head p{font-size:10px;color:var(--muted);margin:0}
        .link-button{border:0;background:transparent;color:var(--muted);font-size:10px;display:flex;align-items:center;gap:9px}
        .link-button:hover{color:var(--purple)}
        .stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}
        .stat-card{border:1px solid var(--line);background:var(--panel);border-radius:15px;padding:19px;min-width:0;transition:transform .25s,border-color .25s;animation:rise .5s ease both}
        .stat-card:hover{transform:translateY(-3px);border-color:#a78bfa40}
        .stat-top{display:flex;justify-content:space-between;align-items:center;gap:8px}
        .stat-top span:first-child{color:var(--muted);font-size:10px}
        .stat-icon{width:31px;height:31px;border-radius:10px;display:grid;place-items:center;font-size:15px}
        .stat-number{font:600 29px 'Space Grotesk',sans-serif;letter-spacing:-1px;margin:13px 0 5px}
        .stat-foot{font-size:10px;color:var(--muted);display:flex;align-items:center;gap:5px}
        .positive{color:var(--green)}
        .dashboard-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(260px,1fr);gap:15px;margin-top:28px}
        .panel{background:var(--panel);border:1px solid var(--line);border-radius:16px;min-width:0;overflow:hidden;animation:rise .55s ease both}
        .panel-heading{padding:19px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--line)}
        .panel-heading h3{font:600 14px 'Space Grotesk',sans-serif;margin:0 0 5px}
        .panel-heading p{color:var(--muted);font-size:10px;margin:0}
        .task-list{padding:0 19px}
        .task-row{display:flex;align-items:center;gap:12px;padding:15px 0;border-bottom:1px solid var(--line);transition:opacity .2s}
        .task-row:last-child{border-bottom:0}
        .task-check{width:18px;height:18px;border-radius:6px;border:1.5px solid #797387;background:transparent;display:grid;place-items:center;flex-shrink:0;color:#171021;font-size:11px}
        .task-check.checked{background:var(--green);border-color:var(--green)}
        .task-copy{flex:1;min-width:0}
        .task-title{font-size:11px;font-weight:600;overflow-wrap:anywhere}
        .task-title.done{text-decoration:line-through;color:var(--muted)}
        .task-meta{display:flex;align-items:center;gap:7px;margin-top:6px;color:var(--muted);font-size:9px;flex-wrap:wrap}
        .task-project{padding:4px 7px;border-radius:5px;background:var(--panel2)}
        .priority{font-size:9px;padding:4px 7px;border-radius:5px;white-space:nowrap}
        .priority.High{color:#fb7185;background:#fb71851a}.priority.Medium{color:#fbbf24;background:#fbbf241a}.priority.Low{color:#60a5fa;background:#60a5fa1a}
        .task-actions{display:flex;gap:2px;opacity:.35;transition:opacity .2s}
        .task-row:hover .task-actions{opacity:1}
        .tiny-button{border:0;background:transparent;color:var(--muted);padding:5px;border-radius:5px;font-size:12px}
        .tiny-button:hover{background:var(--panel2);color:var(--purple)}
        .progress-content{padding:20px}
        .progress-ring-row{display:flex;align-items:center;gap:20px;padding:4px 0 22px}
        .progress-ring{width:112px;height:112px;flex-shrink:0;position:relative;display:grid;place-items:center}
        .progress-ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
        .progress-ring strong{font:600 25px 'Space Grotesk',sans-serif}
        .progress-ring small{position:absolute;top:65px;color:var(--muted);font-size:9px}
        .progress-summary b{font-size:13px;display:block;margin-bottom:6px}
        .progress-summary p{font-size:10px;color:var(--muted);line-height:1.7;margin:0}
        .legend{display:grid;gap:13px}
        .legend-row{display:flex;align-items:center;gap:9px;font-size:10px}
        .legend-dot{width:8px;height:8px;border-radius:3px}
        .legend-row span:nth-child(2){flex:1;color:var(--muted)}
        .legend-row b{font-size:10px}
        .project-list{display:grid;gap:10px;padding:16px}
        .project-card{border:1px solid var(--line);background:var(--bg);border-radius:12px;padding:14px;transition:transform .2s,border-color .2s}
        .project-card:hover{transform:translateY(-2px);border-color:#a78bfa50}
        .project-card-top{display:flex;align-items:center;gap:10px}
        .project-square{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-size:15px}
        .project-card-top>div:nth-child(2){flex:1;min-width:0}
        .project-card-top b{font-size:11px;display:block;overflow-wrap:anywhere}
        .project-card-top small{font-size:9px;color:var(--muted);display:block;margin-top:4px}
        .progress-line{height:5px;border-radius:5px;background:var(--panel2);overflow:hidden;margin:14px 0 8px}
        .progress-line span{display:block;height:100%;border-radius:5px;transition:width .7s cubic-bezier(.2,.8,.2,1)}
        .project-card-foot{display:flex;justify-content:space-between;color:var(--muted);font-size:9px}
        .page-panel{margin-top:22px}
        .filter-row{display:flex;gap:7px;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid var(--line)}
        .filter-chip{border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:8px;padding:7px 11px;font-size:10px}
        .filter-chip.active{background:#a78bfa1a;border-color:#a78bfa55;color:var(--purple)}
        .project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:20px}
        .project-large{padding:20px}
        .project-large .project-card-top{margin-bottom:15px}
        .project-large p{font-size:11px;line-height:1.7;color:var(--muted);margin:12px 0}
        .project-large-actions{display:flex;justify-content:space-between;align-items:center;margin-top:14px}
        .calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;padding:20px}
        .calendar-day{min-height:75px;border:1px solid var(--line);border-radius:8px;padding:8px;font-size:11px;color:var(--muted)}
        .calendar-day.today{border-color:var(--purple);background:#a78bfa14;color:var(--text)}
        .calendar-day small{display:block;font-size:9px;margin-top:8px;color:var(--purple);overflow-wrap:anywhere}
        .board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:16px}
        .board-column{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:11px;min-width:0}
        .board-column h4{font-size:11px;margin:4px 0 12px;display:flex;justify-content:space-between}
        .board-task{background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:11px;margin-bottom:8px}
        .board-task p{font-size:10px;line-height:1.6;margin:0 0 8px}
        .board-task small{font-size:9px;color:var(--muted)}
        .empty-state{text-align:center;padding:38px 15px;color:var(--muted);font-size:11px}
        .empty-state b{display:block;color:var(--text);font-size:13px;margin-bottom:7px}
        .footer{display:flex;justify-content:space-between;gap:12px;padding:26px 0 0;color:var(--muted);font-size:9px}
        .overlay{position:fixed;inset:0;background:#07060bd1;backdrop-filter:blur(8px);z-index:20;display:grid;place-items:center;padding:20px;animation:fade .18s ease}
        .modal{width:min(440px,100%);max-height:90vh;overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:25px;box-shadow:0 30px 100px #0006;animation:modalIn .25s ease}
        .modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:23px}
        .modal-head h2{font:600 20px 'Space Grotesk',sans-serif;margin:0 0 6px}
        .modal-head p{font-size:11px;color:var(--muted);margin:0}
        .close-button{border:1px solid var(--line);background:var(--panel2);color:var(--muted);border-radius:8px;width:31px;height:31px}
        .form-field{display:grid;gap:7px;margin-bottom:16px}
        .form-field label{font-size:10px;color:var(--muted);font-weight:600}
        .form-field input,.form-field select,.form-field textarea{width:100%;border:1px solid var(--line);background:var(--bg);border-radius:9px;padding:11px 12px;color:var(--text);font-size:12px;outline:none}
        .form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:var(--purple)}
        .form-field select option{background:var(--panel);color:var(--text)}
        .form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:22px}
        .profile-preview{display:flex;align-items:center;gap:13px;margin-bottom:22px;padding:14px;border:1px solid var(--line);border-radius:12px}
        .profile-preview .avatar{width:49px;height:49px;font-size:16px}
        .profile-preview b{font-size:13px;display:block}
        .profile-preview small{color:var(--muted);font-size:10px;display:block;margin-top:4px}
        .notification-pop{position:fixed;right:22px;top:70px;width:min(330px,calc(100vw - 35px));z-index:15;border:1px solid var(--line);border-radius:14px;background:var(--panel);box-shadow:0 20px 65px #0005;animation:modalIn .2s ease}
        .notification-item{padding:14px 17px;border-bottom:1px solid var(--line);display:flex;gap:10px;font-size:11px;line-height:1.6}
        .notification-item:last-child{border-bottom:0}
        .notification-item small{display:block;color:var(--muted);margin-top:4px;font-size:9px}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:40;padding:12px 18px;border:1px solid #a78bfa50;border-radius:11px;background:var(--panel2);color:var(--text);font-size:11px;box-shadow:0 10px 40px #0004;animation:toastIn .25s ease;white-space:nowrap}
        .mobile-menu{display:none}

        /* NEXUS MOTION LAYER — high-visibility hero, typography and interactions */
        .nexus{--cyan:#67e8f9;--mint:#6ee7b7;--pink:#f0abfc;--amber:#fbbf24;--blue:#60a5fa}
        .hero{isolation:isolate;min-height:310px;border-color:rgba(167,139,250,.32);background:radial-gradient(ellipse at 78% 45%,rgba(103,232,249,.12),transparent 36%),radial-gradient(ellipse at 93% 85%,rgba(240,171,252,.10),transparent 36%),linear-gradient(115deg,#151520 0%,#1c1729 48%,#111a24 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.045);transition:border-color .35s ease,box-shadow .35s ease,transform .35s cubic-bezier(.2,.8,.2,1)}
        .theme-light .hero{background:radial-gradient(ellipse at 78% 45%,rgba(103,232,249,.20),transparent 36%),radial-gradient(ellipse at 93% 85%,rgba(240,171,252,.16),transparent 36%),linear-gradient(115deg,#f5f0ff 0%,#fff 54%,#eefaff 100%)}
        .hero::before{content:"";position:absolute;inset:-1px;z-index:0;pointer-events:none;background:linear-gradient(110deg,transparent 20%,rgba(103,232,249,.07) 42%,rgba(196,181,253,.11) 50%,rgba(240,171,252,.06) 58%,transparent 78%);background-size:220% 100%;animation:heroSheen 8s linear infinite}
        .hero::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.25;background-image:radial-gradient(rgba(255,255,255,.22) .7px,transparent .7px);background-size:22px 22px;mask-image:linear-gradient(90deg,transparent 15%,#000 100%)}
        .hero:hover{border-color:rgba(103,232,249,.48);box-shadow:0 18px 55px rgba(5,8,20,.22),0 0 38px rgba(103,232,249,.07),inset 0 1px 0 rgba(255,255,255,.07)}
        .hero-copy{max-width:490px}
        .hero-label{animation:labelGlow 3.8s ease-in-out infinite;border-color:rgba(103,232,249,.22);color:#b9f5ff;background:linear-gradient(110deg,rgba(103,232,249,.10),rgba(167,139,250,.12),rgba(240,171,252,.09))}
        .hero h2{font-size:clamp(30px,3.3vw,43px);line-height:1.12;animation:headingReveal .85s cubic-bezier(.2,.8,.2,1) both}
        .hero h2 span{background:linear-gradient(100deg,#a78bfa 0%,#67e8f9 30%,#6ee7b7 55%,#f0abfc 78%,#a78bfa 100%);background-size:240% auto;background-clip:text;-webkit-background-clip:text;color:transparent;animation:gradientShine 7s linear infinite;text-shadow:0 0 26px rgba(103,232,249,.08)}
        .welcome-row h1{background:linear-gradient(100deg,var(--text) 0%,#c4b5fd 28%,#67e8f9 54%,#f0abfc 78%,var(--text) 100%);background-size:220% auto;background-clip:text;-webkit-background-clip:text;color:transparent;animation:headingReveal .75s cubic-bezier(.2,.8,.2,1) both,gradientShine 11s linear infinite}
        .section-head h3,.panel-heading h3{font-weight:700;transition:color .25s ease,text-shadow .25s ease}
        .section-head:hover h3,.panel:hover .panel-heading h3{color:#b9f5ff;text-shadow:0 0 18px rgba(103,232,249,.15)}
        .orbit-art{width:430px;height:350px;right:2%;filter:drop-shadow(0 0 22px rgba(103,232,249,.06));animation:artEntrance 1s .12s cubic-bezier(.2,.8,.2,1) both}
        .orbit{border-color:rgba(103,232,249,.22);box-shadow:0 0 22px rgba(103,232,249,.035);will-change:transform,opacity}
        .orbit.one{width:310px;height:310px;animation:orbitRotate 26s linear infinite,orbitPulse 5s ease-in-out infinite}
        .orbit.two{width:245px;height:245px;border-color:rgba(167,139,250,.38);animation:orbitRotateReverse 19s linear infinite,orbitPulse 5s -1s ease-in-out infinite}
        .orbit.three{width:175px;height:175px;border-color:rgba(240,171,252,.5);box-shadow:0 0 30px rgba(240,171,252,.07);animation:orbitPulse 4s -2s ease-in-out infinite}
        .core{position:relative;z-index:2;width:94px;height:94px;border-radius:28px;font-size:41px;color:#e4fbff;background:linear-gradient(145deg,rgba(103,232,249,.25),rgba(139,92,246,.45) 48%,rgba(240,171,252,.22));border:1px solid rgba(186,230,253,.6);box-shadow:0 0 28px rgba(103,232,249,.18),0 0 70px rgba(139,92,246,.24),inset 0 0 24px rgba(255,255,255,.09);animation:coreLevitate 4s ease-in-out infinite,coreGlow 4s ease-in-out infinite}
        .core::before{content:"";position:absolute;inset:-10px;border:1px solid rgba(103,232,249,.26);border-radius:32px;animation:coreRing 5s linear infinite}
        .core::after{content:"";position:absolute;inset:-18px;border:1px dashed rgba(240,171,252,.24);border-radius:36px;animation:coreRing 12s linear infinite reverse}
        .orbit-particle{position:absolute;z-index:3;width:9px;height:9px;border-radius:50%;background:var(--cyan);box-shadow:0 0 12px var(--cyan),0 0 25px rgba(103,232,249,.5);animation:particlePulse 2.4s ease-in-out infinite}
        .particle-a{top:12%;left:48%}.particle-b{right:14%;bottom:20%;width:7px;height:7px;background:var(--pink);box-shadow:0 0 14px var(--pink);animation-delay:-.8s}.particle-c{left:16%;bottom:24%;width:6px;height:6px;background:var(--mint);box-shadow:0 0 14px var(--mint);animation-delay:-1.4s}
        .orbit-satellite{position:absolute;z-index:2;width:13px;height:13px;border:2px solid #c4b5fd;border-radius:50%;background:#111827;box-shadow:0 0 16px rgba(196,181,253,.65);animation:satelliteOrbit 12s linear infinite}
        .floating-pill{z-index:4;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-color:rgba(255,255,255,.11);background:rgba(20,20,30,.86);animation:pillFloat 5s ease-in-out infinite;box-shadow:0 12px 35px rgba(0,0,0,.22),0 0 22px rgba(103,232,249,.045)}
        .pill-right{animation-delay:-2.4s}
        .floating-pill b{color:#f4f7ff}
        .primary-button{background:linear-gradient(110deg,#b9a0ff 0%,#8b68ec 45%,#67e8f9 120%);box-shadow:0 7px 25px rgba(139,92,246,.24);transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s ease,filter .28s ease}
        .primary-button:hover{transform:translateY(-3px) scale(1.025);box-shadow:0 12px 32px rgba(103,232,249,.16),0 8px 25px rgba(139,92,246,.24);filter:saturate(1.18)}
        .stat-card,.project-card,.board-task,.calendar-day,.panel{transition:transform .3s cubic-bezier(.2,.8,.2,1),border-color .3s ease,box-shadow .3s ease,background-color .3s ease}
        .stat-card:hover,.project-card:hover,.board-task:hover{transform:translateY(-5px);border-color:rgba(103,232,249,.35);box-shadow:0 15px 35px rgba(0,0,0,.16),0 0 22px rgba(103,232,249,.045)}
        .task-row:hover{background:linear-gradient(90deg,rgba(103,232,249,.045),rgba(167,139,250,.035));border-radius:8px}
        .calendar-day:hover{transform:translateY(-2px);border-color:rgba(103,232,249,.42);background:rgba(103,232,249,.055)}
        .board-column{transition:border-color .25s ease,background .25s ease}
        .board-column:hover{border-color:rgba(167,139,250,.32)}
        .nexus button,.nexus input,.nexus select,.nexus textarea{transition-timing-function:cubic-bezier(.2,.8,.2,1)}
        @keyframes heroSheen{0%{background-position:130% 0}100%{background-position:-130% 0}}
        @keyframes gradientShine{to{background-position:220% center}}
        @keyframes headingReveal{from{opacity:0;transform:translateY(16px);filter:blur(5px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes labelGlow{0%,100%{box-shadow:0 0 0 rgba(103,232,249,0)}50%{box-shadow:0 0 22px rgba(103,232,249,.12)}}
        @keyframes artEntrance{from{opacity:0;transform:translate(24px,-46%) scale(.88)}to{opacity:1;transform:translate(0,-50%) scale(1)}}
        @keyframes orbitRotate{to{transform:rotate(360deg)}}
        @keyframes orbitRotateReverse{to{transform:rotate(-360deg)}}
        @keyframes coreLevitate{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-15px) rotate(5deg)}}
        @keyframes coreGlow{0%,100%{filter:brightness(1);box-shadow:0 0 28px rgba(103,232,249,.18),0 0 70px rgba(139,92,246,.24),inset 0 0 24px rgba(255,255,255,.09)}50%{filter:brightness(1.18);box-shadow:0 0 40px rgba(103,232,249,.28),0 0 95px rgba(139,92,246,.32),inset 0 0 30px rgba(255,255,255,.14)}}
        @keyframes coreRing{to{transform:rotate(360deg)}}
        @keyframes particlePulse{0%,100%{transform:scale(.7);opacity:.55}50%{transform:scale(1.35);opacity:1}}
        @keyframes satelliteOrbit{from{transform:rotate(0deg) translateX(132px) rotate(0deg)}to{transform:rotate(360deg) translateX(132px) rotate(-360deg)}}
        @keyframes pillFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(3deg)}}
        @keyframes orbitPulse{0%,100%{opacity:.65;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes modalIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes toastIn{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
        @media(min-width:1500px){.content{padding-top:45px}.hero{min-height:285px}.stat-card{padding:23px}}
        @media(max-width:1100px){.sidebar{width:215px}.content{padding:28px 22px}.topbar{padding:0 22px}.orbit-art{right:-65px;opacity:.75}.hero-copy{max-width:390px}.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-grid{grid-template-columns:minmax(0,1fr)}}
        @media(max-width:700px){.nexus{display:block}.sidebar{width:100%;min-height:auto;height:auto;padding:12px 15px;border-right:0;border-bottom:1px solid var(--line)}.brand{margin:0;font-size:17px}.brand-mark{width:31px;height:31px}.sidebar>.workspace,.sidebar>.section-label,.sidebar>.nav,.sidebar>.project-heading,.sidebar>.side-project,.sidebar>.sidebar-bottom{display:none}.topbar{height:57px;padding:0 14px}.breadcrumbs{font-size:10px}.search-box{width:38px;padding:0 10px}.search-box input,.search-box kbd{display:none}.search-box:focus-within{width:160px}.search-box:focus-within input{display:block}.content{padding:24px 14px 35px}.welcome-row{align-items:flex-start}.welcome-row .primary-button{padding:10px;font-size:0}.welcome-row .primary-button span{font-size:17px}.hero{min-height:250px;padding:23px 20px}.hero-copy{max-width:100%}.hero h2{font-size:28px;max-width:300px}.hero p{max-width:260px}.orbit-art{right:-205px;opacity:.28;transform:translateY(-50%) scale(.82)}.hero-copy{max-width:100%;text-shadow:0 1px 12px rgba(0,0,0,.12)}.hero h2{font-size:28px}.floating-pill{display:none}.stats-grid{gap:9px}.stat-card{padding:13px}.stat-number{font-size:25px}.stat-top span:first-child{font-size:9px}.stat-icon{width:27px;height:27px}.dashboard-grid{gap:12px}.panel-heading{padding:15px}.task-list{padding:0 13px}.task-row{gap:9px}.task-actions{opacity:1}.project-grid{grid-template-columns:1fr;padding:12px}.board{grid-template-columns:1fr;padding:12px}.calendar-grid{gap:3px;padding:9px}.calendar-day{min-height:57px;padding:4px;font-size:9px}.calendar-day small{font-size:8px}.progress-ring-row{gap:13px}.progress-ring{width:95px;height:95px}.progress-ring svg{width:95px;height:95px}.progress-ring small{top:57px}.footer{flex-direction:column}.toast{max-width:calc(100vw - 24px);white-space:normal;text-align:center}.section-head{margin-top:24px}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
      `}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">⌘</div>
          NEXUS<span className="brand-dot">.</span>
        </div>

        <button className="workspace" onClick={() => {
          setProfileDraft(profile);
          setProfileOpen(true);
        }}>
          <span className="workspace-icon">{initials.slice(0, 1)}</span>
          <span className="workspace-copy">
            <b>{profile.role || "Personal workspace"}</b>
            <small>Free plan · Manage profile</small>
          </span>
          <span>⌄</span>
        </button>

        <div className="section-label">WORKSPACE</div>
        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-button ${activePage === item.label ? "active" : ""}`}
              onClick={() => {
                setActivePage(item.label);
                setProjectFilter("All");
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.label === "My tasks" && (
                <span className="nav-count">
                  {tasks.filter((task) => task.status !== "Done").length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="project-heading">
          <span className="section-label" style={{ margin: 0 }}>YOUR PROJECTS</span>
          <button className="mini-add" title="Create project" onClick={() => setProjectOpen(true)}>+</button>
        </div>
        {projects.map((project) => (
          <button
            key={project.id}
            className="side-project"
            onClick={() => {
              setActivePage("My tasks");
              setProjectFilter(project.name);
            }}
          >
            <span className="project-dot" style={{ background: project.color }} />
            <span>{project.name}</span>
            <small>{tasks.filter((task) => task.project === project.name && task.status !== "Done").length}</small>
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="focus-card">
            <div className="focus-icon">✧</div>
            <b>Make room for focus.</b>
            <p>Small steps, consistent progress. Your next breakthrough starts here.</p>
            <button className="text-button" onClick={() => setActivePage("My tasks")}>
              Explore your tasks →
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setActivePage("Overview")} title="Go to overview">⌂</button>
          <div className="breadcrumbs">
            <span>Workspace</span><span>›</span><b>{activePage}</b>
          </div>
          <div className="top-actions">
            <label className="search-box">
              <span>⌕</span>
              <input
                id="nexus-search"
                placeholder="Search anything..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search tasks and projects"
              />
              <kbd>⌘K</kbd>
            </label>
            <button
              className="icon-button"
              title="Notifications"
              onClick={() => setNotificationsOpen((value) => !value)}
            >
              ♧<span className="notification-dot" />
            </button>
            <button
              className="icon-button"
              title="Switch theme"
              onClick={() => setDark((value) => !value)}
            >
              {dark ? "☼" : "☾"}
            </button>
            <button
              className="avatar"
              title="Edit profile"
              onClick={() => {
                setProfileDraft(profile);
                setProfileOpen(true);
              }}
            >
              {initials}
            </button>
          </div>
        </header>

        {notificationsOpen && (
          <div className="notification-pop">
            <div className="panel-heading">
              <div><h3>Notifications</h3><p>Your workspace activity</p></div>
              <button className="close-button" onClick={() => setNotificationsOpen(false)}>×</button>
            </div>
            <div className="notification-item">
              <span style={{ color: "var(--green)" }}>●</span>
              <div><b>Welcome to Nexus</b><small>Your personal workspace is ready.</small></div>
            </div>
            <div className="notification-item">
              <span style={{ color: "var(--purple)" }}>✧</span>
              <div><b>Keep your momentum</b><small>{tasks.filter((task) => task.status !== "Done").length} tasks remain on your list.</small></div>
            </div>
            <div className="notification-item">
              <span style={{ color: "var(--blue)" }}>↗</span>
              <div><b>Progress overview</b><small>{completion}% of your tasks are complete.</small></div>
            </div>
          </div>
        )}

        <div className="content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> {dateLabel} · YOUR WORKSPACE</div>
              <h1>{greeting}, {profile.name || "User"}.</h1>
              <p className="subtitle">A little progress each day adds up to remarkable results.</p>
            </div>
            <button className="primary-button" onClick={openNewTask}>
              <span style={{ fontSize: 17 }}>＋</span> New task <span style={{ opacity: .65 }}>⌘N</span>
            </button>
          </div>

          {activePage === "Overview" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="hero-label">✧ YOUR WEEKLY PULSE</div>
                  <h2>Make space for<br /><span>meaningful work.</span></h2>
                  <p>Stay focused on what matters. Your workspace is ready for another great day.</p>
                  <button className="secondary-button" onClick={() => setActivePage("Board")}>
                    Open task board <span style={{ marginLeft: 15 }}>→</span>
                  </button>
                </div>
                <div className="orbit-art" aria-hidden="true">
                  <div className="orbit one" />
                  <div className="orbit two" />
                  <div className="orbit three" />
                  <span className="orbit-particle particle-a" />
                  <span className="orbit-particle particle-b" />
                  <span className="orbit-particle particle-c" />
                  <span className="orbit-satellite" />
                  <div className="core">⌘</div>
                  <div className="floating-pill pill-left">
                    <span style={{ color: "var(--green)", fontSize: 15 }}>●</span>
                    <div><b>Focus mode</b><small>One thing at a time</small></div>
                  </div>
                  <div className="floating-pill pill-right">
                    <span style={{ color: "var(--green)", fontSize: 15 }}>↗</span>
                    <div><b>{completion}%</b><small>Tasks completed</small></div>
                  </div>
                </div>
              </section>

              <div className="section-head">
                <div><h3>Your overview</h3><p>A snapshot of your productivity</p></div>
                <button className="link-button" onClick={() => setActivePage("My tasks")}>View all activity →</button>
              </div>

              <section className="stats-grid">
                {[
                  { label: "Total tasks", value: tasks.length, icon: "☷", color: "var(--purple)", bg: "#a78bfa19", foot: "Across your workspace" },
                  { label: "Completed", value: completed, icon: "✓", color: "var(--green)", bg: "#34d39919", foot: `${completion}% completion rate` },
                  { label: "In progress", value: active, icon: "ϟ", color: "var(--blue)", bg: "#60a5fa19", foot: "Keep up the momentum" },
                  { label: "Projects", value: projects.length, icon: "◎", color: "var(--orange)", bg: "#fb923c19", foot: "Ideas in motion" },
                ].map((stat, index) => (
                  <div className="stat-card" key={stat.label} style={{ animationDelay: `${index * 60}ms` }}>
                    <div className="stat-top">
                      <span>{stat.label}</span>
                      <span className="stat-icon" style={{ color: stat.color, background: stat.bg }}>{stat.icon}</span>
                    </div>
                    <div className="stat-number">{String(stat.value).padStart(2, "0")}</div>
                    <div className="stat-foot"><span className="positive">↗</span>{stat.foot}</div>
                  </div>
                ))}
              </section>

              <section className="dashboard-grid">
                <div className="panel">
                  <div className="panel-heading">
                    <div><h3>Recent tasks</h3><p>Small steps lead to big results</p></div>
                    <button className="link-button" onClick={() => setActivePage("My tasks")}>View all →</button>
                  </div>
                  <TaskList
                    tasks={filteredTasks.slice(0, 5)}
                    onToggle={toggleTask}
                    onEdit={openEditTask}
                    onDelete={deleteTask}
                  />
                </div>

                <div className="panel">
                  <div className="panel-heading">
                    <div><h3>Productivity pulse</h3><p>Your task completion snapshot</p></div>
                    <span style={{ color: "var(--purple)" }}>✧</span>
                  </div>
                  <div className="progress-content">
                    <div className="progress-ring-row">
                      <div className="progress-ring">
                        <svg viewBox="0 0 120 120" width="112" height="112">
                          <circle cx="60" cy="60" r="49" fill="none" stroke="var(--panel2)" strokeWidth="9" />
                          <circle cx="60" cy="60" r="49" fill="none" stroke="var(--purple)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${completion / 100 * 308} 308`} />
                        </svg>
                        <strong>{completion}%</strong>
                        <small>completed</small>
                      </div>
                      <div className="progress-summary">
                        <b>{completed === tasks.length && tasks.length ? "All caught up!" : "You're making progress"}</b>
                        <p>{completed} of {tasks.length} tasks completed. Every step counts.</p>
                      </div>
                    </div>
                    <div className="legend">
                      <div className="legend-row"><span className="legend-dot" style={{ background: "var(--green)" }} /><span>Completed</span><b>{completed}</b></div>
                      <div className="legend-row"><span className="legend-dot" style={{ background: "var(--blue)" }} /><span>In progress</span><b>{active}</b></div>
                      <div className="legend-row"><span className="legend-dot" style={{ background: "var(--orange)" }} /><span>To do</span><b>{tasks.filter((task) => task.status === "To do").length}</b></div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="section-head">
                <div><h3>Projects in motion</h3><p>See where your ideas are going</p></div>
                <button className="link-button" onClick={() => setActivePage("Projects")}>All projects →</button>
              </div>
              <section className="project-grid" style={{ padding: 0 }}>
                {filteredProjects.slice(0, 4).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    taskCount={tasks.filter((task) => task.project === project.name).length}
                    onOpen={() => {
                      setActivePage("My tasks");
                      setProjectFilter(project.name);
                    }}
                    onDelete={() => deleteProject(project)}
                  />
                ))}
              </section>
            </>
          )}

          {activePage === "My tasks" && (
            <section className="panel page-panel">
              <div className="panel-heading">
                <div><h3>My tasks</h3><p>Organize your work, one step at a time.</p></div>
                <button className="primary-button" onClick={openNewTask}>＋ New task</button>
              </div>
              <div className="filter-row">
                <button className={`filter-chip ${projectFilter === "All" ? "active" : ""}`} onClick={() => setProjectFilter("All")}>All projects</button>
                {projects.map((project) => (
                  <button key={project.id} className={`filter-chip ${projectFilter === project.name ? "active" : ""}`} onClick={() => setProjectFilter(project.name)}>{project.name}</button>
                ))}
              </div>
              <TaskList tasks={filteredTasks} onToggle={toggleTask} onEdit={openEditTask} onDelete={deleteTask} />
            </section>
          )}

          {activePage === "Projects" && (
            <section className="panel page-panel">
              <div className="panel-heading">
                <div><h3>Your projects</h3><p>Everything you're building, in one place.</p></div>
                <button className="primary-button" onClick={() => setProjectOpen(true)}>＋ New project</button>
              </div>
              <div className="project-grid">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} taskCount={tasks.filter((task) => task.project === project.name).length} onOpen={() => { setActivePage("My tasks"); setProjectFilter(project.name); }} onDelete={() => deleteProject(project)} />
                ))}
                {!filteredProjects.length && <div className="empty-state"><b>No projects found</b>Try a different search.</div>}
              </div>
            </section>
          )}

          {activePage === "Board" && (
            <section className="panel page-panel">
              <div className="panel-heading">
                <div><h3>Task board</h3><p>Your workflow, organized by status.</p></div>
                <button className="primary-button" onClick={openNewTask}>＋ New task</button>
              </div>
              <div className="board">
                {(["To do", "In progress", "Done"] as const).map((status) => {
                  const columnTasks = filteredTasks.filter((task) => task.status === status);
                  return (
                    <div className="board-column" key={status}>
                      <h4>{status}<span style={{ color: "var(--muted)" }}>{columnTasks.length}</span></h4>
                      {columnTasks.map((task) => (
                        <div className="board-task" key={task.id}>
                          <p>{task.title}</p>
                          <small>{task.project} · {task.due}</small>
                          <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
                            <button className="filter-chip" onClick={() => toggleTask(task)}>{status === "Done" ? "Reopen" : "Complete"}</button>
                            <button className="filter-chip" onClick={() => openEditTask(task)}>Edit</button>
                          </div>
                        </div>
                      ))}
                      {!columnTasks.length && <div className="empty-state" style={{ padding: 15 }}>No tasks here</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activePage === "Calendar" && (
            <section className="panel page-panel">
              <div className="panel-heading">
                <div><h3>Your calendar</h3><p>Tasks and deadlines at a glance.</p></div>
                <button className="primary-button" onClick={openNewTask}>＋ New task</button>
              </div>
              <div className="calendar-grid">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <div key={day} className="section-label" style={{ textAlign: "center", padding: 5 }}>{day}</div>)}
                {Array.from({ length: 35 }, (_, index) => {
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
                  const dayNumber = index - firstDay + 1;
                  const isCurrentMonth = dayNumber >= 1 && dayNumber <= new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                  const task = isCurrentMonth ? tasks.find((item) => item.due === "Today" && dayNumber === today.getDate()) : undefined;
                  return (
                    <div key={index} className={`calendar-day ${isCurrentMonth && dayNumber === today.getDate() ? "today" : ""}`}>
                      {isCurrentMonth ? dayNumber : ""}
                      {task && <small>{task.title}</small>}
                    </div>
                  );
                })}
              </div>
              <div className="task-list">
                {tasks.filter((task) => task.status !== "Done").map((task) => (
                  <div className="task-row" key={task.id}>
                    <span className="project-dot" style={{ background: projects.find((project) => project.name === task.project)?.color ?? "var(--purple)" }} />
                    <div className="task-copy"><div className="task-title">{task.title}</div><div className="task-meta">{task.project} · Due {task.due}</div></div>
                    <button className="secondary-button" onClick={() => openEditTask(task)}>Edit</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="footer">
            <span>© {new Date().getFullYear()} NEXUS WORKSPACE</span>
            <span>Made for meaningful work ✧</span>
          </footer>
        </div>
      </main>

      {profileOpen && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-heading">
            <div className="modal-head">
              <div><h2 id="profile-heading">Your profile</h2><p>Personalize your Nexus workspace.</p></div>
              <button className="close-button" onClick={() => setProfileOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="profile-preview">
              <div className="avatar">{initials}</div>
              <div><b>{profile.name}</b><small>{profile.email}</small></div>
            </div>
            <form onSubmit={saveProfile}>
              <div className="form-field">
                <label htmlFor="profile-name">DISPLAY NAME</label>
                <input id="profile-name" value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} placeholder="Your name" required maxLength={60} />
              </div>
              <div className="form-field">
                <label htmlFor="profile-email">EMAIL ADDRESS</label>
                <input id="profile-email" type="email" value={profileDraft.email} onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value })} placeholder="you@example.com" required maxLength={120} />
              </div>
              <div className="form-field">
                <label htmlFor="profile-role">WORKSPACE LABEL</label>
                <input id="profile-role" value={profileDraft.role} onChange={(event) => setProfileDraft({ ...profileDraft, role: event.target.value })} placeholder="Personal workspace" maxLength={60} />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={() => { setProfileDraft(defaultProfile); setToast("Default profile loaded"); }}>Reset defaults</button>
                <button type="button" className="secondary-button" onClick={() => setProfileOpen(false)}>Cancel</button>
                <button type="submit" className="primary-button">Save profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskOpen && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setTaskOpen(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-heading">
            <div className="modal-head">
              <div><h2 id="task-heading">{editingId === null ? "Create a task" : "Edit task"}</h2><p>Make your next step count.</p></div>
              <button className="close-button" onClick={() => setTaskOpen(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={saveTask}>
              <div className="form-field">
                <label htmlFor="task-title">TASK NAME</label>
                <input id="task-title" autoFocus value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="What needs to get done?" required maxLength={160} />
              </div>
              <div className="form-field">
                <label htmlFor="task-project">PROJECT</label>
                <select id="task-project" value={taskProject} onChange={(event) => setTaskProject(event.target.value)}>
                  {projects.map((project) => <option key={project.id} value={project.name}>{project.name}</option>)}
                  {!projects.length && <option value="Personal">Personal</option>}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="task-priority">PRIORITY</label>
                <select id="task-priority" value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as Task["priority"])}>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="task-due">DUE DATE LABEL</label>
                <select id="task-due" value={taskDue} onChange={(event) => setTaskDue(event.target.value)}>
                  <option>Today</option><option>Tomorrow</option><option>Oct 28</option><option>Oct 29</option><option>Oct 30</option><option>Next week</option><option>No deadline</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={() => setTaskOpen(false)}>Cancel</button>
                <button type="submit" className="primary-button">{editingId === null ? "Create task" : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectOpen && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setProjectOpen(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="project-heading">
            <div className="modal-head">
              <div><h2 id="project-heading">New project</h2><p>Give your next idea a home.</p></div>
              <button className="close-button" onClick={() => setProjectOpen(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={createProject}>
              <div className="form-field"><label htmlFor="project-name">PROJECT NAME</label><input id="project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="e.g. Portfolio website" required maxLength={80} /></div>
              <div className="form-field"><label htmlFor="project-description">DESCRIPTION</label><textarea id="project-description" value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} placeholder="What are you working on?" rows={3} maxLength={200} /></div>
              <div className="form-field"><label htmlFor="project-color">PROJECT COLOR</label><select id="project-color" value={projectColor} onChange={(event) => setProjectColor(event.target.value)}><option value="#a78bfa">Violet</option><option value="#60a5fa">Blue</option><option value="#34d399">Green</option><option value="#fb923c">Orange</option><option value="#f472b6">Pink</option></select></div>
              <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setProjectOpen(false)}>Cancel</button><button type="submit" className="primary-button">Create project</button></div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function TaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}) {
  if (!tasks.length) {
    return <div className="empty-state"><b>Nothing to see here — yet.</b>Create a task or try another search.</div>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div className="task-row" key={task.id}>
          <button
            className={`task-check ${task.status === "Done" ? "checked" : ""}`}
            onClick={() => onToggle(task)}
            aria-label={task.status === "Done" ? "Reopen task" : "Complete task"}
            title={task.status === "Done" ? "Reopen task" : "Complete task"}
          >
            {task.status === "Done" ? "✓" : ""}
          </button>
          <div className="task-copy">
            <div className={`task-title ${task.status === "Done" ? "done" : ""}`}>{task.title}</div>
            <div className="task-meta">
              <span className="task-project">{task.project}</span>
              <span>·</span><span>{task.due}</span>
            </div>
          </div>
          <span className={`priority ${task.priority}`}>{task.priority}</span>
          <div className="task-actions">
            <button className="tiny-button" title="Edit task" onClick={() => onEdit(task)}>✎</button>
            <button className="tiny-button" title="Delete task" onClick={() => onDelete(task.id)}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  taskCount,
  onOpen,
  onDelete,
}: {
  project: Project;
  taskCount: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const progress = Math.max(0, Math.min(100, project.progress));

  return (
    <div className="project-card">
      <div className="project-card-top">
        <div className="project-square" style={{ color: project.color, background: `${project.color}20` }}>▣</div>
        <div><b>{project.name}</b><small>{taskCount} {taskCount === 1 ? "task" : "tasks"}</small></div>
        <button className="tiny-button" title={`Delete ${project.name}`} onClick={onDelete}>×</button>
      </div>
      <p style={{ fontSize: 10, color: "var(--muted)", margin: "12px 0 0", lineHeight: 1.6 }}>{project.description}</p>
      <div className="progress-line"><span style={{ width: `${progress}%`, background: project.color }} /></div>
      <div className="project-card-foot"><span>Project progress</span><b style={{ color: project.color }}>{progress}%</b></div>
      <div className="project-large-actions">
        <button className="text-button" onClick={onOpen}>View tasks →</button>
        <span style={{ fontSize: 9, color: "var(--muted)" }}>{progress === 100 ? "Completed" : "In progress"}</span>
      </div>
    </div>
  );
}

export default App;
