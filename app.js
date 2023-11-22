/* https://www.digitalocean.com/community/tutorials/como-crear-una-aplicacion-node-js-con-docker-es */

const express = require('express')
const crypto = require('crypto')
const url = require('url')
const { v4: uuidv4 } = require('uuid')
const database = require('./utilsMySQL.js')
const shadowsObj = require('./utilsShadows.js')
const app = express()
const port = 9090
const router = express.Router();
const path = __dirname + '/public/';

router.use(function (req,res,next) {
  console.log('/' + req.method);
  next();
});

router.get('/', function(req,res){
  res.sendFile(path + 'index.html');
});

router.get('/sharks', function(req,res){
  res.sendFile(path + 'sharks.html');
});

app.use(express.static(path));
app.use('/', router);

// ———————————————————————————
// FUNCIONS PER A QUE FUNCIONI
// ———————————————————————————


// ———————————————————————————
// Gestionar usuaris en una variable (caldrà fer-ho a la base de dades).

// ————————————————————————————————
// Inicialitzar objecte de shadows.
let shadows = new shadowsObj()

// —————————————————————————————————————————————————
// Crear i configurar l'objecte de la base de dades.
var db = new database()
db.init({
  host: "localhost",
  port: 8080,
  user: "root",
  password: "pwd",
  database: "users"
})

// —————————————————————————————————
// Publicar arxius carpeta ‘public’.
app.use(express.static('public'))

// ———————————————————————————————————————————————
// Configurar per rebre dades POST en format JSON.
app.use(express.json());

// ———————————————————————————————————————————————
// ———————————— ACTIVAR EL SERVIDOR ——————————————
// ———————————————————————————————————————————————
const httpServer = app.listen(port, appListen)
async function appListen () {
  await shadows.init('./public/index.html', './public/shadows')
  console.log(`Example app listening on: http://localhost:${port}`)
}

// —————————————————————————————————————————
// Close connections when process is killed.
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close()
  db.end()
  process.exit(0);
}

// ——————————————————————————————————————————————————————————————————————————————————————————————————————————————————
// Configurar la direcció '/index-dev.html' per retornar la pàgina que descarrega tots els shadows (desenvolupament).
app.get('/index-dev.html', getIndexDev)
async function getIndexDev (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(shadows.getIndexDev())
}

// —————————————————————————————————————————————————————————————————————————————————————————————
// Configurar la direcció '/shadows.js' per retornar tot el codi de les shadows en un sol arxiu.
app.get('/shadows.js', getShadows)
async function getShadows (req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(shadows.getShadows())
}

// ———————————————————————————————————
// Configurar la direcció "/ajaxCall".
app.post('/ajaxCall', ajaxCall)
async function ajaxCall (req, res) {
  let objPost = req.body;
  let result = ""

  // Simulate delay (1 second)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Processar la petició
  switch (objPost.callType) {
      case 'actionCheckUserByToken':  result = await actionCheckUserByToken(objPost); break
      case 'actionLogout':            result = await actionLogout(objPost); break
      case 'actionLogin':             result = await actionLogin(objPost); break
      case 'actionSignUp':            result = await actionSignUp(objPost); break
      case 'actionDeleteRow':           result = await actionDeleteRow(objPost); break
      default:
          result = {result: 'KO', message: 'Invalid callType'}
          break;
  }

  // Retornar el resultat
  res.send(result)
}

async function actionCheckUserByToken (objPost) {
  let tokenValue = objPost.token
  // Si troba el token a les dades, retorna el nom d'usuari
  let tokenDB = 'SELECT * from user where token='+tokenValue;
  if (!tokenDB) {
      return {result: 'KO'}
  } else {
      let userName = "";
      return {result: 'OK', userName: userName}
  }
}

async function actionLogout (objPost) {
  let tokenValue = objPost.token
  // Si troba el token a les dades, retorna el nom d'usuari
  let nomDB = `select name from user where token='${tokenValue}'`;
  rst = await db.query(nomDB)
  if (rst[0]) {
    let tokenDB = `UPDATE user SET token = '' where name="${rst[0].name}"`
    rst2 = await db.query(tokenDB)
    return {result: 'OK'}
  } else {
      return {result: 'KO'}
  }
}

async function actionLogin (objPost) {
  let userName = objPost.userName
  let userPassword = objPost.userPassword
  let hash = crypto.createHash('md5').update(userPassword).digest("hex")
  let userDB = `SELECT name from user where name= '${userName}' and pwdHash='${hash}'`;
  rst = await db.query(userDB)
  // Buscar l'usuari a les dades
  if (rst[0]) {
    let token = uuidv4()
    let updateTokenDB = `UPDATE user SET token = '${token}' where name='${rst[0].name}'`
    rst2 = await db.query(updateTokenDB)
    return {result: 'OK', userName: userName, token: token}
    
  } else {
    return {result: 'KO'}
  }
}

async function actionSignUp (objPost) {
  let userName = objPost.userName
  let userPassword = objPost.userPassword
  let userMail = objPost.userMail
  let hash = crypto.createHash('md5').update(userPassword).digest("hex")
  let token = uuidv4()
  // Afegir l'usuari a les dades
  let insertQuery = 'insert into user(name,mail,pwdHash,token) values ("'+userName+'","'+userMail+'","'+hash+'","'+token+'")'
  db.query(insertQuery)
  return {result: 'OK', userName: userName, token: token}
}

// AÑADIR FILA.
// Asegúrate de que esta ruta esté en tu archivo app.js
app.post('/submitForm', submitRow);
async function submitRow(req, res) {
  let editName = req.body.name_sub;
  let editMail = req.body.mail_sub;
  let editPwdHash = req.body.pwdHash_sub;

  let hash = crypto.createHash('md5').update(editPwdHash).digest("hex")
  let query = `INSERT INTO user (name, mail, pwdHash) VALUES ("`+editName+`", "`+editMail+`", "`+hash+`")`;
  console.log(query);
  try {
    await db.query(query);
    res.send({ result: 'OK', message: 'Has creado una nueva fila.' });
  } catch (error) {
    console.error('Error al crear la fila en la base de datos:', error);
    res.send({ result: 'KO', message: 'Error al crear la fila en la base de datos.' });
  }
}

// BORRAR FILA.
app.post('/deleteUser', deleteRow);
async function deleteRow(req, res) {
  let deleteID = req.body.ID;

  let query = `DELETE FROM user WHERE ID = `+deleteID+``;

  try {
    await db.query(query);
    res.send({ result: 'OK', message: 'Se ha eliminado la fila correctamente.' });
  } catch (error) {
    console.error('Error al eliminar la fila de la base de datos:', error);
    res.send({ result: 'KO', message: 'Error al eliminar la fila de la base de datos.' });
  }
}

// EDITAR FILA.
app.post('/editUser', editRow);
async function editRow(req, res) {
  let editID = req.body.id;
  let editName = req.body.name;
  let editMail = req.body.mail;
  let editPwdHash = req.body.pwdHash;
  let hash = crypto.createHash('md5').update(editPwdHash).digest("hex")
  let query = `UPDATE user SET name="`+editName+`", mail="`+editMail+`", pwdHash="`+hash+`" WHERE ID =`+editID+`;`;
  console.log(query )
  try {
    await db.query(query);
    res.send({ result: 'OK', message: 'Se ha editado la fila correctamente.' });
  } catch (error) {
    console.error('Error al editar la fila en la base de datos:', error);
    res.send({ result: 'KO', message: 'Error al editar la fila en la base de datos.' });
  }
}


// Crear Tabla
app.post('/submitTable',createTable)
async function createTable(req,res) {
  let tableName = req.body.nameTable;
  let strVal = req.body.strValues;
  let userName = req.userName;
  let token = req.body.token;
  let query = "create table if not exists `"+tableName+"` ("+strVal+");";
  console.log(query)
  try {
    await db.query(query);
    res.send({ result: 'OK', message: 'Se ha creado la tabla correctamente.', userName: userName, token: token});
  } catch (error) {
    console.error('Error al editar la fila en la base de datos:', error);
    res.send({ result: 'KO', message: 'Error al crear la tabla en la base de datos.'});
    //return {result: 'OK', userName: userName, token: token}
  }
}

app.post('/modTable', updateTableName);
async function updateTableName(req, res) {
    let tableName = req.body.nameTable;
    let userName = req.body.userName;
    let token = req.body.token;
    let query = "ALTER TABLE `" + currentName + "` RENAME TO `" + newName + "`;";
    console.log(query);
    
    try {
        await db.query(query);
        res.send({ result: 'OK', message: 'Se ha eliminado la tabla correctamente.', userName: userName, token: token });
    } catch (error) {
        console.error('Error al editar la fila en la base de datos:', error);
        res.send({ result: 'KO', message: 'Error al eliminar la tabla en la base de datos.' });
    }
}
app.post('/deleteTabla',eliminarTabla)
async function eliminarTabla(req,res) {
  let tableName = req.body.nameTable;
  let userName = req.body.userName;
  let token = req.body.token;
  let query = "drop table if exists `"+tableName+"`;";
  console.log(query)
  try {
    await db.query(query);
    res.send({ result: 'OK', message: 'Se ha eliminado la tabla correctamente.', userName: userName, token: token});
  } catch (error) {
    console.error('Error al editar la fila en la base de datos:', error);
    res.send({ result: 'KO', message: 'Error al eliminar la tabla en la base de datos.' });
  }
}