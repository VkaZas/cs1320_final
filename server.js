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

//Database
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://events.db');

var events = "CREATE TABLE events ( \
  id INTEGER PRIMARY KEY, \
  time INTEGER, \
  location TEXT, \
  emails TEXT \
)";
//should make emails a separate table? 

// Routes
app.use('/', index);

app.get('/createEvent', function(request, response) {
	response.render('create');
});

app.get('/event/:id', function(request, response) {
	response.render('create');
});

// 404
app.use((req, res) => {
    res.status = 404;
    res.json('error');
});

//HELPER FUNCTIONS
function generateEventId() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    var result = '';
    for (var i = 0; i < 6; i++)
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    if (rooms.includes(result)) {
      return "try again";
    } else {
      rooms.push(result);
      return result;
    }   
}


app.listen(8080);
console.log('Server is listening to port 8080.'.green);