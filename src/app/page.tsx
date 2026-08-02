import Link from "next/link";
import { getCurrentUser } from "@/lib/serverAuth";
import {
  ArrowRight,
  PlayCircle,
  Search,
  Bell,
  Filter,
  Plus,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  GitFork,
  BookOpen,
  Rocket,
  Server,
  Users,
  BarChart3,
  Settings,
  GitBranch,
  Shield,
  ChevronRight,
  CheckCircle2,
  Paperclip,
  Clock,
  Layers,
  Workflow,
  Sparkles,
  Smartphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* ─────────────────── NAV ─────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-[1340px] mx-auto px-6 flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/nexus-logo-n.jpg" alt="NEXUS" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
            <span className="text-xl font-extrabold text-slate-900 tracking-wider">NEXUS</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Características</a>
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">Soluciones</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Precios</a>
            <a href="#resources" className="hover:text-indigo-600 transition-colors">Recursos</a>
            <a href="#company" className="hover:text-indigo-600 transition-colors">Empresa</a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <Link href={ctaHref} className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Iniciar sesión
            </Link>
            <Link
              href={ctaHref}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#2563eb] hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────────────── HERO SECTION ─────────────────── */}
      <section className="pt-8 pb-12 overflow-hidden">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] xl:grid-cols-[460px_1fr] gap-8 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="py-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                <span className="font-extrabold text-[11px] tracking-wide">NEXUS</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 font-medium">Development Operations Platform</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-[52px] font-black text-slate-900 leading-[1.08] tracking-tight mb-6">
                Toma el control total<br />
                de tus proyectos de<br />
                software desde el<br />
                <span className="text-[#6366f1]">concepto</span> hasta la<br />
                <span className="text-[#3b82f6]">producción.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
                La plataforma unificada que conecta proyectos, equipos, tareas, despliegues, servidores y clientes en un solo lugar.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#2563eb] hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/25"
                >
                  Comenzar prueba gratuita <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  Ver demo interactiva <PlayCircle className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User" className="w-9 h-9 rounded-full ring-2 ring-white object-cover" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User" className="w-9 h-9 rounded-full ring-2 ring-white object-cover" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="User" className="w-9 h-9 rounded-full ring-2 ring-white object-cover" />
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="User" className="w-9 h-9 rounded-full ring-2 ring-white object-cover" />
                </div>
                <div>
                  <div className="flex text-amber-400 gap-1 text-xs">
                    ★★★★★
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Más de 1,200 equipos confían en Nexus
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Realistic App Dashboard Mockup */}
            <div className="w-full">
              <div className="bg-white rounded-2xl p-2.5 shadow-2xl shadow-slate-300/60 border border-slate-200/80">
                <div className="bg-[#f8fafc] rounded-xl overflow-hidden border border-slate-200/60">
                  {/* Top Bar of Mockup */}
                  <div className="bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/nexus-logo-n.jpg" alt="" className="w-5 h-5 rounded-md object-cover" />
                      <span className="font-extrabold text-xs text-slate-900 tracking-wider">NEXUS</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <div className="relative">
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                      </div>
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                    </div>
                  </div>

                  {/* Main App Window */}
                  <div className="flex min-h-[460px]">
                    {/* Mockup Sidebar */}
                    <div className="w-44 bg-white border-r border-slate-200/80 p-3 flex flex-col justify-between shrink-0">
                      <div className="space-y-1">
                        {[
                          { name: "Dashboard", icon: LayoutDashboard, active: false },
                          { name: "Proyectos", icon: FolderKanban, active: true },
                          { name: "Tareas", icon: CheckSquare, active: false },
                          { name: "Roadmap", icon: GitFork, active: false },
                          { name: "Documentación", icon: BookOpen, active: false },
                          { name: "Despliegues", icon: Rocket, active: false },
                          { name: "Servidores", icon: Server, active: false },
                          { name: "Clientes (CRM)", icon: Users, active: false },
                          { name: "Reportes", icon: BarChart3, active: false },
                          { name: "Configuración", icon: Settings, active: false },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.name}
                              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                item.active
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${item.active ? "text-blue-600" : "text-slate-400"}`} />
                              <span>{item.name}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* User Profile Footer in Sidebar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="David" className="w-7 h-7 rounded-full object-cover" />
                        <div className="text-[10px]">
                          <p className="font-bold text-slate-800 leading-tight">David Sarria</p>
                          <p className="text-slate-400">Super Admin</p>
                        </div>
                      </div>
                    </div>

                    {/* Mockup Main Board Area */}
                    <div className="flex-1 p-3.5 bg-[#f8fafc] overflow-hidden flex flex-col justify-between">
                      <div>
                        {/* Top Bar inside Board */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-xs text-slate-900">Proyectos</h3>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-medium">Todos los estados ∨</span>
                            <span className="text-[9px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-medium">Todos los miembros ∨</span>
                            <span className="text-[9px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-medium flex items-center gap-1"><Filter className="w-2.5 h-2.5" /> Filtros</span>
                            <span className="text-[9px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Plus className="w-2.5 h-2.5" /> Nuevo proyecto</span>
                          </div>
                        </div>

                        {/* Columns headers */}
                        <div className="grid grid-cols-5 gap-1.5 mb-2 text-[9px] text-slate-500 font-bold px-0.5">
                          <div>1. Descubrimiento ✕</div>
                          <div>2. Diseño ✕</div>
                          <div>3. En Desarrollo ✕</div>
                          <div>4. En Pruebas ✕</div>
                          <div>5. Desplegado ✕</div>
                        </div>

                        {/* Grid Row 1 of Project Cards */}
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                          {[
                            { name: "Plataforma LMS", sub: "E-learning", pct: "30%", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80" },
                            { name: "Web Corporativa", sub: "Marketing", pct: "40%", img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80" },
                            { name: "App Móvil Banking", sub: "Fintech", pct: "60%", img: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=300&auto=format&fit=crop&q=80" },
                            { name: "Dashboard Analytics", sub: "SaaS", pct: "75%", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&auto=format&fit=crop&q=80" },
                            { name: "Tienda Ecommerce", sub: "E-commerce", pct: "100%", img: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=300&auto=format&fit=crop&q=80" },
                          ].map((card) => (
                            <div key={card.name} className="bg-white border border-slate-200/90 rounded-lg p-1.5 shadow-sm">
                              <div className="h-12 rounded-md overflow-hidden mb-1.5 bg-slate-100">
                                <img src={card.img} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="font-bold text-[8px] text-slate-800 truncate">{card.name}</p>
                              <p className="text-[7px] text-slate-400 mb-1">{card.sub}</p>
                              <div className="flex items-center justify-between text-[7px] text-slate-500 pt-0.5 border-t border-slate-100">
                                <div className="flex -space-x-1">
                                  <div className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[5px]">A</div>
                                  <div className="w-3 h-3 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[5px]">B</div>
                                </div>
                                <span className="font-bold text-emerald-600">{card.pct}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Grid Row 2 */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { name: "API de Pagos", sub: "Fintech", pct: "85%", status: "85%", img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80" },
                            { name: "Rediseño Web", sub: "Marketing", pct: "Pausa", status: "En pausa", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80" },
                            { name: "Landing Product", sub: "Marketing", pct: "100%", status: "100%", img: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=300&auto=format&fit=crop&q=80" },
                            { name: "Sistema Interno", sub: "ERP", pct: "100%", status: "100%", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&auto=format&fit=crop&q=80" },
                          ].map((card) => (
                            <div key={card.name} className="bg-white border border-slate-200/90 rounded-lg p-1.5 shadow-sm">
                              <div className="h-10 rounded-md overflow-hidden mb-1.5 bg-slate-100">
                                <img src={card.img} alt="" className="w-full h-full object-cover" />
                              </div>
                              <p className="font-bold text-[8px] text-slate-800 truncate">{card.name}</p>
                              <p className="text-[7px] text-slate-400 mb-1">{card.sub}</p>
                              <div className="flex items-center justify-between text-[7px] text-slate-500 pt-0.5 border-t border-slate-100">
                                <div className="flex -space-x-1">
                                  <div className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[5px]">X</div>
                                </div>
                                <span className={`font-bold ${card.status.includes("pausa") ? "text-amber-500" : "text-emerald-600"}`}>{card.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mockup Board Footer Status */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[8px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Sistema 100% Operativo</span>
                        </div>
                        <span>Sincronizado hace 2 min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────── LOGOS INTEGRATION STRIP ─────────────────── */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="text-xs text-slate-400 font-medium leading-tight">
              Se integra con las<br />mejores herramientas
            </p>

            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              {/* GitHub */}
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span>GitHub</span>
              </div>

              {/* GitLab */}
              <div className="flex items-center gap-2 font-bold text-[#e24329] text-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.6 9.6l-2.2-6.7c-.1-.4-.6-.7-1-.4l-3.3 10.1H6.9L3.6 2.5c-.4-.3-.9 0-1 .4L.4 9.6c-.2.5 0 1.1.4 1.4l11.2 8.1c.4.3 1 .3 1.4 0l11.2-8.1c.4-.3.6-.9.4-1.4z"/></svg>
                <span className="text-slate-800">GitLab</span>
              </div>

              {/* Vercel */}
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 1L24 22H0L12 1z"/></svg>
                <span>Vercel</span>
              </div>

              {/* Docker */}
              <div className="flex items-center gap-2 font-bold text-[#2496ed] text-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185m-2.954-5.43h2.118a.185.185 0 00.186-.186V3.575a.185.185 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.185m0 2.716h2.118a.185.185 0 00.186-.186V6.291a.185.185 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.185m-2.954 0h2.119a.186.186 0 00.185-.186V6.291a.186.186 0 00-.185-.185H8.075a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.185m0 2.714h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186H8.075a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185m-2.955 0h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186H5.12a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185m0 2.714h2.119a.186.186 0 00.185-.185v-1.887a.186.186 0 00-.185-.186H5.12a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185m-2.954 0h2.119a.186.186 0 00.185-.185v-1.887a.186.186 0 00-.185-.186H2.166a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185m16.516-2.714h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186h-2.119a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185"/></svg>
                <span className="text-slate-800">Docker</span>
              </div>

              {/* AWS */}
              <div className="flex items-center gap-1 font-bold text-[#ff9900] text-sm">
                <span className="text-slate-800 font-extrabold text-base tracking-tight">aws</span>
              </div>

              {/* Cloudflare */}
              <div className="flex items-center gap-1.5 font-bold text-[#f38020] text-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16.52 14.52l-.46-1.59a.74.74 0 00-.7-.53H8.05a.74.74 0 00-.7.53l-.46 1.59A4.14 4.14 0 003 18.5a4.14 4.14 0 004.14 4.14h10.72A4.14 4.14 0 0022 18.5a4.14 4.14 0 00-5.48-3.98z"/></svg>
                <span className="text-slate-800">Cloudflare</span>
              </div>

              {/* Slack */}
              <div className="flex items-center gap-2 font-bold text-[#4a154b] text-sm">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 01-2.52-2.523 2.527 2.527 0 012.52-2.52h6.313A2.528 2.528 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/></svg>
                <span className="text-slate-800">Slack</span>
              </div>

              {/* PostgreSQL */}
              <div className="flex items-center gap-2 font-bold text-[#336791] text-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                <span className="text-slate-800">PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── FEATURES SECTION (MATCHING SCREENSHOT) ─────────────────── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Todo lo que tu equipo necesita en un solo lugar
            </h2>
            <div className="w-10 h-1 bg-blue-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Feature 1: Flujo de 9 Estados */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 bg-[#f3e8ff] text-[#9333ea] rounded-xl flex items-center justify-center mb-4">
                  <Workflow className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-2">Flujo de 9 Estados</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Ciclo de vida perfecto para tus proyectos desde el descubrimiento hasta el mantenimiento y archivado.
                </p>

                {/* Timeline Graphic */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-3 left-2 right-2 h-0.5 bg-slate-200 -z-0"></div>
                    {[
                      { icon: "🔍", active: true },
                      { icon: "🎨", active: true },
                      { icon: "💻", active: true },
                      { icon: "🧪", active: false },
                      { icon: "🚀", active: false },
                      { icon: "⚙️", active: false },
                      { icon: "⏸️", active: false },
                      { icon: "✅", active: false },
                      { icon: "📦", active: false },
                    ].map((step, i) => (
                      <div key={i} className="relative z-10 flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full border text-[10px] flex items-center justify-center ${step.active ? "bg-white border-purple-500 shadow-sm" : "bg-slate-100 border-slate-200 opacity-60"}`}>
                          {step.icon}
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${step.active ? "bg-purple-600" : "bg-slate-300"}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <a href={ctaHref} className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                Saber más <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Feature 2: Kanban Inteligente */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 bg-[#f3e8ff] text-[#9333ea] rounded-xl flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-2">Kanban Inteligente</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Tablero drag & drop con 9 columnas, filtros por proyecto, portadas, adjuntos y automatización CI/CD.
                </p>

                {/* Kanban Graphic */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mb-6">
                  <div className="grid grid-cols-4 gap-1.5 text-[8px] font-bold text-slate-400 mb-1.5 text-center">
                    <div>Disco</div>
                    <div>Elacho</div>
                    <div>Rediseño</div>
                    <div>Ecommerce</div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
                      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=100&auto=format&fit=crop&q=80",
                      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=100&auto=format&fit=crop&q=80",
                      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&auto=format&fit=crop&q=80",
                    ].map((img, i) => (
                      <div key={i} className="h-10 rounded-md overflow-hidden bg-slate-200">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[7px] font-bold px-0.5">
                    <span className="flex items-center gap-0.5 text-rose-600"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Urgente</span>
                    <span className="flex items-center gap-0.5 text-rose-500"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Alta</span>
                    <span className="flex items-center gap-0.5 text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Media</span>
                    <span className="flex items-center gap-0.5 text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Baja</span>
                  </div>
                </div>
              </div>

              <a href={ctaHref} className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                Saber más <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Feature 3: Checklist & Auditoría */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 bg-[#f3e8ff] text-[#9333ea] rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-2">Checklist & Auditoría</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Checklist agrupado por estado y auditoría 100% real con línea de tiempo y comentarios.
                </p>

                {/* Audit Timeline Graphic */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6 space-y-2.5">
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-2">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-slate-700 font-medium truncate max-w-[110px]">David cambió el estado a @ En Desarrollo</span>
                    </div>
                    <span className="text-slate-400 text-[8px] whitespace-nowrap">hace 2m</span>
                  </div>

                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-2">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-slate-700 font-medium truncate max-w-[110px]">María completó 3 subtareas</span>
                    </div>
                    <span className="text-slate-400 text-[8px] whitespace-nowrap">hace 15m</span>
                  </div>

                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <Paperclip className="w-3 h-3" />
                      </div>
                      <span className="text-slate-700 font-medium truncate max-w-[110px]">Archivo adjunto agregado</span>
                    </div>
                    <span className="text-slate-400 text-[8px] whitespace-nowrap">hace 1h</span>
                  </div>
                </div>
              </div>

              <a href={ctaHref} className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                Saber más <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Feature 4: Infraestructura & Servidores */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 bg-[#f3e8ff] text-[#9333ea] rounded-xl flex items-center justify-center mb-4">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-2">Infraestructura & Servidores</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Monitorea CPU, RAM, Disco y servicios en la nube con alertas automáticas de sobrecarga.
                </p>

                {/* Server Metrics Graphic */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mb-6 grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-sm text-center">
                    <p className="text-[8px] text-slate-400 font-medium">CPU</p>
                    <p className="text-sm font-black text-slate-900">34%</p>
                    <svg viewBox="0 0 40 15" className="w-full h-4 mt-1" fill="none">
                      <path d="M0 12 Q 10 2, 20 8 T 40 4" stroke="#10b981" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-sm text-center">
                    <p className="text-[8px] text-slate-400 font-medium">RAM</p>
                    <p className="text-sm font-black text-slate-900">61%</p>
                    <svg viewBox="0 0 40 15" className="w-full h-4 mt-1" fill="none">
                      <path d="M0 10 Q 10 14, 20 5 T 40 8" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-sm text-center">
                    <p className="text-[8px] text-slate-400 font-medium">Disco</p>
                    <p className="text-sm font-black text-slate-900">72%</p>
                    <svg viewBox="0 0 40 15" className="w-full h-4 mt-1" fill="none">
                      <path d="M0 14 Q 10 6, 20 10 T 40 2" stroke="#a855f7" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              <a href={ctaHref} className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                Saber más <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* ─────────────────── EXPLORA NEXUS EN ACCIÓN (1:1 PIXEL PERFECT MATCH) ─────────────────── */}
          <div className="bg-[#edf2fe] rounded-[28px] p-8 lg:p-12 relative overflow-hidden my-8 border border-blue-100/50 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-center relative z-10">

              {/* Left Content */}
              <div>
                <h3 className="text-3xl lg:text-[34px] font-black text-slate-900 mb-3 tracking-tight leading-tight">
                  Explora Nexus en acción
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-sm">
                  Descubre cómo Nexus puede transformar la forma en que tu equipo construye y entrega software.
                </p>
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-[#2563eb] bg-white border border-[#2563eb]/40 rounded-full hover:bg-blue-50 transition-all shadow-sm"
                >
                  Ver demo interactiva <PlayCircle className="w-4 h-4 text-[#2563eb]" />
                </Link>
              </div>

              {/* Right Floating Perspective Mockup Image Container */}
              <div className="relative flex items-center justify-end -mr-12 lg:-mr-20 -my-6 lg:-my-10">
                {/* Main Desktop Mockup */}
                <div className="w-[720px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/60 flex transform -rotate-1 shrink-0">
                  {/* Dark Sidebar */}
                  <div className="w-40 bg-[#0f1424] text-white p-3.5 flex flex-col justify-between shrink-0">
                    <div>
                      <div className="flex items-center gap-2 font-black text-[11px] tracking-wider mb-4">
                        <img src="/nexus-logo-n.jpg" alt="" className="w-4 h-4 rounded-sm" /> NEXUS
                      </div>
                      <div className="space-y-1.5 text-[9px] font-semibold">
                        <div className="text-slate-400 px-2.5 py-1">Dashboard</div>
                        <div className="bg-[#4f46e5] text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm flex items-center justify-between">
                          <span>Proyectos</span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        </div>
                        <div className="text-slate-400 px-2.5 py-1">Tareas</div>
                        <div className="text-slate-400 px-2.5 py-1">Roadmap</div>
                        <div className="text-slate-400 px-2.5 py-1">Documentación</div>
                        <div className="text-slate-400 px-2.5 py-1">Despliegues</div>
                        <div className="text-slate-400 px-2.5 py-1">Servidores</div>
                      </div>
                    </div>
                  </div>

                  {/* Light Content Area */}
                  <div className="flex-1 bg-white p-3.5 overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-extrabold text-[11px] text-slate-900">Proyectos</span>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[8px] text-slate-400 border border-slate-200 px-2 py-0.5 rounded">Filtros</span>
                        <span className="text-[8px] text-white bg-[#2563eb] px-2.5 py-0.5 rounded-md font-bold">+ Nuevo proyecto</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 text-[8px] text-slate-400 font-bold mb-2">
                      <div>1. Descubrimiento</div>
                      <div>2. Diseño</div>
                      <div>3. En Desarrollo</div>
                      <div>4. En Pruebas</div>
                      <div>5. Desplegado</div>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { name: "Plataforma LMS", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80" },
                        { name: "Web Corporativa", img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&auto=format&fit=crop&q=80" },
                        { name: "App Banking", img: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=200&auto=format&fit=crop&q=80" },
                        { name: "Dashboard SaaS", img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&auto=format&fit=crop&q=80" },
                        { name: "Ecommerce", img: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=200&auto=format&fit=crop&q=80" },
                      ].map((card, i) => (
                        <div key={i} className="bg-white border border-slate-200/90 rounded-lg p-1.5 shadow-sm">
                          <div className="h-12 rounded-md overflow-hidden mb-1">
                            <img src={card.img} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[8px] font-bold text-slate-800 block truncate">{card.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overlapping Mobile View Mockup */}
                <div className="w-40 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2.5 relative -ml-12 z-20 shrink-0 hidden sm:block">
                  <div className="bg-slate-50 rounded-xl p-2 space-y-2 text-center">
                    <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold">
                      <span>NEXUS</span>
                      <Smartphone className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="h-6 bg-[#2563eb] text-white rounded-lg text-[8px] font-bold flex items-center justify-center shadow-sm">
                      App Móvil
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-left text-[8px]">
                      <p className="font-bold text-slate-900">David Sarria</p>
                      <p className="text-emerald-600 font-bold text-[7px] mt-0.5">● 100% Up</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────── PRICING SECTION ─────────────────── */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-14 gap-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center md:text-left">
              Planes flexibles para equipos<br className="hidden md:block" /> de todos los tamaños
            </h2>

            {/* Pricing Switcher */}
            <div className="bg-slate-100 p-1 rounded-full flex items-center border border-slate-200/80 text-xs font-semibold">
              <span className="px-4 py-1.5 text-slate-600 cursor-pointer">Mensual</span>
              <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full font-bold shadow-sm cursor-pointer">
                Anual (-20%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: "Free", price: "$0", sub: "Para empezar sin costo", popular: false, features: ["2 tableros Kanban", "Hasta 3 proyectos por espacio", "Usuarios ilimitados", "Integraciones básicas", "Soporte comunitario"] },
              { name: "Básico", price: "$19", sub: "Para freelancers y pequeños equipos", popular: false, features: ["Todo lo de Free", "Tableros ilimitados", "Proyectos ilimitados", "Automatizaciones básicas", "Almacenamiento 100GB", "Soporte por email"] },
              { name: "Intermedio", price: "$49", sub: "Para equipos en crecimiento", popular: true, features: ["Todo lo de Básico", "CI/CD & Despliegues", "Monitoreo de servidores", "CRM y gestión de clientes", "Almacenamiento 500GB", "Soporte prioritario"] },
              { name: "Premium", price: "$99", sub: "Para agencias y empresas", popular: false, features: ["Todo lo de Intermedio", "Roles avanzados y permisos", "Auditoría avanzada", "Reportes personalizados", "Almacenamiento 1TB", "Soporte 24/7 dedicado"] },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative transition-all hover:shadow-md ${
                  plan.popular ? "border-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02]" : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Más popular
                  </span>
                )}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-5">{plan.sub}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-medium"> /mes</span>
                    {plan.price !== "$0" && <p className="text-[10px] text-slate-400 mt-1">Facturado anualmente</p>}
                  </div>
                  <div className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  href={ctaHref}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {plan.name === "Free" ? "Comenzar gratis" : plan.name === "Premium" ? "Contactar ventas" : "Comenzar ahora"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <img src="/nexus-logo-n.jpg" alt="" className="w-6 h-6 rounded-md object-cover" />
              <span className="font-extrabold text-slate-900 text-sm tracking-wider">NEXUS</span>
              <span>© {new Date().getFullYear()} NEXUS. Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-slate-900">Política de Privacidad y Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
