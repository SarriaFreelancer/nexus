"use client";

import { useEffect } from "react";

/**
 * SecurityGuard
 * 
 * Componente cliente invisible que implementa medidas anti-inspección agresivas.
 * Bloquea: Click Derecho, F12, Atajos de DevTools (Ctrl+Shift+I/J/C), Ver Código Fuente (Ctrl+U).
 * Incluye un trampa "debugger loop" para congelar DevTools si se logran abrir.
 * 
 * NOTA: Ninguna técnica cliente es 100% infalible, pero esto disuade al 99% de los usuarios.
 */
export default function SecurityGuard() {
  useEffect(() => {
    // 1. Deshabilitar Menú Contextual (Click Derecho)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Deshabilitar Teclas de Atajos de Desarrollador
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevenir F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      
      if (e.ctrlKey && e.shiftKey) {
        // Prevenir Ctrl+Shift+I (Inspector)
        if (e.key === "I" || e.key === "i") {
          e.preventDefault();
        }
        // Prevenir Ctrl+Shift+J (Consola)
        if (e.key === "J" || e.key === "j") {
          e.preventDefault();
        }
        // Prevenir Ctrl+Shift+C (Seleccionar Elemento)
        if (e.key === "C" || e.key === "c") {
          e.preventDefault();
        }
      }
      
      // Prevenir Ctrl+U (Ver Código Fuente)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
      }
    };

    // 3. Trampa de DevTools (Debugger Loop)
    // Este intervalo hace que si el usuario abre las DevTools por el menú del navegador,
    // se lance un 'debugger' infinito, congelando la ejecución y haciendo la inspección casi imposible.
    const debuggerLoop = setInterval(() => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      // Si la diferencia es mayor a un umbral, significa que las DevTools están abiertas y pausaron la ejecución.
      // Podríamos redirigir o recargar aquí si quisiéramos ser más agresivos:
      if (end - start > 100) {
        // DevTools están abiertas
      }
    }, 1000);

    // Agregar Listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Limpiar al desmontar
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(debuggerLoop);
    };
  }, []);

  return null; // Componente invisible
}
