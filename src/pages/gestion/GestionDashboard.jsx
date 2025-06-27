import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Target, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const GestionDashboard = () => {
  const { isDarkMode } = useSettings();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-2xl font-bold",
            isDarkMode ? "text-slate-100" : "text-slate-800"
          )}>
            Sistema de Gestión
          </h1>
          <p className={cn(
            "text-sm mt-1",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}>
            Gestión de objetivos y resultados clave
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Resumen OKR */}
        <div className={cn(
          "p-6 rounded-xl border",
          isDarkMode 
            ? "bg-slate-800/50 border-slate-700/50" 
            : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-lg",
              isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100"
            )}>
              <Target className={cn(
                "h-6 w-6",
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              )} />
            </div>
            <div>
              <h3 className={cn(
                "text-lg font-semibold",
                isDarkMode ? "text-slate-100" : "text-slate-800"
              )}>OKR Activos</h3>
              <p className={cn(
                "text-sm",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}>Objetivos y resultados clave</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}>En progreso</span>
              <span className={cn(
                "flex items-center gap-2",
                isDarkMode ? "text-green-400" : "text-green-600"
              )}>
                <Clock className="h-4 w-4" />
                <span>4</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}>Completados</span>
              <span className={cn(
                "flex items-center gap-2",
                isDarkMode ? "text-blue-400" : "text-blue-600"
              )}>
                <CheckCircle2 className="h-4 w-4" />
                <span>2</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}>En riesgo</span>
              <span className={cn(
                "flex items-center gap-2",
                isDarkMode ? "text-amber-400" : "text-amber-600"
              )}>
                <AlertTriangle className="h-4 w-4" />
                <span>1</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionDashboard; 