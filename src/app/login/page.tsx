"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, GitFork, Shield, BarChart3, Sun, Moon, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Credenciales inválidas. Por favor, verifica tu correo y contraseña.");
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-2 sm:p-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#04060d] text-slate-100' : 'bg-[#f4f3ff] text-slate-900'} relative`}>
      {/* Top Right Theme Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-4 right-4 p-2 rounded-xl border transition-colors z-20 ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200' 
            : 'bg-white/80 border-indigo-200 text-indigo-600 hover:bg-white'
        }`}
      >
        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Floating Centered Card Container */}
      <div className={`w-full max-w-5xl max-h-[94vh] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#070b16] border border-slate-800/80 shadow-2xl shadow-purple-950/30' 
          : 'bg-white border border-indigo-100 shadow-2xl shadow-indigo-500/10'
      }`}>
        {/* Left Column: Sci-Fi Visual & Value Propositions */}
        <div className="hidden lg:flex relative flex-col justify-between p-6 xl:p-8 overflow-hidden border-r border-slate-800/60 bg-[#040711] text-slate-100">
          {/* Background Radial & Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.15),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-2xl font-black text-white tracking-wider">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-wider">NEXUS</h1>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Development Operations Platform</p>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <h2 className="text-2xl xl:text-3xl font-extrabold text-white leading-tight">
                Conecta. Gestiona.<br />
                Desarrolla. <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Crece.</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Nexus centraliza todos tus proyectos, equipos y recursos en un solo lugar para que puedas enfocarte en lo que realmente importa: crear valor.
              </p>
            </div>
          </div>

          {/* Value Features */}
          <div className="relative z-10 space-y-3 my-4">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <GitFork className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Todo conectado</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Proyectos, equipos, clientes y herramientas integrados en un solo lugar.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Seguro y confiable</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Tus datos y los de tu empresa están protegidos con los más altos estándares.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Decisiones inteligentes</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Analíticas en tiempo real para impulsar el crecimiento de tu negocio.</p>
              </div>
            </div>
          </div>

          {/* Futuristic Glowing Sci-Fi Horizon Art */}
          <div className="relative z-10 w-full h-24 rounded-xl overflow-hidden border border-indigo-500/20 bg-gradient-to-b from-indigo-950/30 to-purple-950/40 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.4),transparent_60%)]" />
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent absolute bottom-4" />
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest relative z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              NEXUS OS Gate Active
            </div>
          </div>
        </div>

        {/* Right Column: Inner Card Form */}
        <div className={`w-full flex flex-col justify-center p-4 sm:p-6 lg:p-7 overflow-y-auto ${isDarkMode ? 'bg-[#070b16]' : 'bg-white'}`}>
          <div className={`w-full max-w-sm mx-auto p-6 rounded-2xl border shadow-xl space-y-5 ${
            isDarkMode 
              ? 'bg-[#0a0f1f]/80 border-slate-800/80' 
              : 'bg-indigo-50/20 border-indigo-100'
          }`}>
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Bienvenido de vuelta</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Inicia sesión para continuar en Nexus</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center">
                {error}
              </div>
            )}
            
            {!error && reason === "timeout" && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs rounded-xl text-center font-medium">
                Tu sesión ha sido cerrada por inactividad.
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Correo electrónico</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@empresa.com"
                    className={`w-full border rounded-xl pl-10 pr-3 py-2 text-xs outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#0d1322] border-slate-800 text-slate-200 placeholder-slate-600 focus:border-indigo-500'
                        : 'bg-white border-indigo-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Contraseña</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className={`w-full border rounded-xl pl-10 pr-9 py-2 text-xs outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#0d1322] border-slate-800 text-slate-200 placeholder-slate-600 focus:border-indigo-500'
                        : 'bg-white border-indigo-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot Row */}
              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-800 bg-[#0d1322] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Recordarme</span>
                </label>
                <a href="#" className="text-indigo-400 hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="w-full border-t border-slate-800/80 absolute" />
                <span className="bg-[#0a0f1f] px-3 text-[10px] font-medium text-slate-500 relative z-10">
                  o continúa con
                </span>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0d1322] hover:bg-slate-800/80 border border-slate-800 text-[11px] font-semibold text-slate-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0d1322] hover:bg-slate-800/80 border border-slate-800 text-[11px] font-semibold text-slate-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Footer Links */}
              <div className="text-center pt-1">
                <p className="text-xs text-slate-400">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
                    Regístrate
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
