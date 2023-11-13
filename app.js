/* https://www.digitalocean.com/community/tutorials/como-crear-una-aplicacion-node-js-con-docker-es */

const express = require('express')
const crypto = require('crypto')
const url = require('url')
const { v4: uuidv4 } = require('uuid')
const database = require('./utilsMySQL.js')
const shadowsObj = require('./utilsShadows.js')
const app = express()
const port = 8080
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
let hash0 = crypto.createHash('md5').update("1234").digest("hex")
let hash1 = crypto.createHash('md5').update("abcd").digest("hex")
let users = [
  {userName: 'user0', password: hash0, token: ''},
  {userName: 'user1', password: hash1, token: ''}
]

// ————————————————————————————————
// Inicialitzar objecte de shadows.
let shadows = new shadowsObj()

// —————————————————————————————————————————————————
// Crear i configurar l'objecte de la base de dades.
var db = new database()
db.init({
  host: "localhost",
  port: 3306,
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

  // ——————————————————————————
  // Simulate delay (1 second).
  await new Promise(resolve => setTimeout(resolve, 1000));

  // —————————————————————
  // Processar la petició.
  switch (objPost.callType) {
      case 'actionCheckUserByToken':  result = await actionCheckUserByToken(objPost); break
      case 'actionLogout':            result = await actionLogout(objPost); break
      case 'actionLogin':             result = await actionLogin(objPost); break
      case 'actionSignUp':            result = await actionSignUp(objPost); break
      default:
          result = {result: 'KO', message: 'Invalid callType'}
          break;
  }

  // —————————————————————
  // Retornar el resultat.
  res.send(result)
}

async function actionCheckUserByToken (objPost) {
  let tokenValue = objPost.token
  
  // ———————————————————————————————————————————————————————
  // Si troba el token a les dades, retorna el nom d'usuari.
  let user = users.find(u => u.token == tokenValue)
  if (!user) {
      return {result: 'KO'}
  } else {
      return {result: 'OK', userName: user.userName}
  }
}

async function actionLogout (objPost) {
  let tokenValue = objPost.token
  
  // ———————————————————————————————————————————————————————
  // Si troba el token a les dades, retorna el nom d'usuari.
  let user = users.find(u => u.token == tokenValue)
  if (!user) {
      return {result: 'OK'}
  } else {
      return {result: 'OK'}
  }
}

async function actionLogin (objPost) {
  let userName = objPost.userName
  let userPassword = objPost.userPassword
  let hash = crypto.createHash('md5').update(userPassword).digest("hex")

  // ———————————————————————————
  // Buscar l'usuari a les dades.
  let user = users.find(u => u.userName == userName && u.password == hash)
  if (!user) {
      return {result: 'KO'}
  } else {
    let token = uuidv4()
    user.token = token
    return {result: 'OK', userName: user.userName, token: token}
  }
}

async function actionSignUp (objPost) {
  let userName = objPost.userName
  let userPassword = objPost.userPassword
  let hash = crypto.createHash('md5').update(userPassword).digest("hex")
  let token = uuidv4()
  let user = {userName: userName, password: hash, token: token}
  users.push(user)
  return {result: 'OK', userName: user.userName, token: token}
}

// AÑADIR FILA.
// Asegúrate de que esta ruta esté en tu archivo app.js
app.post('/submitForm', submitForm);
async function submitForm(req, res) {
  let formData = req.body;
  let query = `INSERT INTO user (ID, name, mail, pwdHash, token) VALUES (?, ?, ?, ?, ?)`;
  let values = [formData.ID, formData.name, formData.mail, formData.pwdHash, formData.token];

  try {
    await db.query(query, values);
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

  let query = `DELETE FROM user WHERE ID = ?`;

  try {
    await db.query(query, [deleteID]);
    res.send({ result: 'OK', message: 'Se ha eliminado la fila correctamente.' });
  } catch (error) {
    console.error('Error al eliminar la fila de la base de datos:', error);
    res.send({ result: 'KO', message: 'Error al eliminar la fila de la base de datos.' });
  }
}

// EDITAR FILA.
app.post('/editUser', editRow);
async function editRow(req, res) {
  let editID = req.body.ID;
  let editName = req.body.name;
  let editMail = req.body.mail;
  let editPwdHash = req.body.pwdHash;
  let editToken = req.body.token;

  let query = `UPDATE user SET name=?, mail=?, pwdHash=?, token=? WHERE ID = ?`;

  try {
    await db.query(query, [editName, editMail, editPwdHash, editToken, editID]);
    res.send({ result: 'OK', message: 'Se ha editado la fila correctamente.' });
  } catch (error) {
    console.error('Error al editar la fila en la base de datos:', error);
    res.send({ result: 'KO', message: 'Error al editar la fila en la base de datos.' });
  }
}

