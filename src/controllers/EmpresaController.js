import Empresa from '../models/Empresa.js';

export const getAllEmpresas = async (req, res) => {
  try {
    console.log('🔍 Obteniendo empresas...');
    const empresas = await Empresa.findAll({
      order: [['empresa', 'ASC']]
    });
    console.log(`✅ Encontradas ${empresas.length} empresas`);
    res.json(empresas);
  } catch (error) {
    console.error('❌ Error al obtener empresas:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

export const getEmpresaById = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (empresa) {
      res.json(empresa);
    } else {
      res.status(404).json({ message: 'Empresa no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener empresa por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createEmpresa = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    
    // Validar campos requeridos
    const camposRequeridos = ['empresa'];
    for (const campo of camposRequeridos) {
      if (req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === '') {
        return res.status(400).json({ 
          message: `El campo ${campo} es requerido`,
          field: campo
        });
      }
    }

    const empresa = await Empresa.create(req.body);
    console.log('Empresa creada:', empresa);
    res.status(201).json(empresa);
  } catch (error) {
    console.error('Error al crear empresa:', error);
    
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Error de validación',
        details: error.errors?.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      });
    }
    
    res.status(500).json({ 
      message: 'Error interno al crear la empresa',
      error: error.message
    });
  }
};

export const updateEmpresa = async (req, res) => {
  try {
    console.log('🔄 UPDATE - ID:', req.params.id);
    console.log('🔄 UPDATE - Datos recibidos:', req.body);
    
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) {
      console.log('❌ UPDATE - Empresa no encontrada:', req.params.id);
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    console.log('✅ UPDATE - Empresa encontrada:', empresa.id_empresa);

    console.log('🔄 UPDATE - Actualizando empresa...');
    await empresa.update(req.body);
    console.log('✅ UPDATE - Empresa actualizada correctamente');
    console.log('📤 UPDATE - Enviando respuesta:', empresa.toJSON());
    
    res.json(empresa);
  } catch (error) {
    console.error('❌ UPDATE - Error al actualizar empresa:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    await empresa.destroy();
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    res.status(500).json({ message: error.message });
  }
}; 