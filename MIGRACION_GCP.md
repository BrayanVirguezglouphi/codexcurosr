# 🚀 Google Cloud Platform - Configuración Completada ✅

## ✅ Migración Exitosa de Vercel + Railway a GCP

### 1. Preparación
```bash
# 1. Instalar Google Cloud CLI
# Descargar desde: https://cloud.google.com/sdk/docs/install

# 2. Autenticarse
gcloud auth login

# 3. Crear proyecto (cambiar 'tu-proyecto-pros' por tu nombre deseado)
gcloud projects create tu-proyecto-pros --name="Sistema Empresarial PROS"
gcloud config set project tu-proyecto-pros

# 4. Habilitar APIs necesarias
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
```

### 2. Crear Base de Datos (Cloud SQL)
```bash
# Crear instancia PostgreSQL
gcloud sql instances create pros-database \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB

# Establecer contraseña
gcloud sql users set-password postgres \
    --instance=pros-database \
    --password=TU-NUEVA-PASSWORD-SEGURA

# Crear base de datos
gcloud sql databases create railway --instance=pros-database

# Obtener IP de Cloud SQL
gcloud sql instances describe pros-database --format="value(ipAddresses[0].ipAddress)"
```

### 3. Configurar Variables de Entorno
```bash
# Cambiar a configuración GCP
npm run env:gcp

# Editar manualmente el archivo .env para agregar:
# - IP de Cloud SQL en DB_HOST
# - Nueva contraseña en DB_PASSWORD
```

### 4. Migrar Datos (Opcional)
```bash
# Exportar desde Railway
pg_dump -h nozomi.proxy.rlwy.net -p 36062 -U postgres -d railway > backup.sql

# Importar a Cloud SQL (reemplazar [CLOUD_SQL_IP] con la IP real)
psql -h [CLOUD_SQL_IP] -U postgres -d railway < backup.sql
```

### 5. Desplegar Aplicación
```bash
# Opción A: Usando script automatizado
npm run deploy:gcp

# Opción B: Paso a paso
npm run gcp:build    # Construir imagen Docker
npm run gcp:deploy   # Desplegar a Cloud Run
```

### 6. Verificar Despliegue
```bash
# Ver logs
gcloud run logs tail pros-app --region us-central1

# Obtener URL de la aplicación
gcloud run services describe pros-app --platform managed --region us-central1 --format 'value(status.url)'
```

## 💰 Costos Estimados (USD/mes)

| Servicio | Costo Estimado |
|----------|----------------|
| Cloud SQL (db-f1-micro) | $7-15/mes |
| Cloud Run | $0 (nivel gratuito hasta 2M requests) |
| Cloud Storage | $1-5/mes |
| Cloud Build | $0 (nivel gratuito hasta 120 min/día) |
| **Total** | **$8-25/mes** |

**Comparación:**
- Vercel Pro: $20/mes
- Railway: $5-20/mes
- **Total actual**: $25-40/mes

## 🎯 Ventajas de GCP

1. **Costo**: Potencialmente más económico
2. **Integración**: Todo en un solo proveedor
3. **Escalabilidad**: Auto-scaling nativo
4. **Confiabilidad**: SLA del 99.95%
5. **Monitoreo**: Herramientas integradas de logging y monitoreo

## 📋 Comandos Útiles Post-Migración

```bash
# Ver estado de servicios
gcloud run services list

# Actualizar variables de entorno
gcloud run services update pros-app --region us-central1 --set-env-vars KEY=VALUE

# Ver métricas de base de datos
gcloud sql instances describe pros-database

# Configurar dominio personalizado
gcloud run domain-mappings create --service pros-app --domain tu-dominio.com --region us-central1

# Hacer rollback
gcloud run services replace service.yaml --region us-central1

# Ver facturación
gcloud billing accounts list
```

## 🔧 Configuración de Dominio Personalizado

1. Ir a Cloud Console > Cloud Run > pros-app
2. Click en "Manage Custom Domains"
3. Agregar tu dominio
4. Configurar registros DNS según las instrucciones

## 📊 Monitoreo y Alertas

1. Ir a Cloud Console > Monitoring
2. Configurar alertas para:
   - CPU usage > 80%
   - Memory usage > 80%
   - Error rate > 5%
   - Response time > 2s

## 🚨 Troubleshooting

### Error de conexión a base de datos
```bash
# Verificar que Cloud SQL esté funcionando
gcloud sql instances describe pros-database

# Verificar conectividad
gcloud sql connect pros-database --user=postgres
```

### Error en Cloud Run
```bash
# Ver logs detallados
gcloud run logs tail pros-app --region us-central1

# Ver configuración del servicio
gcloud run services describe pros-app --region us-central1
```

### Problema con build
```bash
# Ver historial de builds
gcloud builds list

# Ver logs de un build específico
gcloud builds log [BUILD_ID]
``` 