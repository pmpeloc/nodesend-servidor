const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (authHeader) {
    // Obtener el token
    const token = authHeader.split(' ')[1];
    // Comprobar el JWT
    try {
      const usuario = jwt.verify(token, process.env.SECRET);
      // console.log(usuario);
      req.usuario = usuario;
    } catch (error) {
      console.error(error);
    }
  }
  return next();
};
