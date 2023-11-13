// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————— CREAR FILA ——————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
async function submitForm() {
  const formData = {
      ID: document.getElementById('ID').value,
      name: document.getElementById('name').value,
      mail: document.getElementById('mail').value,
      pwdHash: document.getElementById('pwdHash').value,
      token: document.getElementById('token').value
  };

  const response = await fetch('/submitForm', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
  });

  const result = await response.json();
  console.log(result);
}

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