"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-slate-900 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p>
            Utilizamos cookies propias y de terceros para mejorar tu experiencia en la plataforma y realizar análisis de uso. 
            Al continuar navegando, aceptas nuestra{" "}
            <Link href="/privacy" className="underline text-indigo-400 hover:text-indigo-300">
              Política de Privacidad y Cookies
            </Link>.
          </p>
        </div>
        <button
          onClick={acceptCookies}
          className="whitespace-nowrap px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
