# Nexus — Productivity Workspace

A polished, responsive React + TypeScript productivity dashboard built with Vite, Framer Motion, Recharts and Lucide icons.

## Features
- Responsive dashboard with animated hero, metrics and activity chart
- Create, edit, complete and delete tasks
- Task priorities, statuses, descriptions, due dates and project assignment
- Create, edit and delete projects with custom colors
- Kanban board with task status transitions
- Task calendar / due-date list
- Search across tasks, descriptions and projects
- Status and priority filters
- Dark/light theme toggle
- Notification popover and keyboard shortcuts
- Local persistence with `localStorage`
- Responsive mobile navigation and reduced-motion support

## Requirements
Node.js 20.19+ or 22.12+ recommended.

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite, usually http://localhost:5173.

## Production build
```bash
npm run build
npm run preview
```

## Keyboard shortcuts
- `Ctrl + K` / `⌘ + K`: focus search
- `Ctrl + N` / `⌘ + N`: create task
- `Escape`: close dialogs / notifications

## Notes
- Data is saved in this browser's localStorage; there is no backend or account sync in this version.
- The activity chart uses illustrative sample data. Dashboard counts and project progress are derived from your tasks.
- The displayed greeting/profile name is placeholder content; edit `src/App.tsx` to personalize it.
