"use client";
// @ts-nocheck

import React, { useState, useEffect } from "react";
import { Joyride, STATUS, Step } from "react-joyride";
const JoyrideAny = Joyride as any;
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { completeGuidedTour } from "@/core/application/actions/tourActions";

export default function GuidedTour() {
  const [run, setRun] = useState(false);
  const pathname = usePathname();
  const { data: session, update } = useSession();
  const user = session?.user as any;

  useEffect(() => {
    // No mostrar en la vista de login o pública
    if (pathname === "/" || pathname === "/login" || pathname === "/register") {
      return;
    }

    if (!user) return;

    const hasSeenTour = user?.preferences?.hasCompletedTour;
    
    if (!hasSeenTour) {
      const timer = setTimeout(() => setRun(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [pathname, user]);

  useEffect(() => {
    // Escuchar evento de relanzamiento desde Configuración / Super Admin
    const handleRelaunch = () => {
      setRun(true);
    };

    window.addEventListener("relaunch-tour", handleRelaunch);
    return () => window.removeEventListener("relaunch-tour", handleRelaunch);
  }, []);

  const steps: any[] = [
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

  const handleJoyrideCallback = async (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // Llamar a server action para guardarlo permanentemente
      await completeGuidedTour();
      
      // Actualizar la sesión en cliente
      if (user) {
        await update({ preferences: { ...user.preferences, hasCompletedTour: true } });
      }
    }
  };

  if (!run) return null;

  return (
    <JoyrideAny
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={({
        options: {
          zIndex: 10000,
          primaryColor: "#4f46e5",
          textColor: "#1e293b",
          backgroundColor: "#ffffff",
        }
      } as any)}
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
