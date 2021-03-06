const Enlaces = require('../models/Enlace');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoEnlace = async (req, res, next) => {
  // Revisar si hay errores
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  // Crear un objeto de Enlace
  const { nombre_original, nombre } = req.body;
  const enlace = new Enlaces();
  enlace.url = shortid.generate();
  enlace.nombre = nombre;
  enlace.nombre_original = nombre_original;
  enlace.descargas = 1;
  // Si el usuario está autenticado
  if (req.usuario) {
    const { password, descargas } = req.body;
    // Asignar a enlace el número de descargas
    if (descargas) {
      enlace.descargas = descargas;
    }
    // Asignar a enlace el password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      enlace.password = await bcrypt.hash(password, salt);
    }
    // Asignar el autor
    enlace.autor = req.usuario.id;
  }
  // Almacenar en la BD
  try {
    await enlace.save();
    res.json({ msg: enlace.url });
    return next();
  } catch (error) {
    console.error(error);
  }
};

// Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
  const { url } = req.params;
  // Verificar si existe el enlace
  const enlace = await Enlaces.findOne({ url });
  if (!enlace) {
    return res.status(404).json({ msg: 'El enlace solicitado no existe.' });
  }
  // Si el enlace existe
  res.json({ archivo: enlace.nombre });
  // Si las descargas son iguales a 1 - Borrar la entrada y borrar el archivo
  const { descargas, nombre } = enlace;
  if (descargas === 1) {
    // Eliminar el archivo
    req.archivo = nombre;
    // Eliminar la entrada de la BD
    await Enlaces.findOneAndRemove(req.params.url);
    next();
  } else {
    // Si las descargas son > a 1 - Restar 1
    enlace.descargas--;
    await enlace.save();
  }
};
