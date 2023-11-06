const express = require('express')
const crypto = require('crypto')
const url = require('url')
const { v4: uuidv4 } = require('uuid')
const database = require('./utilsMySQL.js')
const shadowsObj = require('./utilsShadows.js')
const app = express()
const port = 3030

// Inicialitzar objecte de shadows
let shadows = new shadowsObj()

var db = new database()
db.init({
  host: "localhost",
  port: 8080,
  user: "root",
  password: "pwd",
  database: "users"
})

// Ejemplo hash
// let hash = crypto.createHash('md5').update('Hola').digest("hex")

app.get('/testDB', testDB)
async function testDB (req, res) {
let rst = await db.query('SELECT * FROM user LIMIT 10')
res.send(rst)
}

// Publicar arxius carpeta ‘public’ 
app.use(express.static('public'))

// Configurar per rebre dades POST en format JSON
app.use(express.json());

// Activar el servidor 
const httpServer = app.listen(port, appListen)
async function appListen () {
  await shadows.init('./public/index.html', './public/shadows')
  console.log(`Example app listening on: http://localhost:${port}`)
}

// Close connections when process is killed
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close()
  db.end()
  process.exit(0);
}

// Configurar la direcció '/index-dev.html' per retornar
// la pàgina que descarrega tots els shadows (desenvolupament)
app.get('/index-dev.html', getIndexDev)
async function getIndexDev (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(shadows.getIndexDev())
}

// Configurar la direcció '/shadows.js' per retornar
// tot el codi de les shadows en un sol arxiu
app.get('/shadows.js', getShadows)
async function getShadows (req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(shadows.getShadows())
}

// Configurar la direcció '/ajaxCall'
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

async function actionDeleteRow (objPost) {
  let userName = objPost.userName
  let deleteUser = 'delete from user where name="'+userName+'")'
  db.query(deleteUser)
  return {result: 'OK',userName: userName}
}