import { useEffect, useState, useRef } from "react";
import { 
  ArrowRight, 
  BarChart3, 
  Building2, 
  Network, 
  Sparkles, 
  Workflow, 
  Check, 
  Zap, 
  HelpCircle, 
  ChevronRight,
  ChevronDown, 
  Play, 
  Users, 
  Layers, 
  Clock, 
  TrendingUp,
  Layout,
  GitBranch,
  ShieldAlert
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

// Showcase items using public png assets
const showcaseItems = [
  {
    id: "dashboard",
    title: "Analytics Dashboard",
    badge: "Control Center",
    description: "Monitor team velocity, board statuses, and task backlogs in one clean, high-contrast control center.",
    image: "/dashboard.png",
  },
  {
    id: "workflow",
    title: "Visual Workflow Canvas",
    badge: "Automation Pipelines",
    description: "Map operations to pipelines that auto-run work items through custom visual stage markers.",
    image: "/workflow.png",
  },
  {
    id: "task",
    title: "Interactive Task Boards",
    badge: "Task Orchestration",
    description: "Keep todo, progress, and review items clearly visible across your entire organizational workflow.",
    image: "/task.png",
  },
  {
    id: "organization",
    title: "Organization Canvas",
    badge: "Dynamic Hierarchy",
    description: "Inspect reporting relationships and edit department structures inside a zoomable tree canvas.",
    image: "/organization.png",
  },
];

// Technical company logos custom inline SVGs (high quality, modern)
const techBrands = [
  {
    name: "Linear",
    icon: (
      <svg className="h-5 w-auto fill-zinc-500 transition-colors hover:fill-zinc-300" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm4.2 14.2a6 6 0 1 1 0-8.4A6 6 0 0 1 14.2 14.2zM10 6a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 2.5a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 10 8.5z"/>
      </svg>
    )
  },
  {
    name: "Vercel",
    icon: (
      <svg className="h-5 w-auto fill-zinc-500 transition-colors hover:fill-zinc-300" viewBox="0 0 74 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M37.5 0L75 64H0L37.5 0Z" />
      </svg>
    )
  },
  {
    name: "Stripe",
    icon: (
      <svg className="h-5 w-auto fill-zinc-500 transition-colors hover:fill-zinc-300" viewBox="0 0 80 33" xmlns="http://www.w3.org/2000/svg">
        <path d="M79.2 16.2c0-5.8-2.8-8.9-8-8.9-5.3 0-8.6 3.3-8.6 9 0 6.2 3.5 9 8.8 9 2.7 0 4.8-.6 6-1.3V21c-1.3.6-2.9.9-4.7.9-3.2 0-4.8-1.2-4.9-3.4h11.2c.1-.8.2-1.7.2-2.3zm-11.2-1.8c0-2 1.2-3 2.9-3s2.9 1 2.9 3h-5.8zm-11.7.6c0-4.7-2.3-7.7-6.9-7.7-2.1 0-3.9 1-4.7 2V8H34.4v24.2h5.5v-7.8c.9 1 2.5 1.9 4.7 1.9 4.5-.1 6.9-3.1 6.9-7.8zm-5.4.1c0 3.2-1.5 4.6-3.6 4.6s-3.6-1.4-3.6-4.6c0-3.3 1.5-4.6 3.6-4.6s3.6 1.3 3.6 4.6zm-17.1-9c-1.4-.5-3.3-.8-4.8-.8-3.3 0-5.3 1.5-5.3 4.1 0 4.9 6.8 3.6 6.8 6.7 0 1-.9 1.6-2.3 1.6-1.8 0-3.8-.7-4.9-1.4v4.5c1.4.6 3.5 1 5.2 1 3.5 0 5.6-1.6 5.6-4.3 0-5.1-6.8-3.7-6.8-6.7 0-1 .9-1.5 2.1-1.5 1.6 0 3.2.5 4.1 1v-4.6zm-8.8-4V1.7H9.7v6.1H4.4V11h5.3v10.5c0 4.1 2 5.9 5.8 5.9 1.5 0 2.8-.2 3.6-.6V22c-.6.3-1.4.4-2.2.4-2 0-2.8-.8-2.8-3V11h5.1V7.8h-5.1zM2.8 7.8C1.2 7.8 0 9 0 10.6s1.2 2.8 2.8 2.8 2.8-1.2 2.8-2.8S4.3 7.8 2.8 7.8zm2.8 19.8V11H0v16.6h5.6z" />
      </svg>
    )
  },
  {
    name: "GitHub",
    icon: (
      <svg className="h-5 w-auto fill-zinc-500 transition-colors hover:fill-zinc-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    )
  },
  {
    name: "Raycast",
    icon: (
      <svg className="h-5 w-auto fill-zinc-500 transition-colors hover:fill-zinc-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18.25c-3.452 0-6.25-2.798-6.25-6.25S8.548 5.75 12 5.75c3.452 0 6.25 2.798 6.25 6.25s-2.798 6.25-6.25 6.25zm2.75-6.25c0 1.519-1.231 2.75-2.75 2.75S9.25 13.519 9.25 12s1.231-2.75 2.75-2.75 2.75 1.231 2.75 2.75z" />
      </svg>
    )
  },
  {
    name: "Asana",
    icon: (
      <svg className="h-5 w-auto fill-zinc-500 transition-colors hover:fill-zinc-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z" />
      </svg>
    )
  }
];

export function LandingPage() {
  const navigate = useNavigate();

  // Active showcase tab & automation timers
  const [activeTab, setActiveTab] = useState("dashboard");
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const progressInterval = useRef(null);

  // Simulated Kanban state
  const [kanbanStage, setKanbanStage] = useState(0); // 0 = Todo, 1 = In Progress, 2 = Done
  const [isSimulatingDrag, setIsSimulatingDrag] = useState(false);

  // Simulated hierarchy promotion state
  const [promotedNode, setPromotedNode] = useState(false);

  // Pricing switch
  const [isYearly, setIsYearly] = useState(false);

  // FAQ Accordion open states
  const [openFaq, setOpenFaq] = useState(null);

  // Set page headers
  useEffect(() => {
    document.title = "Flowboard | Workspace & reporting hierarchy builder";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Flowboard orchestrates your entire organization. Plan department structures on a tree canvas, track progress, and run stage-by-stage workflow boards."
    );
  }, []);

  // Showroom cycle effect
  useEffect(() => {
    if (isHovered) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    const intervalTime = 50; // increment every 50ms
    const maxProgress = 100;
    const duration = 5000; // 5 seconds per tab
    const steps = duration / intervalTime;
    const increment = maxProgress / steps;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // move to next tab
          setActiveTab((currentTab) => {
            const index = showcaseItems.findIndex((item) => item.id === currentTab);
            const nextIndex = (index + 1) % showcaseItems.length;
            return showcaseItems[nextIndex].id;
          });
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isHovered, activeTab]);

  // Tab click handler
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setProgress(0);
  };

  // Kanban Simulation Trigger
  const triggerKanbanSimulation = () => {
    if (isSimulatingDrag) return;
    setIsSimulatingDrag(true);
    setKanbanStage(0);
    
    // Animate stage shifts
    setTimeout(() => {
      setKanbanStage(1);
    }, 1200);

    setTimeout(() => {
      setKanbanStage(2);
    }, 2600);

    setTimeout(() => {
      setIsSimulatingDrag(false);
    }, 4000);
  };

  const faqItems = [
    {
      q: "What is an Organization Canvas?",
      a: "The Organization Canvas is a visual interactive chart where you map reporting relationships as nodes. You can drag, inspect, or add reporting lines on the fly rather than writing complex corporate databases manually.",
    },
    {
      q: "How do Workflow Boards work?",
      a: "Workflow Boards let you set up stage-by-stage pipelines (e.g. Backlog, In Progress, In Review, Done). Tasks automatically lock into lanes and display visible status updates, making team capacity fully transparent.",
    },
    {
      q: "Can I manage employees and reporting lines simultaneously?",
      a: "Yes! Creating an organization automatically hooks employee records to the hierarchy chart. You can promote members, update managers, and manage operational tasks all under the same single workspace.",
    },
    {
      q: "Is there a limit on free organizations?",
      a: "The Starter plan is completely free and allows you to build an organization with up to 10 members, run 3 concurrent workflows, and access core canvases. Upgrading unlocks unlimited pipelines.",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030303] text-zinc-50 font-sans antialiased">
      {/* Background aesthetics */}
      <div id="home" className="absolute inset-0 bg-[linear-gradient(to_right,#111115_1px,transparent_1px),linear-gradient(to_bottom,#111115_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] h-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.15),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.06),_transparent_35%)] pointer-events-none z-0" />

      {/* Modern sticky glassmorphic Header */}
      <header className="sticky top-0 z-[99] border-b border-zinc-900/60 bg-[#030303]/60 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 p-2.5 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                Flowboard
              </p>
              <p className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">Org Orchestration</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex">
            <a href="#showcase" className="relative py-1 transition-colors hover:text-zinc-100 group">
              Product Studio
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-violet-500 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#features" className="relative py-1 transition-colors hover:text-zinc-100 group">
              Simulators
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-violet-500 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#details" className="relative py-1 transition-colors hover:text-zinc-100 group">
              Capabilities
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-violet-500 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#pricing" className="relative py-1 transition-colors hover:text-zinc-100 group">
              Pricing
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-violet-500 transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
            <Button
              type="button"
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:brightness-110 active:scale-95 transition-all px-5"
              onClick={() => navigate("/login?mode=create-organization")}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-16 md:px-10 text-center">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Light-bordered Badge */}
          <button 
            type="button"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-1.5 text-xs text-zinc-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-zinc-700/80 transition-all"
            onClick={() => navigate("/login?mode=create-organization")}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
            <span className="font-medium tracking-wide">Orchestrate structure and tasks in one canvas</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-500 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Heading */}
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl !leading-[1.12]">
            Orchestrate work with{" "}
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm">
              Precision
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            A canvas-first workspace mapping reporting lines, structural hierarchies, and automated workflow boards. Run operations smoothly from backlog to done.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              type="button"
              className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-8 font-semibold text-white shadow-lg shadow-violet-950/30 hover:brightness-110 hover:shadow-violet-900/30 transition-all duration-300"
              onClick={() => navigate("/login?mode=create-organization")}
            >
              Get started for free
              <ArrowRight className="h-4.5 w-4.5 ml-1.5" />
            </Button>
            <a 
              href="#showcase" 
              className="h-12 inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 px-6 font-semibold text-zinc-300 hover:text-zinc-50 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all"
            >
              Explore Studio
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Product Showcase Showroom (Tabs Deck with Progress Indicators) */}
      <section id="showcase" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="flex flex-col items-center">
          
          {/* Tabs header selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-zinc-900 bg-zinc-950/40 p-2 rounded-2xl max-w-4xl w-full backdrop-blur-md shadow-2xl mb-12">
            {showcaseItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`relative flex flex-col items-start text-left p-3.5 rounded-xl transition-all duration-300 group ${
                    isActive ? "bg-zinc-900/80 border border-zinc-800 shadow-md" : "hover:bg-zinc-900/20"
                  }`}
                  onClick={() => handleTabClick(item.id)}
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">
                    {item.badge}
                  </span>
                  <span className={`text-sm font-semibold transition-colors duration-200 ${isActive ? "text-violet-400" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                    {item.title}
                  </span>
                  
                  {/* Progress bar inside active tab */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-800 rounded-b-xl overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive display image wrapped in Premium card */}
          <div 
            className="relative w-full aspect-[16/10] max-w-5xl rounded-2xl border border-zinc-800/80 bg-[#08080b]/90 p-2.5 md:p-4 shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden transition-all duration-500"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Border Beam floating border effect (conic gradient simulation) */}
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-transparent [mask-image:linear-gradient(white,white)] before:absolute before:inset-[-1.5px] before:rounded-[inherit] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,#a855f7_360deg)] before:animate-spin-slow" />
            <div className="absolute inset-[1px] bg-[#08080b] rounded-[inherit] pointer-events-none z-0" />
            
            {/* Background glowing light gradient */}
            <div className="absolute md:-top-[20%] left-1/2 w-3/4 -translate-x-1/2 h-1/3 inset-0 blur-[6rem] opacity-60 bg-gradient-to-tr from-violet-600/30 to-pink-600/30 pointer-events-none z-0 animate-image-glow" />

            {/* Showcase Active Slide Container */}
            <div className="relative w-full h-full rounded-xl overflow-hidden z-10 border border-zinc-900 bg-zinc-950/80">
              {showcaseItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    className={`absolute inset-0 flex flex-col justify-end transition-all duration-700 ease-in-out ${
                      isActive 
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                        : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                    }`}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover object-top filter brightness-[0.9] hover:scale-[1.01] transition-transform duration-700" 
                    />
                    
                    {/* Caption Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-6 pt-16 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-violet-950/60 border border-violet-900/50 text-violet-300 mb-2">
                          {item.badge}
                        </span>
                        <h3 className="text-xl font-bold text-zinc-100">{item.title}</h3>
                        <p className="text-sm text-zinc-400 max-w-xl mt-1 leading-relaxed">{item.description}</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => navigate("/login?mode=create-organization")}
                        className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 flex items-center shrink-0 self-end md:self-center"
                      >
                        Try dashboard
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Logo Marquee Slider (Social Proof) */}
      <section className="relative z-10 border-y border-zinc-900/80 bg-zinc-950/30 py-12 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 md:px-10 text-center">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 mb-8">
            Orchestrating departments at fast-growing companies
          </h2>
          
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]">
            <div className="flex w-[200%] gap-16 md:gap-24 animate-marquee items-center py-2 select-none">
              {/* Double up elements to make marquee infinite scroll */}
              {techBrands.concat(techBrands).map((brand, idx) => (
                <div key={idx} className="flex items-center gap-3 shrink-0 opacity-40 hover:opacity-80 transition-opacity">
                  {brand.icon}
                  <span className="text-sm font-semibold tracking-wide text-zinc-400">{brand.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid with Live Interactive Simulators */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="rounded-full bg-violet-950/80 text-violet-300 border border-violet-900/50 mb-3 px-3.5 py-1">
            Simulators
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Interact with our tools
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Don't just read about Flowboard—click, promote, and simulate drag tasks live in the playgrounds below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Interactive Drag and Drop simulation */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl transition-all duration-300 hover:border-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
                  Task Automation
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-zinc-200 mb-2">Kanban Pipeline Simulator</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                See how status indicators align dynamically inside the board pipeline when items shift phases.
              </p>

              {/* Kanban mini simulator frame */}
              <div className="border border-zinc-900 bg-[#08080a] p-3 rounded-xl min-h-[150px] relative overflow-hidden mb-6">
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-zinc-500 uppercase pb-2 border-b border-zinc-900 mb-3">
                  <div>To Do</div>
                  <div>Progress</div>
                  <div>Review</div>
                </div>

                <div className="relative h-16">
                  {/* The shifting task card */}
                  <div 
                    className={`absolute top-0 left-0 w-[80px] p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-left text-[10px] transition-all duration-500 select-none ${
                      isSimulatingDrag ? "simulate-drag-active" : ""
                    } ${
                      kanbanStage === 0 ? "border-zinc-700 bg-zinc-900" : ""
                    } ${
                      kanbanStage === 1 ? "border-amber-500 bg-amber-950/20 text-amber-200" : ""
                    } ${
                      kanbanStage === 2 ? "border-emerald-500 bg-emerald-950/20 text-emerald-200" : ""
                    }`}
                    style={!isSimulatingDrag ? {
                      transform: kanbanStage === 0 ? "translate(0px, 5px)" : 
                                 kanbanStage === 1 ? "translate(110px, 5px)" : 
                                 "translate(220px, 5px)"
                    } : undefined}
                  >
                    <p className="font-semibold truncate">Deploy v2.0</p>
                    <p className="text-[8px] text-zinc-500 mt-1 font-mono">
                      {kanbanStage === 0 ? "TODO" : kanbanStage === 1 ? "RUNNING" : "COMPLETE ✓"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={triggerKanbanSimulation}
              disabled={isSimulatingDrag}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold py-2 transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="h-3 w-3" />
              {isSimulatingDrag ? "Simulating Pipeline..." : "Start Drag Simulation"}
            </Button>
          </div>

          {/* Card 2: Interactive Organization Node Promotion */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl transition-all duration-300 hover:border-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">
                  Org Canvas
                </span>
                <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-zinc-200 mb-2">Hierarchy Promoter</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Promote nodes inside the corporate tree and observe direct operational reports update immediately.
              </p>

              {/* Node simulator tree frame */}
              <div className="border border-zinc-900 bg-[#08080a] p-3 rounded-xl min-h-[150px] flex flex-col items-center justify-center relative mb-6">
                {/* Node CEO */}
                <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-semibold text-zinc-300 mb-4 z-10 relative">
                  Alex (CEO)
                </div>

                {/* SVG connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 160 50 L 160 80" stroke="#27272a" strokeWidth="1.5" fill="none" />
                  <path d="M 160 80 L 100 80 L 100 110" stroke={promotedNode ? "#a855f7" : "#27272a"} strokeWidth="1.5" fill="none" />
                  <path d="M 160 80 L 220 80 L 220 110" stroke="#27272a" strokeWidth="1.5" fill="none" />
                </svg>

                {/* Sub Nodes */}
                <div className="flex justify-between w-full px-4 z-10 mt-2">
                  <div className={`px-2 py-1 bg-zinc-900 border rounded text-[9px] font-semibold text-zinc-400 transition-all duration-500 ${promotedNode ? "simulate-node-pulse text-violet-300" : "border-zinc-800"}`}>
                    {promotedNode ? "Sarah (VP of Eng)" : "Sarah (Lead Dev)"}
                  </div>
                  <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-semibold text-zinc-400">
                    Chris (Designer)
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setPromotedNode(!promotedNode)}
              className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold py-2 transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="h-3 w-3 text-pink-400" />
              {promotedNode ? "Demote Sarah" : "Promote Sarah"}
            </Button>
          </div>

          {/* Card 3: Core Features list bento */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl transition-all duration-300 hover:border-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Quick Specs
                </span>
                <span className="text-xs font-semibold text-zinc-500">Dark First</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-200 mb-4">Key Engine Capabilities</h3>
              
              <ul className="space-y-3.5 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-violet-950/80 p-1 text-violet-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>1-click canvas setups</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-violet-950/80 p-1 text-violet-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Infinite zoom tree graphs</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-violet-950/80 p-1 text-violet-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Auto-advancing lanes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-violet-950/80 p-1 text-violet-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Reactive status indicators</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-900 text-left text-xs text-zinc-500 flex items-center justify-between">
              <span>Fully compatible with Chrome & Safari</span>
              <span className="text-[10px] font-semibold text-zinc-400">VITE + RE-FLOW</span>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Spotlight Feature Alternating Blocks */}
      <section id="details" className="relative z-10 border-t border-zinc-900 bg-zinc-950/20 py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 md:px-10 space-y-32">
          
          {/* Spotlight Block 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex rounded-xl bg-violet-950/50 p-3 text-violet-400 border border-violet-900/30">
                <Workflow className="h-6 w-6" />
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Map complex workflows visually on boards
              </h3>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Stop guessing task progress. Our interactive board mapping creates fully visual lanes tailored to your operational velocity. Update backlog priorities, assignees, and stages with zero friction.
              </p>
              
              <ul className="space-y-3 font-medium text-zinc-300">
                <li className="flex items-center gap-3.5">
                  <span className="h-2 w-2 rounded-full bg-pink-500" />
                  <span>Interactive Kanban controls built for rapid scaling</span>
                </li>
                <li className="flex items-center gap-3.5">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <span>Automatic task color shifts depending on current phase</span>
                </li>
                <li className="flex items-center gap-3.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Clean stage status filters and reactive backlog search</span>
                </li>
              </ul>
            </div>

            <div className="relative group p-2 rounded-2xl border border-zinc-900 bg-[#07070a] shadow-2xl overflow-hidden hover:border-zinc-800 transition-all">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-violet-600 to-pink-500 blur-2xl group-hover:scale-105 transition-transform" />
              <img 
                src="/workflow.png" 
                alt="Visual Workflow Canvas" 
                className="relative rounded-xl border border-zinc-950 w-full h-auto object-cover object-center shadow-lg group-hover:scale-[1.005] transition-transform duration-500" 
              />
            </div>
          </div>

          {/* Spotlight Block 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-last lg:order-first group p-2 rounded-2xl border border-zinc-900 bg-[#07070a] shadow-2xl overflow-hidden hover:border-zinc-800 transition-all">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-violet-600 to-pink-500 blur-2xl group-hover:scale-105 transition-transform" />
              <img 
                src="/organization.png" 
                alt="Organization tree canvas" 
                className="relative rounded-xl border border-zinc-950 w-full h-auto object-cover object-center shadow-lg group-hover:scale-[1.005] transition-transform duration-500" 
              />
            </div>

            <div className="space-y-6">
              <div className="inline-flex rounded-xl bg-pink-950/50 p-3 text-pink-400 border border-pink-900/30">
                <Network className="h-6 w-6" />
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Inspect organizational graphs live
              </h3>
              <p className="text-lg text-zinc-400 leading-relaxed">
                See reporting lines instantly inside a structured organizational chart tree. Easily promote team members, add new operational entities, or update managers directly from our node-based canvas view.
              </p>
              
              <ul className="space-y-3 font-medium text-zinc-300">
                <li className="flex items-center gap-3.5">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <span>Visual connections representing corporate structures</span>
                </li>
                <li className="flex items-center gap-3.5">
                  <span className="h-2 w-2 rounded-full bg-pink-500" />
                  <span>Inspect employee profiles by clicking custom tree nodes</span>
                </li>
                <li className="flex items-center gap-3.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Real-time hierarchy recalculations during promotions</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Pricing Grid Section */}
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="rounded-full bg-violet-950/80 text-violet-300 border border-violet-900/50 mb-3 px-3.5 py-1">
            Pricing Plans
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Transparent, predictable cost
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Build your hierarchy chart, set up operational boards, and orchestrate work. Scale as you scale.
          </p>

          {/* Pricing Toggle switch */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-semibold transition-colors ${!isYearly ? "text-zinc-200" : "text-zinc-500"}`}>
              Monthly billing
            </span>
            <button
              type="button"
              className="relative w-12 h-6 bg-zinc-800 rounded-full border border-zinc-700/80 flex items-center p-0.5 cursor-pointer"
              onClick={() => setIsYearly(!isYearly)}
            >
              <div 
                className={`w-4.5 h-4.5 bg-gradient-to-tr from-violet-400 to-pink-400 rounded-full transition-transform duration-350 ${
                  isYearly ? "translate-x-6" : ""
                }`} 
              />
            </button>
            <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isYearly ? "text-zinc-200" : "text-zinc-500"}`}>
              Yearly billing
              <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Plan 1: Starter Free */}
          <div className="relative rounded-2xl border border-zinc-900 bg-zinc-950/60 p-8 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-zinc-800">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-500 mb-2">Starter</p>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-zinc-500 text-sm font-medium">/forever</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Great for small teams starting to build custom reporting canvas nodes.
              </p>

              <div className="h-[1.5px] bg-zinc-900 my-6" />

              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Up to 10 department nodes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>3 concurrent workflows</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Core analytics dashboard</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Standard dark theme controls</span>
                </li>
              </ul>
            </div>

            <Button
              type="button"
              className="mt-8 w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-xl py-2.5 font-semibold transition-all"
              onClick={() => navigate("/login?mode=create-organization")}
            >
              Start for free
            </Button>
          </div>

          {/* Plan 2: Pro (Highlighted Card) */}
          <div className="relative rounded-2xl border border-violet-500/40 bg-zinc-950 p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(139,92,246,0.1)] items-stretch">
            {/* Pop Accent light */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/5 to-transparent pointer-events-none rounded-[inherit]" />

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs uppercase font-extrabold tracking-widest text-violet-400">Pro Team</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-violet-600 text-white tracking-widest">
                  Popular
                </span>
              </div>
              
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-4xl font-extrabold">
                  {isYearly ? "$10" : "$12"}
                </span>
                <span className="text-zinc-500 text-sm font-medium">/user/mo</span>
              </div>
              
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                The absolute best suite for high-growth operations looking to align structural workflow boards.
              </p>

              <div className="h-[1.5px] bg-zinc-900 my-6" />

              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-violet-400 shrink-0" />
                  <span className="font-semibold text-zinc-100">Unlimited department nodes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-violet-400 shrink-0" />
                  <span className="font-semibold text-zinc-100">Unlimited workflows</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-violet-400 shrink-0" />
                  <span>Advanced task priority markers</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-violet-400 shrink-0" />
                  <span>Complete canvas exports</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-violet-400 shrink-0" />
                  <span>Priority admin support access</span>
                </li>
              </ul>
            </div>

            <Button
              type="button"
              className="mt-8 w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl py-2.5 font-semibold hover:brightness-110 shadow-lg shadow-violet-950/20 transition-all"
              onClick={() => navigate("/login?mode=create-organization")}
            >
              Get started
            </Button>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="relative rounded-2xl border border-zinc-900 bg-zinc-950/60 p-8 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-zinc-800">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-500 mb-2">Enterprise</p>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-4xl font-extrabold">Custom</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Specialized security layers and custom node configurations for massive corporations.
              </p>

              <div className="h-[1.5px] bg-zinc-900 my-6" />

              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>All features in Pro Team</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Single Sign-On (SAML SSO)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Dedicated operations support desk</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Custom Service Level Agreement (SLA)</span>
                </li>
              </ul>
            </div>

            <Button
              type="button"
              className="mt-8 w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-xl py-2.5 font-semibold transition-all"
              onClick={() => navigate("/login")}
            >
              Contact Sales
            </Button>
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="relative z-10 border-t border-zinc-900 bg-zinc-950/20 py-24">
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-zinc-400">
              Everything you need to understand about Flowboard structures and pipeline integrations.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="rounded-2xl border border-zinc-900 bg-zinc-950/60 transition-all duration-300 hover:border-zinc-800"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between p-6 text-left font-semibold text-zinc-200 hover:text-white"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span>{item.q}</span>
                    <ChevronDown 
                      className={`h-4.5 w-4.5 text-zinc-500 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-violet-400" : ""
                      }`} 
                    />
                  </button>

                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[200px] border-t border-zinc-900/60" : "max-h-0"
                    }`}
                  >
                    <p className="p-6 text-sm text-zinc-400 leading-relaxed bg-[#060608]">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern bottom CTA Conversion block */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 md:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#060609] p-8 md:p-14 text-center shadow-[0_0_100px_rgba(139,92,246,0.1)]">
          {/* Absolute decorative accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to orchestrate your organization?
            </h2>
            <p className="text-zinc-400 text-base md:text-lg">
              Set up your first canvas in under a minute. Manage active pipelines and structural reports with absolute clarity today.
            </p>
            
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-8 font-semibold text-white hover:brightness-110 transition-all duration-300"
                onClick={() => navigate("/login?mode=create-organization")}
              >
                Create your organization
                <ArrowRight className="h-4.5 w-4.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950/40 py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 p-2 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-bold tracking-wide text-white">Flowboard</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              Flowboard bridges structural reporting graphs and task-focused boards. Build your teams visually on a premium responsive canvas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-300 mb-4 uppercase text-[10px] tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-zinc-400">
              <li><a href="#showcase" className="hover:text-zinc-200 transition-colors">Showcase</a></li>
              <li><a href="#features" className="hover:text-zinc-200 transition-colors">Simulators</a></li>
              <li><a href="#details" className="hover:text-zinc-200 transition-colors">Capabilities</a></li>
              <li><a href="#pricing" className="hover:text-zinc-200 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-300 mb-4 uppercase text-[10px] tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-zinc-400">
              <li><a href="#" className="hover:text-zinc-200 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-zinc-200 transition-colors">API Guide</a></li>
              <li><a href="#" className="hover:text-zinc-200 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-zinc-200 transition-colors">Security Rules</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-300 mb-4 uppercase text-[10px] tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-zinc-400">
              <li><a href="#" className="hover:text-zinc-200 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-200 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-zinc-200 transition-colors">License Keys</a></li>
            </ul>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-10 border-t border-zinc-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Flowboard Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Twitter (X)</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
