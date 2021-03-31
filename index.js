const http = require('http');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const express = require('express');
const packageJson = require('./package.json');
const app = express();
const BlogSystem = require('./src/entities/blogSystem/core');
const blogSystem = new BlogSystem();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './src/templates'))
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(helmet()); // Sending various http headers
app.use('/public', express.static('./src/public'));
dotenv.config();

//Routing Web
require('./src/routes/routes')(app);

const port = process.env.PORT || 8080;
let server = http.createServer(app);

console.log();
console.log(`Package Name: ${packageJson.name} v${packageJson.version}`);
console.log(`App mode: ${app.get('env')}`);
console.log('');
// Run server
server.listen(port, () => console.log(`Server corriendo en el puerto ${port}...`));