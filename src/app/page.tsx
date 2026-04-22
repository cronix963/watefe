"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface LoginForm {
  email: string;
  password: string;
}

interface TwoFAForm {
  email: string;
  code: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001";

export default function HomePage() {
  const [step, setStep] = useState<"login" | "2fa" | "success">("login");
  const [loginData, setLoginData] = useState<LoginForm>({ email: "", password: "" });
  const [twoFAData, setTwoFAData] = useState<TwoFAForm>({ email: "", code: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/api/Autenticacion/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.exito) {
        setError(data.mensaje || "Error en autenticación");
        return;
      }
      
      setTwoFAData({ email: loginData.email, code: "" });
      setStep("2fa");
      setSuccess(data.mensaje);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/api/Autenticacion/verificar-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(twoFAData),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.valido) {
        setError(data.mensaje || "Código inválido");
        return;
      }
      
      setStep("success");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative bg-grid">
      <div className="scan-line" />
      
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <AnimatePresence mode="wait">
        {step === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="bg-[#1a1f2e]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,212,255,0.1)]">
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"
                  animate={{ glitch: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
                >
                  SASL
                </motion.h1>
                <p className="text-gray-400 mt-2">Sistema de Autenticación Segura</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Correo Electrónico</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0e17] border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                    <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(0,212,255,0.1)] pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Contraseña</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0e17] border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verificando...
                    </span>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setStep("2fa")}
                  className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  Probar 2FA Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "2fa" && (
          <motion.div
            key="2fa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="bg-[#1a1f2e]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                />
                <h2 className="text-2xl font-bold text-white">Verificación 2FA</h2>
                <p className="text-gray-400 mt-2">Ingresa el código de 6 dígitos enviado a tu correo</p>
              </div>

              {success && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm text-center"
                >
                  {success}
                </motion.div>
              )}

              <form onSubmit={handle2FA} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Código de Verificación</label>
                  <div className="flex gap-2">
                    {[...Array(6)].map((_, i) => (
                      <motion.input
                        key={i}
                        type="text"
                        maxLength={1}
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d$/.test(value)) {
                            const newCode = twoFAData.code.split("");
                            newCode[i] = value;
                            setTwoFAData({ ...twoFAData, code: newCode.join("") });
                            if (i < 5) {
                              const nextInput = document.querySelectorAll<HTMLInputElement>('input[name="digit"]')[i + 1];
                              nextInput?.focus();
                            }
                          }
                        }}
                        name="digit"
                        className="w-full h-14 text-center text-2xl font-bold bg-[#0a0e17] border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                        whileFocus={{ scale: 1.05 }}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || twoFAData.code.length !== 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verificando...
                    </span>
                  ) : (
                    "Verificar Código"
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                >
                  ← Volver al login
                </button>
              </form>

              {/* Demo 2FA */}
              <div className="mt-6 p-4 bg-[#0a0e17]/50 rounded-lg border border-cyan-500/20">
                <p className="text-xs text-gray-500 mb-2">Modo Demo (sin backend):</p>
                <p className="text-xs text-cyan-400">Para probar, usa cualquier código de 6 dígitos</p>
                <button
                  onClick={() => {
                    setTwoFAData({ email: "demo@test.com", code: "123456" });
                    setSuccess("Código de demostración enviado a tu correo");
                  }}
                  className="mt-2 w-full py-2 text-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all"
                >
                  Generar Código Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md relative z-10"
          >
            <div className="bg-[#1a1f2e]/80 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(34,197,94,0.1)] text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">¡Autenticación Exitosa!</h2>
              <p className="text-gray-400 mb-6">Has completado la verificación de dos factores</p>
              
              <motion.button
                onClick={() => {
                  setStep("login");
                  setLoginData({ email: "", password: "" });
                  setTwoFAData({ email: "", code: "" });
                  setError("");
                  setSuccess("");
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                Ir al Dashboard
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-4 left-0 right-0 text-center text-xs text-gray-600">
        SASL v1.0.0 © 2026 | Sistema de Autenticación Segura con 2FA
      </footer>
    </main>
  );
}