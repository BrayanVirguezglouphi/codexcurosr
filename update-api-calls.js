const fs = require('fs');
const path = require('path');

// Función para reemplazar imports y llamadas fetch
function updateApiCalls(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Agregar import de API si no existe
    if (content.includes("fetch('/api/") && !content.includes("import { api") && !content.includes("from '@/config/api'")) {
      const importRegex = /(import.*from ['"]@\/components\/ui\/use-toast['"];?)/;
      if (importRegex.test(content)) {
        content = content.replace(importRegex, '$1\nimport { apiCall } from \'@/config/api\';');
        modified = true;
      }
    }

    // Reemplazar llamadas fetch simples
    const replacements = [
      // GET requests
      { from: /fetch\(['"`]\/api\/([^'"`]+)['"`]\)/g, to: "apiCall('/api/$1')" },
      
      // POST requests
      { 
        from: /fetch\(['"`]\/api\/([^'"`]+)['"`],\s*\{\s*method:\s*['"`]POST['"`],\s*headers:\s*\{\s*['"`]Content-Type['"`]:\s*['"`]application\/json['"`]\s*\},\s*body:\s*JSON\.stringify\(([^}]+)\)\s*\}\)/g, 
        to: "apiCall('/api/$1', { method: 'POST', body: JSON.stringify($2) })" 
      },
      
      // PUT requests
      { 
        from: /fetch\(['"`]\/api\/([^'"`]+)['"`],\s*\{\s*method:\s*['"`]PUT['"`],\s*headers:\s*\{\s*['"`]Content-Type['"`]:\s*['"`]application\/json['"`]\s*\},\s*body:\s*JSON\.stringify\(([^}]+)\)\s*\}\)/g, 
        to: "apiCall('/api/$1', { method: 'PUT', body: JSON.stringify($2) })" 
      },
      
      // DELETE requests
      { 
        from: /fetch\(['"`]\/api\/([^'"`]+)['"`],\s*\{\s*method:\s*['"`]DELETE['"`]\s*\}\)/g, 
        to: "apiCall('/api/$1', { method: 'DELETE' })" 
      }
    ];

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para recorrer directorios recursivamente
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (stat.isFile() && (file.endsWith('.jsx') || file.endsWith('.js'))) {
      callback(filePath);
    }
  });
}

// Ejecutar actualización
console.log('🚀 Iniciando actualización de llamadas API...');
let filesModified = 0;

// Procesar archivos en src/pages
const pagesDir = path.join(__dirname, 'src', 'pages');
if (fs.existsSync(pagesDir)) {
  walkDir(pagesDir, (filePath) => {
    if (updateApiCalls(filePath)) {
      filesModified++;
    }
  });
}

console.log(`\n✅ Proceso completado!`);
console.log(`📁 Archivos modificados: ${filesModified}`);
console.log(`\n🎯 Próximos pasos:`);
console.log(`1. Revisa los cambios con: git diff`);
console.log(`2. Prueba la aplicación localmente`);
console.log(`3. Haz commit de los cambios`); 