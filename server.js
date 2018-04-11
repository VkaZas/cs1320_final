const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const colors = require('colors');
const babel = require('@babel/core');

const index = require('./routes/index');

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', index);

// 404
app.use((req, res) => {
    res.status = 404;
    res.json('error');
});


app.listen(8080);
console.log('Server is listening to port 8080.'.green);