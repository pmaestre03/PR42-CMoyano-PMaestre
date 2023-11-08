// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————— CREAR FILA ——————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
function crearFila() {
  const form = document.querySelector('form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const ID = document.getElementById('crearID').value;
    const Nom = document.getElementById('crearNom').value;
    const Mail = document.getElementById('crearMail').value;
    const pwdHash = document.getElementById('crearpwdHash').value;
    const Token = document.getElementById('crearToken').value;

    connection.connect((err) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
      }
      console.log('Conexión a la base de datos establecida.');

      // Query SQL para insertar una fila
      const insertQuery = `INSERT INTO user (ID, name, mail, pwdHash, token) VALUES (?, ?, ?, ?, ?)`;
      const values = [ID, Nom, Mail, pwdHash, Token];

      connection.query(insertQuery, values, (err, results) => {
        if (err) {
          console.error('Error al insertar la fila en la base de datos:', err);
        } else {
          console.log('Fila insertada con éxito en la base de datos.');
          alert('Fila insertada con éxito!');
        }
        connection.end();
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  crearFila();
});

// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
// ———————————————————————————————————————————————————————— ESBORRAR FILA —————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
document.addEventListener('DOMContentLoaded', function () {
  //const esborrarButton = document.getElementById('esborrarButton');

  function esborrarFila() {
    const registroEsborrar = document.getElementById('registroEsborrar').value;
    const confirmacionEsborrar = document.getElementById('confirmacionEsborrar').checked;
    connection.connect((err) => {
        if (err) {
          console.error('Error al conectar a la base de dades:', err);
          return;
        }
        console.log('Conexió a la base de dades establerta.');
        
        if (confirmacionEsborrar) {
          const deleteQuery = `DELETE FROM user WHERE ID = ?`;
          connection.query(deleteQuery, [registroEsborrar], (err, results) => {
            if (err) {
              console.error('Error a l\'esborrar la fila de la base de dades:', err);
            } else {
              console.log('Fila esborrada amb èxit de la base de dades.');
              alert('Fila esborrada amb èxit');
            }
            connection.end();
        })} else { alert('Cal confirmar l\'esborrament seleccionant la casella de verificació.') };
  })}});

// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
// ———————————————————————————————————————————————————————— MODIFICAR FILA ————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
document.addEventListener('DOMContentLoaded', function () {
  const modificarButton = document.getElementById('modificarButton');
  modificarButton.addEventListener('click', function () {
    modificarFila();
  });

  function modificarFila() {
    const nouValor = document.getElementById('nouValor').value;
    const registroModificar = document.getElementById('registroModificar').value;
    connection.connect((err) => {
      if (err) {
        console.error('Error al conectar a la base de dades:', err);
        return;
      }
      console.log('Conexió a la base de dades establerta.');
      const updateQuery = `UPDATE user SET name = ? WHERE ID = ?`;
      connection.query(updateQuery, [nouValor, registroModificar], (err, results) => {
        if (err) {
          console.error('Error al modificar la fila a la base de dades:', err);
        } else {
          console.log('Fila esborrada amb èxit de la base de dades.');
          alert('Fila modificada amb èxito');
        } connection.end(); 
    })});
}});