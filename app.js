const express = require('express')
const app = express()
const port = 3000

// Configurar direcció ‘/’ 
app.get('/', getHello)
async function getHello (req, res) {
res.send(`Hello World`)
}

// Activar el servidor
const httpServer = app.listen(port, appListen)
function appListen () {
console.log(`Example app listening on: http://localhost:${port}`)
}

// Aturar el servidor correctament
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
function shutDown() {
console.log('Received kill signal, shutting down gracefully');
httpServer.close()
process.exit(0);
}
