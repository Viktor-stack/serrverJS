const http = require('http');
const app = require('./app');
const config = require('./config/default');

const port = config.HOSTNAME;

const server = http.createServer(app);

server.listen(config.PORT,config.HOSTNAME, () =>{
    console.log(`${config.HOSTNAME}:${port}`)
});