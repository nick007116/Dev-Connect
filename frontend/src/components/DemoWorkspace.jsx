import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GitBranch,
  MessageSquare,
  Monitor,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Wrench
} from 'lucide-react';
import LogOut from './LogOut';

const demoUser = {
  name: 'Demo Developer',
  bio: 'Exploring DevConnect',
  profilePic: 'https://ui-avatars.com/api/?name=Demo+Developer&background=6366f1&color=ffffff&size=128'
};

const conversations = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', color: 'from-blue-400 to-indigo-500', preview: 'Pushed the new component API', time: '2m', online: true },
  { id: 'frontend', name: 'Frontend Team', initials: 'FT', color: 'from-rose-400 to-purple-500', preview: 'The flow diagram is looking good!', time: '18m', online: true },
  { id: 'alex', name: 'Alex Rivera', initials: 'AR', color: 'from-amber-400 to-orange-500', preview: 'Thanks, that fixed it 🙌', time: '1h', online: false }
];

const sectionByPath = {
  '/demo/chat': 'Messages',
  '/demo/diagrams': 'Diagrams',
  '/demo/project-ai': 'AI Project Studio',
  '/demo/learning-hub': 'Learning Hub',
  '/demo/dev-tools': 'Dev Tools',
  '/demo/remote-desktop': 'Remote Desktop'
};

const DemoNotice = () => (
  <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 md:px-6">
    <ShieldCheck className="h-4 w-4 shrink-0" />
    <span className="flex-1">Demo preview · Sample data only. Actions like sending, saving, AI generation, and screen sharing are disabled.</span>
  </div>
);

const DisabledAction = ({ children }) => (
  <button
    type="button"
    disabled
    title="Unavailable in the read-only demo"
    className="cursor-not-allowed rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500"
  >
    {children}
  </button>
);

const MessagesPreview = () => {
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [search, setSearch] = useState('');
  const selected = conversations.find(({ id }) => id === selectedId);
  const visibleConversations = useMemo(() => (
    conversations.filter(({ name }) => name.toLowerCase().includes(search.toLowerCase()))
  ), [search]);

  return (
    <div className="flex h-full min-h-[calc(100vh-110px)] flex-col bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 md:flex-row">
      <aside className="flex w-full max-w-none flex-col border-r border-indigo-100 bg-white/90 backdrop-blur-xl md:max-w-sm">
        <div className="border-b border-indigo-100 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 p-3 shadow-lg"><MessageSquare className="h-6 w-6 text-white" /></div>
            <div><h1 className="text-xl font-bold text-indigo-700">Messages</h1><p className="text-sm text-indigo-500/70">Welcome, {demoUser.name}</p></div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-indigo-400" />
            <input aria-label="Search demo conversations" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="w-full rounded-xl border border-indigo-100 bg-white py-3 pl-11 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {visibleConversations.map((person) => (
            <button key={person.id} onClick={() => setSelectedId(person.id)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${selectedId === person.id ? 'bg-blue-100' : 'hover:bg-indigo-50'}`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${person.color} font-semibold text-white`}>{person.initials}</div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2"><span className="truncate font-semibold text-gray-800">{person.name}</span><span className="text-xs text-gray-400">{person.time}</span></div>
                <p className="mt-1 truncate text-sm text-gray-500">{person.preview}</p>
                <span className={`mt-1 inline-flex items-center gap-1 text-xs ${person.online ? 'text-emerald-600' : 'text-gray-400'}`}><span className={`h-1.5 w-1.5 rounded-full ${person.online ? 'bg-emerald-500' : 'bg-gray-300'}`} />{person.online ? 'Online' : 'Offline'}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <section className="flex min-h-[300px] min-w-0 flex-1 flex-col bg-white/70">
        <header className="flex items-center gap-3 border-b border-indigo-100 bg-white/80 p-5">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${selected.color} font-semibold text-white`}>{selected.initials}</div>
          <div><h2 className="font-semibold text-gray-800">{selected.name}</h2><p className="text-sm text-emerald-600">{selected.online ? 'Online' : 'Offline'}</p></div>
          <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">Preview</span>
        </header>
        <div className="flex flex-1 flex-col justify-end gap-5 overflow-y-auto p-6 lg:p-10">
          <p className="text-center text-xs text-gray-400">Today · 10:42 AM</p>
          <div className="max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-white p-4 text-sm text-gray-700 shadow">Hey! I pushed the updated component API. The props are much simpler now.</div>
          <div className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-sm text-white shadow">Nice, that looks great. I’ll update the integration and run through the examples.</div>
          <div className="max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-white p-4 text-sm text-gray-700 shadow">{selected.preview}</div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-400"><span className="flex-1 text-sm">Read-only demo — messages are disabled</span><Send className="h-4 w-4" /></div>
        </div>
      </section>
    </div>
  );
};

const FeaturePreview = ({ title, description, icon: Icon, children }) => (
  <div className="min-h-full bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 p-5 md:p-10">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white shadow-lg"><Icon className="h-6 w-6" /></div>
        <div><h1 className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</h1><p className="mt-1 text-sm text-gray-500">{description}</p></div>
        <span className="ml-auto rounded-full border border-purple-200 bg-white/70 px-3 py-1 text-xs font-medium text-purple-700">Sample preview</span>
      </div>
      {children}
    </div>
  </div>
);

const DemoContent = ({ section }) => {
  if (section === 'Messages') return <MessagesPreview />;
  if (section === 'Diagrams') {
    return (
      <FeaturePreview title="Diagrams & whiteboard" description="Explore a sample team diagram." icon={GitBranch}>
        <div className="rounded-2xl border border-purple-100 bg-white/90 p-5 shadow-xl md:p-8">
          <div className="mb-6"><h2 className="font-semibold text-gray-800">Checkout flow</h2><p className="text-sm text-gray-500">Shared by Maya Chen · 12 minutes ago</p></div>
          <div className="flex min-h-72 flex-wrap items-center justify-center gap-4 rounded-xl bg-grid-pattern p-5">
            {['Cart', 'Checkout', 'Validate payment', 'Confirmation'].map((node, index) => (
              <React.Fragment key={node}>
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 font-medium text-purple-800 shadow-sm">{node}</div>
                {index < 3 && <span className="text-2xl text-purple-400">→</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-5"><DisabledAction>Edit diagram</DisabledAction></div>
        </div>
      </FeaturePreview>
    );
  }
  if (section === 'AI Project Studio') {
    return (
      <FeaturePreview title="AI Project Studio" description="Example project plans generated for the demo workspace." icon={Sparkles}>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['Realtime task board', 'A team task board with project spaces, activity updates, and a clean collaboration workflow.', ['React', 'Node.js', 'Socket.IO']],
            ['Study group planner', 'A simple way to organize study sessions, share resources, and keep learning goals on track.', ['React', 'Firebase', 'Tailwind']]
          ].map(([name, description, tags]) => (
            <article key={name} className="rounded-2xl border border-purple-100 bg-white/90 p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800">{name}</h2><p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
              <div className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">{tag}</span>)}</div>
              <div className="mt-6"><DisabledAction>Generate project</DisabledAction></div>
            </article>
          ))}
        </div>
      </FeaturePreview>
    );
  }
  if (section === 'Learning Hub') {
    return (
      <FeaturePreview title="Smart Learning Hub" description="Sample learning paths and progress." icon={BookOpen}>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['React patterns in practice', 'Intermediate · 8 modules', 62],
            ['TypeScript essentials', 'Beginner · 6 modules', 35],
            ['Designing realtime apps', 'Advanced · 5 modules', 18]
          ].map(([name, details, progress]) => (
            <article key={name} className="rounded-2xl border border-indigo-100 bg-white/90 p-6 shadow-lg">
              <h2 className="font-semibold text-gray-800">{name}</h2><p className="mt-1 text-sm text-gray-500">{details}</p>
              <div className="mt-5 h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-right text-xs text-gray-500">{progress}% complete</p>
              <div className="mt-4"><DisabledAction>Continue learning</DisabledAction></div>
            </article>
          ))}
        </div>
      </FeaturePreview>
    );
  }
  if (section === 'Dev Tools') {
    return (
      <FeaturePreview title="Developer Tools" description="A preview of handy tools in your workspace." icon={Wrench}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Color gradient', 'Preview a gradient and copy CSS.'],
            ['QR code generator', 'Create styled QR codes for links.'],
            ['Code snippets', 'Keep useful snippets organized.']
          ].map(([name, description]) => <article key={name} className="rounded-2xl border border-indigo-100 bg-white/90 p-6 shadow-lg"><h2 className="font-semibold text-gray-800">{name}</h2><p className="mt-2 text-sm text-gray-600">{description}</p></article>)}
        </div>
      </FeaturePreview>
    );
  }
  return (
    <FeaturePreview title="Remote Desktop" description="Preview the team screen-sharing workflow." icon={Monitor}>
      <div className="mx-auto max-w-3xl rounded-2xl border border-purple-100 bg-white/90 p-8 text-center shadow-xl">
        <Monitor className="mx-auto h-12 w-12 text-purple-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-800">Share a workspace with your team</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600">Host a screen-share session or join a teammate to pair on a project. Live sharing is disabled in this demo.</p>
        <div className="mt-6"><DisabledAction>Start screen share</DisabledAction></div>
      </div>
    </FeaturePreview>
  );
};

const DemoWorkspace = ({ onExit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const section = sectionByPath[location.pathname] || 'Messages';
  const isLogout = location.pathname === '/demo/logout';

  if (isLogout) return <LogOut onLogoutComplete={onExit} />;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <DemoNotice />
      <div className="flex min-h-0 flex-1">
        <main className="min-h-0 min-w-0 flex-1 overflow-auto">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/60 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><span className="text-gray-400">DevConnect</span><span>/</span>{section}</div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 sm:inline">Demo user</span>
              <button onClick={() => navigate('/demo/logout')} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Exit demo</button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto"><DemoContent section={section} /></div>
        </main>
      </div>
    </div>
  );
};

export default DemoWorkspace;
