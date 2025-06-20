import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Settings,
  Palette,
  Type,
  Moon,
  Sun,
  Monitor,
  Zap,
  RotateCcw,
  CheckCircle,
  Smartphone,
  Globe,
  Bell,
  Shield,
  Eye,
  Download,
  Upload
} from 'lucide-react';

const Ajustes = () => {
  const { 
    settings, 
    updateSetting, 
    toggleTheme, 
    setFontSize, 
    resetSettings,
    isDarkMode,
    fontSize
  } = useSettings();
  const { toast } = useToast();

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    toast({
      title: "Tamaño de fuente actualizado",
      description: `Se cambió el tamaño de fuente a ${
        newSize === 'small' ? 'Pequeño' :
        newSize === 'medium' ? 'Mediano' : 'Grande'
      }`,
      duration: 2000,
    });
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toast({
      title: "Tema actualizado",
      description: `Se cambió al modo ${isDarkMode ? 'claro' : 'oscuro'}`,
      duration: 2000,
    });
  };

  const handleResetSettings = () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar todas las configuraciones a los valores por defecto?')) {
      resetSettings();
      toast({
        title: "Configuraciones restauradas",
        description: "Todas las configuraciones han sido restauradas a los valores por defecto",
        duration: 3000,
      });
    }
  };

  const handleAnimationsToggle = (enabled) => {
    updateSetting('animations', enabled);
    toast({
      title: "Animaciones actualizadas",
      description: `Las animaciones han sido ${enabled ? 'activadas' : 'desactivadas'}`,
      duration: 2000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Personaliza la apariencia y comportamiento de la aplicación
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleResetSettings}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar por defecto
        </Button>
      </div>

      <Separator />

      {/* Grid de configuraciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Apariencia */}
        <Card className="settings-card">
          <CardHeader className="settings-card-header">
            <Palette className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="settings-card-title">Apariencia</CardTitle>
              <CardDescription>Personaliza cómo se ve la aplicación</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Modo oscuro/claro */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Tema</Label>
                  <p className="text-xs text-muted-foreground">
                    Alterna entre modo claro y oscuro
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-orange-500" />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleThemeToggle}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Moon className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <Badge variant={isDarkMode ? "secondary" : "outline"} className="text-xs">
                {isDarkMode ? 'Modo Oscuro Activo' : 'Modo Claro Activo'}
              </Badge>
            </div>

            <Separator />

            {/* Tamaño de fuente */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Tamaño de fuente</Label>
                <p className="text-xs text-muted-foreground">
                  Ajusta el tamaño del texto en toda la aplicación
                </p>
              </div>
              <div className="space-y-3">
                <Select value={fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">
                      <div className="flex items-center space-x-2">
                        <Type className="h-3 w-3" />
                        <span>Pequeño</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center space-x-2">
                        <Type className="h-4 w-4" />
                        <span>Mediano (Recomendado)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="large">
                      <div className="flex items-center space-x-2">
                        <Type className="h-5 w-5" />
                        <span>Grande</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Preview del tamaño */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
                  <div className="space-y-1">
                    <p className="text-sm">Texto pequeño de ejemplo</p>
                    <p className="text-base">Texto normal de ejemplo</p>
                    <p className="text-lg">Texto grande de ejemplo</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comportamiento */}
        <Card className="settings-card">
          <CardHeader className="settings-card-header">
            <Zap className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="settings-card-title">Comportamiento</CardTitle>
              <CardDescription>Configura cómo se comporta la aplicación</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Animaciones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Animaciones</Label>
                  <p className="text-xs text-muted-foreground">
                    Activa o desactiva las animaciones visuales
                  </p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={handleAnimationsToggle}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <Badge variant={settings.animations ? "default" : "outline"} className="text-xs">
                {settings.animations ? 'Animaciones Activas' : 'Animaciones Desactivadas'}
              </Badge>
            </div>

            <Separator />

            {/* Información del sistema */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Información del Sistema</Label>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Versión:</p>
                  <Badge variant="outline">v1.2.0</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Tema:</p>
                  <Badge variant="secondary">
                    {isDarkMode ? 'Oscuro' : 'Claro'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Fuente:</p>
                  <Badge variant="outline">
                    {fontSize === 'small' ? 'Pequeña' : 
                     fontSize === 'medium' ? 'Mediana' : 'Grande'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Idioma:</p>
                  <Badge variant="outline">Español</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accesibilidad */}
        <Card className="settings-card">
          <CardHeader className="settings-card-header">
            <Eye className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="settings-card-title">Accesibilidad</CardTitle>
              <CardDescription>Opciones para mejorar la accesibilidad</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Las configuraciones de tamaño de fuente y tema también mejoran la accesibilidad.
              </p>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Contraste optimizado</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Textos escalables</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Navegación por teclado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos */}
        <Card className="settings-card">
          <CardHeader className="settings-card-header">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="settings-card-title">Datos y Configuración</CardTitle>
              <CardDescription>Gestiona tus datos y configuraciones</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start" disabled>
                <Download className="h-4 w-4 mr-2" />
                Exportar configuración
                <Badge variant="secondary" className="ml-auto">Próximamente</Badge>
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Importar configuración
                <Badge variant="secondary" className="ml-auto">Próximamente</Badge>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={handleResetSettings}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer con información adicional */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Sistema Empresarial GLOUPHI</p>
              <p className="text-xs text-muted-foreground">
                Configuraciones guardadas automáticamente en el navegador
              </p>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Configurado correctamente</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ajustes; 