# 🧪 Prueba de Plantillas Excel - Guía Paso a Paso

## ✅ Cambios Implementados

### 1. **Mejoras en ImportDialog**
- ✅ Logs detallados para debugging
- ✅ Mejor manejo de errores
- ✅ Soporte mejorado para templateData
- ✅ Verificación de datos antes de crear archivo

### 2. **Configuración de Datos de Plantilla**
- ✅ **Terceros**: templateData con ejemplos completos
- ✅ **Facturas**: templateData con ejemplos apropiados
- ✅ Datos coherentes y realistas

## 📋 Pasos para Probar

### **Paso 1: Abrir la Aplicación**
```
http://localhost:5176/
```
(Usa el puerto que aparezca en tu terminal)

### **Paso 2: Probar Terceros**
1. Ve a **Contabilidad > Terceros**
2. Haz clic en **"Importar Excel"**
3. En el diálogo que aparece:
   - Ve a la consola (F12 > Console)
   - Haz clic en **"Plantilla"**
   - Observa los logs detallados:
     ```
     🔄 Iniciando descarga de plantilla desde ImportDialog...
     📋 Datos disponibles: {...}
     ✅ Librerías importadas correctamente
     📝 Usando templateData proporcionado
     📊 Datos de plantilla creados: [...]
     📁 Archivo Excel creado, generando buffer...
     💾 Descargando archivo: {...}
     ✅ Plantilla descargada exitosamente
     ```

4. **Verificar el archivo descargado:**
   - Nombre: `plantilla_terceros.xlsx`
   - Debe contener columnas como:
     - Tipo Personalidad
     - Número Documento
     - Tipo Relación
     - Teléfono
     - Email
     - etc.
   - Primera fila con datos de ejemplo válidos

### **Paso 3: Probar Facturas**
1. Ve a **Contabilidad > Facturas**
2. Repite el proceso anterior
3. Verifica:
   - Nombre: `plantilla_facturas.xlsx`
   - Columnas correctas para facturas
   - Datos de ejemplo apropiados

## 🔍 Qué Buscar en los Logs

### **Logs Exitosos:**
```
🔄 Iniciando descarga de plantilla desde ImportDialog...
📋 Datos disponibles: {
  displayName: "terceros",
  finalTemplateData: 1,
  finalColumns: 17
}
✅ Librerías importadas correctamente
📝 Usando templateData proporcionado
📊 Datos de plantilla creados: [{...}]
📁 Archivo Excel creado, generando buffer...
💾 Descargando archivo: {
  nombre: "plantilla_terceros.xlsx",
  tamaño: 4567,
  tipo: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}
✅ Plantilla descargada exitosamente
```

### **Si Hay Errores:**
Los logs mostrarán exactamente qué está fallando:
- ❌ Error en importación de librerías
- ❌ Datos de plantilla vacíos
- ❌ Error al crear archivo Excel
- ❌ Error en la descarga

## 🚨 Posibles Problemas y Soluciones

### **Error: "No hay datos para crear la plantilla"**
**Causa:** templateData vacío o malformado
**Solución:** Verificar que templateData esté correctamente definido

### **Error: "Cannot read properties of undefined"**
**Causa:** Estructura de datos incorrecta
**Solución:** Revisar logs de debug para ver qué datos están llegando

### **El botón "Plantilla" no aparece**
**Causa:** Datos no se están pasando correctamente al ImportDialog
**Solución:** Verificar que `templateData` o `columns` estén definidos

### **El archivo se descarga vacío**
**Causa:** Problema en la generación del Excel
**Solución:** Revisar logs para ver si hay errores en la creación del archivo

## 📊 Estructura Esperada de Plantillas

### **Terceros (plantilla_terceros.xlsx):**
```
| Tipo Personalidad | Tipo Documento | Número Documento | ... |
|-------------------|----------------|------------------|-----|
| NATURAL          | CC             | 12345678         | ... |
```

### **Facturas (plantilla_facturas.xlsx):**
```
| Número        | Estado    | Fecha Radicado | Subtotal | ... |
|---------------|-----------|----------------|----------|-----|
| FAC-2024-001  | PENDIENTE | 2024-01-15     | 1000000  | ... |
```

## ✅ Lista de Verificación Final

- [ ] Servidor funcionando en puerto correcto
- [ ] Página de Terceros abre sin errores
- [ ] Botón "Importar Excel" funciona
- [ ] Botón "Plantilla" es visible
- [ ] Logs detallados aparecen en consola
- [ ] Archivo `plantilla_terceros.xlsx` se descarga
- [ ] Archivo contiene datos válidos
- [ ] Repetir para Facturas
- [ ] Ambas plantillas se abren correctamente en Excel

## 🎯 Resultado Esperado

**✅ ÉXITO**: Ambas plantillas se descargan correctamente con datos de ejemplo apropiados.

Si todos los pasos funcionan correctamente, el problema de descarga de plantillas está **completamente solucionado**.

## 📝 Limpieza Post-Prueba

Una vez que verifiques que todo funciona:
1. Puedes quitar los logs de debug temporales
2. Remover el botón de diagnóstico Excel
3. El sistema quedará listo para producción

¿Funcionó todo correctamente? ¡Excelente! El sistema está operativo. 