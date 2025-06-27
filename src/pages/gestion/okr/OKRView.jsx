import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Target, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OKRView = () => {
  const { isDarkMode } = useSettings();

  const objetivos = [
    {
      id: 1,
      titulo: "Aumentar la satisfacción del cliente",
      descripcion: "Mejorar la experiencia del usuario y la calidad del servicio",
      progreso: 75,
      estado: "en_progreso",
      resultadosClave: [
        {
          id: 1,
          descripcion: "Reducir el tiempo de respuesta del soporte en un 30%",
          progreso: 80,
          estado: "en_progreso"
        },
        {
          id: 2,
          descripcion: "Aumentar el NPS a 8.5",
          progreso: 70,
          estado: "en_progreso"
        }
      ]
    },
    {
      id: 2,
      titulo: "Optimizar el proceso de desarrollo",
      descripcion: "Mejorar la eficiencia y calidad del desarrollo de software",
      progreso: 40,
      estado: "en_riesgo",
      resultadosClave: [
        {
          id: 3,
          descripcion: "Reducir los bugs en producción en un 50%",
          progreso: 35,
          estado: "en_riesgo"
        },
        {
          id: 4,
          descripcion: "Implementar CI/CD en todos los proyectos",
          progreso: 45,
          estado: "en_progreso"
        }
      ]
    }
  ];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completado':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'en_progreso':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'en_riesgo':
        return isDarkMode ? 'text-amber-400' : 'text-amber-600';
      default:
        return isDarkMode ? 'text-slate-400' : 'text-slate-600';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'en_progreso':
        return <Clock className="h-5 w-5" />;
      case 'en_riesgo':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-2xl font-bold",
            isDarkMode ? "text-slate-100" : "text-slate-800"
          )}>
            Objetivos y Resultados Clave (OKR)
          </h1>
          <p className={cn(
            "text-sm mt-1",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}>
            Gestión y seguimiento de objetivos empresariales
          </p>
        </div>
        <Button className={cn(
          "gap-2",
          isDarkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"
        )}>
          <Plus className="h-4 w-4" />
          Nuevo Objetivo
        </Button>
      </div>

      <div className="space-y-6">
        {objetivos.map((objetivo) => (
          <div
            key={objetivo.id}
            className={cn(
              "p-6 rounded-xl border",
              isDarkMode 
                ? "bg-slate-800/50 border-slate-700/50" 
                : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className={cn(
                  "text-lg font-semibold",
                  isDarkMode ? "text-slate-100" : "text-slate-800"
                )}>
                  {objetivo.titulo}
                </h3>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                )}>
                  {objetivo.descripcion}
                </p>
              </div>
              <div className={cn(
                "flex items-center gap-2",
                getEstadoColor(objetivo.estado)
              )}>
                {getEstadoIcon(objetivo.estado)}
                <span className="text-sm font-medium">
                  {objetivo.progreso}%
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className={cn(
                "text-sm font-medium",
                isDarkMode ? "text-slate-300" : "text-slate-700"
              )}>
                Resultados Clave
              </h4>
              <div className="space-y-3">
                {objetivo.resultadosClave.map((resultado) => (
                  <div
                    key={resultado.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      isDarkMode 
                        ? "bg-slate-800/30 border-slate-700/30" 
                        : "bg-slate-50 border-slate-200/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}>
                        {resultado.descripcion}
                      </p>
                      <div className={cn(
                        "flex items-center gap-2",
                        getEstadoColor(resultado.estado)
                      )}>
                        {getEstadoIcon(resultado.estado)}
                        <span className="text-sm font-medium">
                          {resultado.progreso}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OKRView; 