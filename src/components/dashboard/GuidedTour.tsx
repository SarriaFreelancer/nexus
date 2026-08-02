"use client";

import React, { useState, useEffect } from "react";
import { Joyride, CallBackProps, STATUS, Step } from "react-joyride";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function GuidedTour() {
  const [run, setRun] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id || "user";

  useEffect(() => {
    // No mostrar en la vista de login o pública
    if (pathname === "/" || pathname === "/login" || pathname === "/register") {
      return;
    }

    const storageKey = `hasSeenTour_${userId}`;
    const hasSeenTour = localStorage.getItem(storageKey) || localStorage.getItem("hasSeenTour");
    
    if (!hasSeenTour) {
      const timer = setTimeout(() => setRun(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [pathname, userId]);

  useEffect(() => {
    // Escuchar evento de relanzamiento desde Configuración / Super Admin
    const handleRelaunch = () => {
      localStorage.removeItem(`hasSeenTour_${userId}`);
      localStorage.removeItem("hasSeenTour");
      setRun(true);
    };

    window.addEventListener("relaunch-tour", handleRelaunch);
    return () => window.removeEventListener("relaunch-tour", handleRelaunch);
  }, [userId]);

  const steps: Step[] = [
    {
      target: "body",
      content: "¡Bienvenido a Nexus Enterprise Platform! Te daremos un breve recorrido por las funciones principales.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "aside",
      content: "Este es el menú principal donde podrás navegar entre los distintos módulos de la plataforma.",
      placement: "right",
    },
    {
      target: "a[href='/dashboard']",
      content: "Aquí tienes el Dashboard. Te ofrece una vista general de la actividad de tus proyectos, con gráficas de rendimiento y métricas actualizadas en tiempo real.",
      placement: "right",
    },
    {
      target: "a[href='/proyectos']",
      content: "En la sección Proyectos podrás gestionar clientes, repositorios y tableros de tareas. Además de enlazar los repositorios de GitHub.",
      placement: "right",
    },
    {
      target: "a[href='/versiones']",
      content: "La sección de Versiones (Changelog) te permite registrar entregas de software y ver directamente los últimos commits y ramas de GitHub.",
      placement: "right",
    },
    {
      target: "aside button[title='Cerrar Sesión']",
      content: "Cuando termines, puedes cerrar sesión desde aquí. ¡Esperamos que disfrutes usando Nexus!",
      placement: "right",
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(`hasSeenTour_${userId}`, "true");
      localStorage.setItem("hasSeenTour", "true");
    }
  };

  if (!run) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#4f46e5",
          textColor: "#1e293b",
          backgroundColor: "#ffffff",
        },
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Omitir tour',
      }}
    />
  );
}
