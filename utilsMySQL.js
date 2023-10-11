var mysql   = require('mysql2')

class Obj {

    // Inicia la connexió amb la base de dades.
    init (parameters) {
        this.pool  = mysql.createPool({
            connectionLimit : 10,
            host        : parameters.host,
            port        : parameters.port,
            user        : parameters.user,
            password    : parameters.password,
            database    : parameters.database
        })

        this.pool.on('connection', (connection) => { connection.query('SET @@session.group_concat_max_len = @@global.max_allowed_packet') })
        console.log('MySQL connected with destination: ' + this.db)
    }

    // Tanca la connexió amb la base de dades.
    end () {
        this.pool.end()
    }

    // Fer una consulta a la base de dades.
    callbackQuery (queryStr, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                return callback(err)
            } else {
                return connection.query(queryStr, (err, rst) => {
                    connection.release()
                    return callback(err, rst)
                })
            }
        })
    }

    // Fer una consulta a la base de dades amb "promises".
    query (queryStr) {
        return new Promise((resolve, reject) => {
            return this.callbackQuery(queryStr, (err, rst) => { if (err)  { return reject(err) } else { return resolve(rst) } })
        })
    }
}

function Crear(){
    var _id = document.getElementById("id").value;
    var _nom = document.getElementById("nom").value;
    var _mail = document.getElementById("mail").value;
    var _pwdHash = document.getElementById("pwdHash").value;
    var _token = document.getElementById("token").value;

    var fila="<tr><td>"
        + _id + "</td><td>"
        + _nom + "</td><td>"
        + _mail + "</td><td>"
        +_pwdHash+ "</td><td>"
        +_token + "</td><td>";

    /*
    var btn = document.createElement("TR");
    btn.innerHTML=fila;
    document.getElementById("Usuaris").appendChild(btn);
    */


     if (confirm('Afegir nou usuari?')) {
       document.form1.submit();
       document.getElementById("myForm").reset();
    }
}

// Export.
module.exports = Obj