import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Política de Privacidad y Uso de Cookies</h1>
        
        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">1. Introducción</h2>
            <p>En Nexus nos tomamos muy en serio tu privacidad. Esta política describe qué información recopilamos, cómo la usamos y las opciones que tienes al respecto. Al utilizar nuestros servicios, aceptas las prácticas descritas en este documento.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">2. Información que recopilamos</h2>
            <p>Recopilamos información para proporcionar mejores servicios a todos nuestros usuarios. Esto incluye:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Información personal:</strong> Como tu nombre, dirección de correo electrónico y datos de perfil que proporcionas al registrarte.</li>
              <li><strong>Información de uso:</strong> Datos sobre cómo interactúas con la plataforma, tiempos de acceso, páginas visitadas y configuraciones de proyectos.</li>
              <li><strong>Tokens de terceros:</strong> Almacenamos de forma segura los tokens de acceso a servicios como GitHub exclusivamente para interactuar con tus repositorios a tu nombre.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">3. Uso de Cookies</h2>
            <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo para recordar tus preferencias y ofrecerte una experiencia personalizada.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio, como mantener la sesión iniciada y aplicar las restricciones de seguridad.</li>
              <li><strong>Cookies de preferencias:</strong> Nos permiten recordar información que cambia el comportamiento o aspecto del sitio, como tu idioma preferido o la región en la que te encuentras (o si ya viste el tour inicial).</li>
              <li><strong>Cookies analíticas:</strong> Ayudan a entender cómo interactúan los visitantes con el sitio web mediante la recopilación y reporte de información de forma anónima.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">4. ¿Cómo utilizamos tus datos?</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
              <li>Desarrollar nuevas características.</li>
              <li>Proteger a Nexus y a nuestros usuarios.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">5. Compartir tu información</h2>
            <p>No compartimos tu información personal con empresas, organizaciones o personas ajenas a Nexus, excepto en los siguientes casos: con tu consentimiento, para el procesamiento externo o por motivos legales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">6. Seguridad de la información</h2>
            <p>Trabajamos duro para proteger a Nexus y a nuestros usuarios del acceso no autorizado, alteración, divulgación o destrucción de la información que poseemos.</p>
          </section>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            &larr; Volver a la plataforma
          </Link>
        </div>
      </div>
    </div>
  );
}
