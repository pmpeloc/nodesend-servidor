const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoUsuario = async (req, res) => {
  // Mostrar mensajes de error de express validator
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  // Verificar si el usuario ya fue registrado
  const { email, password } = req.body;
  let user = await Usuario.findOne({ email });
  if (user) {
    return res.status(400).json({ msg: 'El usuario ya está registrado' });
  }
  // Crear nuevo usuario
  const usuario = new Usuario(req.body);
  // Hashear el password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  try {
    await usuario.save();
    return res.json({ msg: 'Usuario creado correctamente' });
  } catch (error) {
    console.error(error);
  }
};
