// ———————————————————————————————————————————————
// Crear el registro.
// ———————————————————————————————————————————————
async function crearRegistre(req, res) {
  const nuevoRegistro = req.body;
  const sql = 'INSERT INTO user (ID, name, mail, pwdHash, token) VALUES (?, ?, ?, ?, ?)';
  const values = [nuevoRegistro.columna1, nuevoRegistro.columna2];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error fatal! No s\'ha creat el registre', err);
      res.status(500).json({ message: 'Error fatal! No s\'ha creat el registre.' });
    } else {
      console.log('Registre creat correctament!');
      res.json({ message: 'Registre creat correctament!' });
    }
  });
}; 

// ———————————————————————————————————————————————
// Modificar un registro.
// ———————————————————————————————————————————————
async function modificarRegistre(params) {
  const registroId = req.body.id;
  const datosActualizados = req.body;

  const sql = 'UPDATE user SET ID = ?, name = ?, mail = ?, pwdHash = ?, token = ? WHERE id = ?';
  const values = [IDactualitzat, nomactualitzat, mailactualitzat, pwdHashactualitzat, tokenactualitzat, registroId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error fatal! No s\'ha creat el registre', err);
      res.status(500).json({ message: 'Error a l\'actualitzar el registre!' });
    } else {
      console.log('Registre actualitzat correctament!');
      res.json({ message: 'Registre actualitzat correctament!' });
    }
  }); 
}

// ———————————————————————————————————————————————
// Eliminar un registro
// ———————————————————————————————————————————————
async function esborrarRegistre(req, res) {
  const registroId = req.body.id;
  const sql = 'DELETE FROM user WHERE id = ?';
  const values = [registroId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error fatal! No s\'ha creat el registre', err);
      res.status(500).json({ message: 'Error a l\'esborrar el registre!' });
    } else {
      console.log('Registre esborrat correctament!');
      res.json({ message: 'Registre esborrat correctament!' });
    }
  }); 
}