# 🚀 API Documentation - Sistema Empresarial

## 📋 Información General

- **Base URL**: `http://localhost:5000/api`
- **Versión**: 1.0
- **Formato de Respuesta**: JSON
- **Autenticación**: No implementada (en desarrollo)

## 📊 Estructura de Respuestas

### Respuesta Exitosa (200/201)
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Respuesta de Error (4xx/5xx)
```json
{
  "error": "Descripción del error",
  "message": "Mensaje detallado",
  "details": [...] // Opcional
}
```

## 🔗 Endpoints Disponibles

### 📋 Facturas

#### GET /api/facturas
Lista todas las facturas con paginación y filtros opcionales.

**Parámetros de Query:**
- `page` (integer, opcional): Número de página (default: 1)
- `limit` (integer, opcional): Elementos por página (default: 10)
- `status` (string, opcional): Filtrar por estado ('PENDIENTE', 'PAGADA', 'VENCIDA')
- `search` (string, opcional): Búsqueda por número de factura o contrato

**Ejemplo de Solicitud:**
```bash
GET /api/facturas?page=1&limit=5&status=PENDIENTE
```

**Ejemplo de Respuesta (200):**
```json
{
  "data": [
    {
      "id_factura": 57,
      "numero_factura": "1",
      "estatus_factura": "PAGADA",
      "id_contrato": 10,
      "fecha_radicado": "2032-09-06T00:00:00.000Z",
      "fecha_estimada_pago": "2025-10-06T00:00:00.000Z",
      "id_moneda": 2,
      "subtotal_facturado_moneda": "45000000.00",
      "Contrato": {
        "id_contrato": 10,
        "nombre_contrato": "Contrato Ejemplo",
        "Tercero": {
          "id_tercero": 1,
          "nombre_tercero": "Empresa ABC S.A.S"
        }
      },
      "Moneda": {
        "id_moneda": 2,
        "nombre_moneda": "COP",
        "simbolo_moneda": "$"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 23,
    "pages": 5
  }
}
```

#### GET /api/facturas/:id
Obtiene una factura específica por ID.

**Parámetros de Ruta:**
- `id` (integer): ID de la factura

**Ejemplo de Solicitud:**
```bash
GET /api/facturas/57
```

**Respuesta (200):**
```json
{
  "id_factura": 57,
  "numero_factura": "1",
  "estatus_factura": "PAGADA",
  "fecha_radicado": "2032-09-06T00:00:00.000Z",
  "fecha_estimada_pago": "2025-10-06T00:00:00.000Z",
  "subtotal_facturado_moneda": "45000000.00",
  "id_contrato": 10,
  "id_moneda": 2
}
```

#### POST /api/facturas
Crea una nueva factura.

**Body de la Solicitud:**
```json
{
  "numero_factura": "F-2025-001",
  "estatus_factura": "PENDIENTE",
  "fecha_radicado": "2025-01-15",
  "fecha_estimada_pago": "2025-02-15",
  "subtotal_facturado_moneda": 1500000,
  "id_contrato": 1,
  "id_moneda": 1
}
```

**Respuesta (201):**
```json
{
  "id_factura": 58,
  "numero_factura": "F-2025-001",
  "estatus_factura": "PENDIENTE",
  "fecha_radicado": "2025-01-15T00:00:00.000Z",
  "fecha_estimada_pago": "2025-02-15T00:00:00.000Z",
  "subtotal_facturado_moneda": "1500000.00",
  "id_contrato": 1,
  "id_moneda": 1,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

#### POST /api/facturas/import
Importa facturas desde un archivo Excel.

**Content-Type:** `multipart/form-data`

**Body de la Solicitud:**
- `file`: Archivo Excel (.xlsx)

**Ejemplo de Respuesta (200):**
```json
{
  "message": "Facturas importadas exitosamente",
  "imported": 15,
  "errors": []
}
```

### 💰 Transacciones

#### GET /api/transacciones
Lista todas las transacciones.

**Parámetros de Query:**
- `page` (integer, opcional): Número de página
- `limit` (integer, opcional): Elementos por página
- `tipo` (string, opcional): Filtrar por tipo ('VENTA', 'COMPRA', 'PAGO', 'REEMBOLSO')

**Ejemplo de Respuesta (200):**
```json
{
  "data": [
    {
      "id_transaccion": 1,
      "fecha_transaccion": "2025-01-15T00:00:00.000Z",
      "valor_total_transaccion": "5000000.00",
      "tipo_transaccion": "VENTA",
      "descripcion_transaccion": "Venta de servicios",
      "id_cuenta": 1,
      "id_tipo_transaccion": 1,
      "id_moneda": 1
    }
  ]
}
```

#### POST /api/transacciones
Crea una nueva transacción.

**Body de la Solicitud:**
```json
{
  "fecha_transaccion": "2025-01-15",
  "valor_total_transaccion": 2500000,
  "tipo_transaccion": "VENTA",
  "descripcion_transaccion": "Pago de factura F-001",
  "id_cuenta": 1,
  "id_tipo_transaccion": 1,
  "id_moneda": 1
}
```

### 🤝 Terceros

#### GET /api/terceros
Lista todos los terceros.

**Parámetros de Query:**
- `page`, `limit`: Paginación
- `tipo` (string, opcional): 'NATURAL' o 'JURIDICA'
- `estado` (string, opcional): 'ACTIVO' o 'INACTIVO'

**Ejemplo de Respuesta (200):**
```json
{
  "data": [
    {
      "id_tercero": 1,
      "nombre_tercero": "Juan Pérez",
      "tipo_personalidad": "NATURAL",
      "numero_identificacion": "12345678",
      "estado_tercero": "ACTIVO",
      "telefono_tercero": "3001234567",
      "email_tercero": "juan@email.com",
      "direccion_tercero": "Calle 123 #45-67"
    }
  ]
}
```

#### POST /api/terceros
Crea un nuevo tercero.

**Body de la Solicitud:**
```json
{
  "nombre_tercero": "María García",
  "tipo_personalidad": "NATURAL",
  "numero_identificacion": "87654321",
  "estado_tercero": "ACTIVO",
  "telefono_tercero": "3109876543",
  "email_tercero": "maria@email.com",
  "direccion_tercero": "Carrera 456 #78-90"
}
```

#### POST /api/terceros/bulk-create
Crea múltiples terceros de una vez.

**Body de la Solicitud:**
```json
{
  "terceros": [
    {
      "nombre_tercero": "Empresa ABC S.A.S",
      "tipo_personalidad": "JURIDICA",
      "numero_identificacion": "900123456",
      "estado_tercero": "ACTIVO"
    },
    {
      "nombre_tercero": "Carlos López",
      "tipo_personalidad": "NATURAL",
      "numero_identificacion": "11223344",
      "estado_tercero": "ACTIVO"
    }
  ]
}
```

### 📄 Contratos

#### GET /api/contratos
Lista todos los contratos.

**Ejemplo de Respuesta (200):**
```json
{
  "data": [
    {
      "id_contrato": 1,
      "nombre_contrato": "Contrato de Servicios 2025",
      "fecha_inicio_contrato": "2025-01-01T00:00:00.000Z",
      "fecha_fin_contrato": "2025-12-31T00:00:00.000Z",
      "valor_cotizado": "25000000.00",
      "estado_contrato": "ACTIVO",
      "descripcion_contrato": "Contrato para servicios de consultoría",
      "id_tercero": 1,
      "id_moneda": 1,
      "Tercero": {
        "nombre_tercero": "Empresa ABC S.A.S"
      }
    }
  ]
}
```

#### POST /api/contratos
Crea un nuevo contrato.

**Body de la Solicitud:**
```json
{
  "nombre_contrato": "Contrato Desarrollo Web",
  "fecha_inicio_contrato": "2025-02-01",
  "fecha_fin_contrato": "2025-07-31",
  "valor_cotizado": 15000000,
  "estado_contrato": "ACTIVO",
  "descripcion_contrato": "Desarrollo de plataforma web",
  "id_tercero": 1,
  "id_moneda": 1
}
```

### 🏷️ Impuestos

#### GET /api/impuestos
Lista todos los impuestos configurados.

**Ejemplo de Respuesta (200):**
```json
{
  "data": [
    {
      "id_impuesto": 1,
      "nombre_impuesto": "IVA",
      "porcentaje_impuesto": "19.00",
      "estado_impuesto": "ACTIVO",
      "fecha_inicio": "2025-01-01T00:00:00.000Z",
      "fecha_fin": null,
      "descripcion_impuesto": "Impuesto al Valor Agregado"
    }
  ]
}
```

#### POST /api/impuestos
Crea un nuevo impuesto.

**Body de la Solicitud:**
```json
{
  "nombre_impuesto": "Retención en la Fuente",
  "porcentaje_impuesto": 11.5,
  "estado_impuesto": "ACTIVO",
  "fecha_inicio": "2025-01-01",
  "descripcion_impuesto": "Retención aplicable a servicios"
}
```

### 🏢 Líneas de Servicios

#### GET /api/lineas-servicios
Lista todas las líneas de servicios.

**Ejemplo de Respuesta (200):**
```json
{
  "data": [
    {
      "id_linea_servicio": 1,
      "nombre_linea_servicio": "Consultoría",
      "descripcion_linea_servicio": "Servicios de consultoría empresarial",
      "tipo_servicio": "Consultoría",
      "estado": "ACTIVO"
    }
  ]
}
```

#### POST /api/lineas-servicios
Crea una nueva línea de servicio.

**Body de la Solicitud:**
```json
{
  "nombre_linea_servicio": "Desarrollo de Software",
  "descripcion_linea_servicio": "Desarrollo de aplicaciones web y móviles",
  "tipo_servicio": "Desarrollo",
  "estado": "ACTIVO"
}
```

### 📊 Catálogos

#### GET /api/catalogos/cuentas
Obtiene el catálogo de cuentas contables.

**Respuesta (200):**
```json
{
  "data": [
    {
      "id_cuenta": 1,
      "codigo_cuenta": "1105",
      "nombre_cuenta": "Caja"
    },
    {
      "id_cuenta": 2,
      "codigo_cuenta": "1110",
      "nombre_cuenta": "Bancos"
    }
  ]
}
```

#### GET /api/catalogos/monedas
Obtiene el catálogo de monedas.

**Respuesta (200):**
```json
{
  "data": [
    {
      "id_moneda": 1,
      "nombre_moneda": "COP",
      "simbolo_moneda": "$",
      "descripcion": "Peso Colombiano"
    },
    {
      "id_moneda": 2,
      "nombre_moneda": "USD",
      "simbolo_moneda": "US$",
      "descripcion": "Dólar Estadounidense"
    }
  ]
}
```

#### GET /api/catalogos/tipos-transaccion
Obtiene los tipos de transacciones disponibles.

**Respuesta (200):**
```json
{
  "data": [
    {
      "id_tipo_transaccion": 1,
      "nombre_tipo": "Venta de Servicios",
      "codigo_tipo": "VS"
    },
    {
      "id_tipo_transaccion": 2,
      "nombre_tipo": "Compra de Suministros",
      "codigo_tipo": "CS"
    }
  ]
}
```

## 📝 Códigos de Estado HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (duplicado) |
| 500 | Internal Server Error | Error interno del servidor |

## 🔍 Filtros y Búsquedas

### Operadores de Búsqueda
- **Texto**: Búsqueda parcial (LIKE)
- **Fechas**: Filtros por rango
- **Estados**: Filtro exacto
- **Números**: Filtros por rango

### Ejemplos de Filtros Avanzados

```bash
# Facturas pendientes del último mes
GET /api/facturas?status=PENDIENTE&fecha_desde=2025-01-01&fecha_hasta=2025-01-31

# Transacciones de tipo VENTA mayores a $1,000,000
GET /api/transacciones?tipo=VENTA&valor_min=1000000

# Terceros activos de tipo jurídico
GET /api/terceros?estado=ACTIVO&tipo=JURIDICA
```

## 📊 Paginación

Todas las listas soportan paginación:

**Parámetros:**
- `page`: Número de página (inicia en 1)
- `limit`: Elementos por página (máximo 100)

**Respuesta:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 156,
    "pages": 16,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## 🚀 Ejemplos de Uso

### Flujo Completo: Crear Factura

1. **Obtener terceros disponibles:**
```bash
GET /api/terceros?estado=ACTIVO
```

2. **Obtener contratos del tercero:**
```bash
GET /api/contratos?id_tercero=1&estado=ACTIVO
```

3. **Crear la factura:**
```bash
POST /api/facturas
Content-Type: application/json

{
  "numero_factura": "F-2025-001",
  "estatus_factura": "PENDIENTE",
  "fecha_radicado": "2025-01-15",
  "fecha_estimada_pago": "2025-02-15",
  "subtotal_facturado_moneda": 1500000,
  "id_contrato": 1,
  "id_moneda": 1
}
```

### Importación Masiva

```bash
# Subir archivo Excel con terceros
POST /api/terceros/bulk-create
Content-Type: multipart/form-data

file: terceros.xlsx
```

## 🔧 Configuración y Variables

### Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Servidor
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Límites y Restricciones

- **Tamaño máximo de archivo**: 10MB
- **Elementos por página (máximo)**: 100
- **Longitud máxima de string**: 255 caracteres
- **Timeout de request**: 30 segundos

## 🛠️ Herramientas de Testing

### cURL Examples

```bash
# Listar facturas
curl -X GET "http://localhost:5000/api/facturas" \
  -H "Content-Type: application/json"

# Crear tercero
curl -X POST "http://localhost:5000/api/terceros" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_tercero": "Test User",
    "tipo_personalidad": "NATURAL",
    "numero_identificacion": "12345678",
    "estado_tercero": "ACTIVO"
  }'
```

### Postman Collection

```json
{
  "info": {
    "name": "Sistema Empresarial API",
    "description": "Colección completa de endpoints"
  },
  "item": [
    {
      "name": "Facturas",
      "item": [
        {
          "name": "Listar Facturas",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/facturas"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    }
  ]
}
```

## ⚠️ Manejo de Errores

### Errores Comunes

#### 400 - Bad Request
```json
{
  "error": "Datos inválidos",
  "details": [
    {
      "field": "numero_factura",
      "message": "Número de factura es requerido"
    }
  ]
}
```

#### 404 - Not Found
```json
{
  "error": "Recurso no encontrado",
  "message": "La factura con ID 999 no existe"
}
```

#### 409 - Conflict
```json
{
  "error": "Conflicto",
  "message": "El número de factura ya existe"
}
```

#### 500 - Internal Server Error
```json
{
  "error": "Error interno del servidor",
  "message": "Ha ocurrido un error inesperado"
}
```

## 📈 Métricas y Monitoreo

### Endpoints de Health Check

```bash
# Estado del servidor
GET /api/health

# Estado de la base de datos
GET /api/health/database
```

### Logs de Auditoria

Todas las operaciones CUD (Create, Update, Delete) se registran automáticamente con:
- Timestamp
- Usuario (cuando esté implementado)
- Acción realizada
- Datos modificados

---

## 📞 Soporte

Para reportar errores o solicitar nuevas funcionalidades:

- **Issues**: GitHub Issues
- **Email**: api-support@empresa.com
- **Documentación**: Esta documentación se actualiza automáticamente

---

*API Documentation v1.0 - Última actualización: Junio 2025* 