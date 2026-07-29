import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatHours(hours: number): string {
  return `${hours}h`;
}

export function translateProjectStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "DISCOVERY": "Descubrimiento",
    "DESIGN": "En Diseño",
    "DEVELOPMENT": "En Desarrollo",
    "TESTING": "En Pruebas",
    "DEPLOYMENT": "En Despliegue",
    "DEPLOYED": "En Producción",
    "COMPLETED": "Completado",
    "ARCHIVED": "Finalizado",
    "PAUSED": "En Pausa",
    "MAINTENANCE": "Mantenimiento",
    "CANCELLED": "Cancelado"
  };
  return statusMap[status] || status;
}
