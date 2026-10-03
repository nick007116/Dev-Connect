import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Command,
  FileCode2,
  GitBranch,
  LayoutDashboard,
  MessageCircle,
  MonitorUp,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  WandSparkles
} from 'lucide-react';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageCircle, count: '3' },
  { id: 'diagrams', label: 'Diagrams', icon: GitBranch },
  { id: 'projects', label: 'AI Projects', icon: Sparkles },
  { id: 'learning', label: 'Learning hub', icon: BookOpen },
  { id: 'tools', label: 'Dev tools', icon: Code2 },
  { id: 'remote', label: 'Remote share', icon: MonitorUp }
];

const conversations = [
  { name: 'Maya Chen', initials: 'MC', color: 'bg-violet-400', preview: 'Pushed the new component API', time: '2m', online: true },
  { name: 'Frontend crew', initials: 'FC', color: 'bg-cyan-400', preview: 'You: diagram looks good!', time: '18m', online: true },
  { name: 'Alex Rivera', initials: 'AR', color: 'bg-amber-400', preview: 'Thanks, that fixed it 🙌', time: '1h', online: false }
];

const activity = [
  { initials: 'MC', color: 'bg-violet-400', name: 'Maya Chen', action: 'shared a diagram', detail: 'Checkout flow · 12 min ago' },
  { initials: 'AR', color: 'bg-amber-400', name: 'Alex Rivera', action: 'completed a challenge', detail: 'React state patterns · 38 min ago' },
  { initials: 'JD', color: 'bg-emerald-400', name: 'Jordan Lee', action: 'started a project', detail: 'Realtime task board · 1 hr ago' }
];

const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="mb-8">
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">{eyebrow}</p>
    <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
    {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
  </div>
);

const Avatar = ({ initials, color, size = 'h-10 w-10' }) => (
  <div className={`${size} ${color} flex shrink-0 items-center justify-center rounded-2xl text-xs font-semibold text-slate-950`}>
    {initials}
  </div>
);

const StatCard = ({ label, value, change, icon: Icon }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <Icon className="h-4 w-4 text-violet-300" />
    </div>
    <div className="mt-4 flex items-end justify-between">
      <span className="text-3xl font-semibold text-white">{value}</span>
      <span className="flex items-center gap-1 text-xs text-emerald-300"><ArrowUpRight className="h-3.5 w-3.5" />{change}</span>
    </div>
  </div>
);

const Overview = ({ onNavigate }) => (
  <>
    <SectionHeading eyebrow="Saturday, October 3" title="Your workspace" description="A sample snapshot of your DevConnect community." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Collaborators" value="24" change="12%" icon={Users} />
      <StatCard label="Projects created" value="08" change="3 this week" icon={FileCode2} />
      <StatCard label="Diagrams shared" value="16" change="4 this week" icon={GitBranch} />
      <StatCard label="Learning streak" value="7 days" change="On a roll" icon={Activity} />
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div><h2 className="font-medium text-white">Recent activity</h2><p className="mt-1 text-xs text-slate-500">What your team has been up to</p></div>
          <button onClick={() => onNavigate('messages')} className="text-xs text-violet-300 hover:text-violet-200">Explore workspace</button>
        </div>
        <div className="space-y-5">
          {activity.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <Avatar initials={item.initials} color={item.color} size="h-9 w-9" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm text-slate-200"><span className="font-medium text-white">{item.name}</span> {item.action}</p><p className="mt-1 text-xs text-slate-500">{item.detail}</p></div>
              <MoreHorizontal className="h-4 w-4 text-slate-600" />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-violet-300/10 bg-gradient-to-br from-violet-500/10 to-blue-500/5 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200"><WandSparkles className="h-5 w-5" /></div>
        <h2 className="mt-5 text-lg font-medium text-white">Build something great</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Turn an idea into a project plan, map out a system, or pair with your team.</p>
        <button onClick={() => onNavigate('projects')} className="mt-5 flex items-center gap-2 text-sm font-medium text-violet-200 hover:text-white">Explore AI project tools <ChevronRight className="h-4 w-4" /></button>
        <div className="mt-7 flex -space-x-2">
          {conversations.map((person) => <Avatar key={person.name} initials={person.initials} color={person.color} size="h-8 w-8 rounded-xl border-2 border-[#121523] text-[10px]" />)}
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#121523] bg-slate-700 text-[10px] text-white">+21</div>
        </div>
      </section>
    </div>
    <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6">
      <div className="mb-5 flex items-center justify-between"><div><h2 className="font-medium text-white">Continue learning</h2><p className="mt-1 text-xs text-slate-500">Pick up where you left off</p></div><button onClick={() => onNavigate('learning')} className="text-xs text-violet-300 hover:text-violet-200">View learning hub</button></div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200"><Code2 className="h-5 w-5" /></div>
        <div className="flex-1"><p className="text-sm font-medium text-white">React patterns in practice</p><p className="mt-1 text-xs text-slate-500">Module 4 of 8 · 25 minutes left</p></div>
        <div className="w-full sm:w-48"><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Progress</span><span>62%</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-1.5 w-[62%] rounded-full bg-cyan-300" /></div></div>
      </div>
    </div>
  </>
);

const Messages = () => {
  const [selected, setSelected] = useState(0);
  const person = conversations[selected];
  return (
    <>
      <SectionHeading eyebrow="Community" title="Messages" description="A preview of conversations in a collaborative workspace." />
      <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] lg:grid-cols-[290px_1fr]">
        <aside className="border-b border-white/[0.07] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-white/[0.07] p-4"><span className="text-sm font-medium text-white">Conversations</span><Plus className="h-4 w-4 text-slate-500" /></div>
          <div className="border-b border-white/[0.07] p-3"><div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2"><Search className="h-3.5 w-3.5 text-slate-500" /><span className="text-xs text-slate-500">Find a conversation</span></div></div>
          {conversations.map((item, index) => (
            <button key={item.name} onClick={() => setSelected(index)} className={`flex w-full items-center gap-3 border-b border-white/[0.04] p-4 text-left transition-colors ${selected === index ? 'bg-violet-400/[0.08]' : 'hover:bg-white/[0.025]'}`}>
              <div className="relative"><Avatar initials={item.initials} color={item.color} size="h-10 w-10" />{item.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#11131d] bg-emerald-400" />}</div>
              <div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><span className="truncate text-sm font-medium text-slate-200">{item.name}</span><span className="text-[10px] text-slate-500">{item.time}</span></div><p className="mt-1 truncate text-xs text-slate-500">{item.preview}</p></div>
            </button>
          ))}
        </aside>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 border-b border-white/[0.07] p-4"><Avatar initials={person.initials} color={person.color} size="h-9 w-9" /><div><p className="text-sm font-medium text-white">{person.name}</p><p className="mt-0.5 text-[11px] text-emerald-300">{person.online ? 'Online' : 'Last seen recently'}</p></div><MoreHorizontal className="ml-auto h-4 w-4 text-slate-500" /></div>
          <div className="flex flex-1 flex-col justify-end gap-5 p-5 sm:p-8">
            <p className="text-center text-[10px] uppercase tracking-widest text-slate-600">Today · 10:42 AM</p>
            <div className="flex items-end gap-2"><Avatar initials={person.initials} color={person.color} size="h-7 w-7 rounded-xl text-[9px]" /><div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3 text-sm leading-6 text-slate-200">Hey! I pushed the updated component API. The props are much simpler now.</div></div>
            <div className="flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-br-md bg-violet-500/20 px-4 py-3 text-sm leading-6 text-violet-50">Nice, that looks great. I’ll update the integration and run through the examples.</div></div>
            <div className="flex items-end gap-2"><Avatar initials={person.initials} color={person.color} size="h-7 w-7 rounded-xl text-[9px]" /><div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3 text-sm leading-6 text-slate-200">Pushed the new component API</div></div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-slate-600"><span className="flex-1 text-xs">Demo preview — messaging is read-only</span><Send className="h-4 w-4" /></div>
          </div>
        </div>
      </div>
    </>
  );
};

const Diagrams = () => (
  <>
    <SectionHeading eyebrow="Think visually" title="Diagrams & whiteboards" description="Map out an idea, then bring the whole team into the conversation." />
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-white/[0.07] bg-[#10131d] p-5 sm:p-8">
        <div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-medium text-white">Checkout flow</p><p className="mt-1 text-xs text-slate-500">Updated by Maya · 12 minutes ago</p></div><span className="rounded-lg bg-emerald-300/10 px-2.5 py-1 text-[10px] text-emerald-200">Shared</span></div>
        <div className="grid min-h-[320px] place-items-center rounded-xl border border-white/[0.05] bg-grid-pattern p-5">
          <svg viewBox="0 0 700 330" className="w-full max-w-3xl" role="img" aria-label="Sample checkout process flow diagram">
            <defs><marker id="demo-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8077f5" /></marker></defs>
            <g fill="none" stroke="#8077f5" strokeWidth="2" markerEnd="url(#demo-arrow)">
              <path d="M140 160 H240" /><path d="M350 160 H440" /><path d="M295 190 V260 H495 V195" /><path d="M545 135 V70 H350 V125" />
            </g>
            <g fontFamily="sans-serif" fontSize="14" textAnchor="middle">
              <rect x="40" y="130" width="100" height="60" rx="14" fill="#24233f" stroke="#7068dc" /><text x="90" y="165" fill="#e5e3ff">Cart</text>
              <rect x="240" y="130" width="110" height="60" rx="14" fill="#24233f" stroke="#7068dc" /><text x="295" y="165" fill="#e5e3ff">Checkout</text>
              <polygon points="495,120 550,160 495,200 440,160" fill="#322b3c" stroke="#de9b69" /><text x="495" y="165" fill="#ffe5cc">Valid?</text>
              <rect x="240" y="35" width="110" height="60" rx="14" fill="#203734" stroke="#5bbaa3" /><text x="295" y="70" fill="#d4fff2">Confirm</text>
              <rect x="445" y="260" width="100" height="50" rx="14" fill="#3b2632" stroke="#ce7197" /><text x="495" y="291" fill="#ffe0ec">Review</text>
            </g>
          </svg>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-slate-500"><span className="flex items-center gap-1.5"><Avatar initials="MC" color="bg-violet-400" size="h-5 w-5 rounded-md text-[7px]" /> Maya Chen</span><span className="flex items-center gap-1.5"><Avatar initials="AR" color="bg-amber-400" size="h-5 w-5 rounded-md text-[7px]" /> Alex Rivera</span></div>
      </div>
      <div className="space-y-3"><div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5"><p className="text-sm font-medium text-white">Diagram details</p><p className="mt-4 text-xs text-slate-500">Type</p><p className="mt-1 text-sm text-slate-300">Flowchart</p><p className="mt-4 text-xs text-slate-500">Collaborators</p><p className="mt-1 text-sm text-slate-300">3 people</p><div className="mt-5 flex -space-x-2"><Avatar initials="MC" color="bg-violet-400" size="h-8 w-8 rounded-xl border-2 border-[#11131d] text-[9px]" /><Avatar initials="AR" color="bg-amber-400" size="h-8 w-8 rounded-xl border-2 border-[#11131d] text-[9px]" /><Avatar initials="JD" color="bg-emerald-400" size="h-8 w-8 rounded-xl border-2 border-[#11131d] text-[9px]" /></div></div><div className="rounded-2xl border border-violet-300/10 bg-violet-300/[0.05] p-5"><Sparkles className="h-5 w-5 text-violet-200" /><p className="mt-3 text-sm font-medium text-white">AI-assisted diagrams</p><p className="mt-2 text-xs leading-5 text-slate-400">Start with a description and let AI draft the first version.</p></div></div>
    </div>
  </>
);

const ShowcaseCards = ({ section }) => {
  const content = {
    projects: {
      eyebrow: 'From idea to first commit',
      title: 'AI project kickstarter',
      description: 'Shape a rough idea into a practical starter plan.',
      icon: WandSparkles,
      cards: [
        ['Realtime task board', 'A collaborative board with live updates, project spaces, and a clean activity timeline.', ['React', 'Firebase', 'Tailwind CSS']],
        ['Personal finance tracker', 'A privacy-minded dashboard for budgets, recurring expenses, and monthly insights.', ['Next.js', 'TypeScript', 'PostgreSQL']],
        ['Study group planner', 'Help small groups schedule sessions, track goals, and share useful resources.', ['React', 'Node.js', 'Socket.IO']]
      ]
    },
    learning: {
      eyebrow: 'Learn by building',
      title: 'Smart learning hub',
      description: 'Sample learning paths, bite-sized challenges, and community mentorship.',
      icon: BookOpen,
      cards: [
        ['React patterns in practice', '8 modules · Intermediate · 62% complete', ['Hooks', 'Composition', 'State']],
        ['TypeScript essentials', '6 modules · Beginner · 3 hours', ['Types', 'Generics', 'Tooling']],
        ['Designing realtime apps', '5 modules · Advanced · 4.5 hours', ['WebSockets', 'Sync', 'Architecture']]
      ]
    },
    tools: {
      eyebrow: 'Useful little helpers',
      title: 'Developer tools',
      description: 'A quick look at the everyday utilities available in the workspace.',
      icon: Code2,
      cards: [
        ['Gradient studio', 'Compose and preview a custom CSS gradient.', ['Color picker', 'CSS output', 'Presets']],
        ['QR code maker', 'Preview a styled QR code for a link or short note.', ['Colors', 'Logo', 'Export']],
        ['Snippet library', 'Keep small, reusable code examples close at hand.', ['JavaScript', 'CSS', 'Markdown']]
      ]
    },
    remote: {
      eyebrow: 'Pair from anywhere',
      title: 'Remote desktop sharing',
      description: 'A product preview of the screen-sharing flow. Live sharing is disabled in this showcase.',
      icon: MonitorUp,
      cards: [
        ['Share a workspace', 'Start a session and invite teammates with a private session link.', ['Host controls', 'Screen stream', 'Invite link']],
        ['Join a session', 'Connect as a viewer and follow along with a teammate.', ['Low latency', 'Secure session', 'Team access']],
        ['Built for pairing', 'Keep collaboration focused with participant and session controls.', ['Participants', 'Session status', 'WebRTC']]
      ]
    }
  }[section];
  const Icon = content.icon;
  return (
    <>
      <SectionHeading eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="grid gap-4 lg:grid-cols-3">
        {content.cards.map(([title, description, tags], index) => (
          <article key={title} className="flex min-h-[265px] flex-col rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200"><Icon className="h-5 w-5" /></div>
            <p className="mt-6 text-base font-medium text-white">{title}</p><p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{description}</p>
            <div className="mt-5 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-[10px] text-slate-400">{tag}</span>)}</div>
            {index === 0 && <span className="mt-5 flex items-center gap-1 text-xs text-violet-200">Sample preview <ChevronRight className="h-3.5 w-3.5" /></span>}
          </article>
        ))}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/10 bg-amber-100/[0.035] p-5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" /><p className="text-xs leading-5 text-slate-400">You’re exploring a read-only preview. The content shown here is sample data; sign-in, saving, and live connections are turned off.</p></div>
    </>
  );
};

const DemoShowcase = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const activeNav = navigation.find((item) => item.id === activeSection) || navigation[0];
  const ActiveIcon = activeNav.icon;

  return (
    <div className="min-h-screen bg-[#0d0f17] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#10121b] px-4 py-5 md:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-blue-400 text-slate-950"><Command className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold tracking-wide text-white">devconnect</p><p className="mt-0.5 text-[10px] text-slate-500">TEAM WORKSPACE</p></div>
          </div>
          <div className="mt-9 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Workspace</div>
          <nav className="mt-3 space-y-1">
            {navigation.map(({ id, label, icon: Icon, count }) => (
              <button key={id} onClick={() => setActiveSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${activeSection === id ? 'bg-violet-400/10 font-medium text-violet-100' : 'text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'}`}>
                <Icon className={`h-4 w-4 ${activeSection === id ? 'text-violet-200' : 'text-slate-500'}`} /><span className="flex-1">{label}</span>{count && <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400">{count}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Preview mode</div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Sample workspace · Read only</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0d0f17]/90 px-4 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.045] text-slate-400 md:hidden"><Command className="h-4 w-4" /></span><div className="flex items-center gap-2 text-xs text-slate-500"><span className="hidden sm:inline">Workspace</span><ChevronRight className="hidden h-3 w-3 sm:inline" /><span className="flex items-center gap-2 text-slate-200"><ActiveIcon className="h-3.5 w-3.5 text-violet-200" />{activeNav.label}</span></div></div>
            <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] text-slate-500 sm:flex"><Search className="h-3 w-3" />Search preview<span className="ml-2 rounded border border-white/[0.08] px-1.5 py-0.5">⌘ K</span></div><span className="rounded-lg border border-violet-300/10 bg-violet-300/[0.06] px-2.5 py-1.5 text-[10px] font-medium text-violet-200">DEMO</span><Avatar initials="DC" color="bg-gradient-to-br from-violet-300 to-blue-300" size="h-8 w-8 rounded-xl text-[10px]" /></div>
          </header>
          <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-8 md:pb-10">
            {activeSection === 'overview' && <Overview onNavigate={setActiveSection} />}
            {activeSection === 'messages' && <Messages />}
            {activeSection === 'diagrams' && <Diagrams />}
            {['projects', 'learning', 'tools', 'remote'].includes(activeSection) && <ShowcaseCards section={activeSection} />}
          </div>
          <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-white/[0.07] bg-[#10121b]/95 px-1 py-2 backdrop-blur-xl md:hidden">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)} aria-label={label} className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-2 py-1.5 ${activeSection === id ? 'text-violet-200' : 'text-slate-500'}`}><Icon className="h-4 w-4" /><span className="max-w-14 truncate text-[9px]">{label}</span></button>
            ))}
          </nav>
        </main>
      </div>
      <div className="pointer-events-none fixed bottom-20 right-5 z-10 hidden rounded-full border border-white/[0.08] bg-[#171925] px-3 py-2 text-[10px] text-slate-400 shadow-xl md:block"><span className="mr-1.5 text-emerald-300"><Check className="inline h-3 w-3" /></span>Sample data only</div>
    </div>
  );
};

export default DemoShowcase;
