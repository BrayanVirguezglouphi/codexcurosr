import StaffOKR from './StaffOKR.js';
import Objetivo from './Objetivo.js';
import ResultadoClave from './ResultadoClave.js';
import RegistroAvance from './RegistroAvance.js';
import ComentarioOKR from './ComentarioOKR.js';

// Relaciones de Staff
StaffOKR.hasMany(Objetivo, { 
  foreignKey: 'id_responsable', 
  as: 'objetivos' 
});

StaffOKR.hasMany(ResultadoClave, { 
  foreignKey: 'id_responsable', 
  as: 'keyResults' 
});

StaffOKR.hasMany(ComentarioOKR, { 
  foreignKey: 'id_autor', 
  as: 'comentarios' 
});

// Relaciones de Objetivo
Objetivo.belongsTo(StaffOKR, { 
  foreignKey: 'id_responsable', 
  as: 'responsable' 
});

Objetivo.hasMany(ResultadoClave, { 
  foreignKey: 'id_objetivo', 
  as: 'keyResults' 
});

Objetivo.hasMany(ComentarioOKR, { 
  foreignKey: 'id_objetivo', 
  as: 'comentarios' 
});

// Auto-relación para objetivos padre/hijo
Objetivo.hasMany(Objetivo, { 
  foreignKey: 'id_objetivo_preexistente', 
  as: 'subObjetivos' 
});

Objetivo.belongsTo(Objetivo, { 
  foreignKey: 'id_objetivo_preexistente', 
  as: 'objetivoPadre' 
});

// Relaciones de ResultadoClave
ResultadoClave.belongsTo(Objetivo, { 
  foreignKey: 'id_objetivo', 
  as: 'objetivo' 
});

ResultadoClave.belongsTo(StaffOKR, { 
  foreignKey: 'id_responsable', 
  as: 'responsable' 
});

ResultadoClave.hasMany(RegistroAvance, { 
  foreignKey: 'id_kr', 
  as: 'registrosAvance' 
});

ResultadoClave.hasMany(ComentarioOKR, { 
  foreignKey: 'id_kr', 
  as: 'comentarios' 
});

// Relaciones de RegistroAvance
RegistroAvance.belongsTo(ResultadoClave, { 
  foreignKey: 'id_kr', 
  as: 'keyResult' 
});

// Relaciones de ComentarioOKR
ComentarioOKR.belongsTo(Objetivo, { 
  foreignKey: 'id_objetivo', 
  as: 'objetivo' 
});

ComentarioOKR.belongsTo(ResultadoClave, { 
  foreignKey: 'id_kr', 
  as: 'keyResult' 
});

ComentarioOKR.belongsTo(StaffOKR, { 
  foreignKey: 'id_autor', 
  as: 'autor' 
});

export {
  StaffOKR,
  Objetivo,
  ResultadoClave,
  RegistroAvance,
  ComentarioOKR
}; 