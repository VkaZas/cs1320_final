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
var connEvents = anyDB.createConnection('sqlite3://events.db');
var connTimeSlots = anyDB.createConnection('sqlite3://time_slots.db');

var events = "CREATE TABLE events ( \
  id INTEGER PRIMARY KEY AUTOINCREMENT, \
  name TEXT, \
  creator_email, TEXT\
  start_date, DATE \
  end_date, DATE \
  start_time, TIME \
  end_time, TIME \
  attendents, TEXT \
  locations TEXT, \
  location_votes TEXT \
)";
connEvents.query(events, function(err, data) {});

var timeSlots = "CREATE TABLE time_slots (\
  event_id TEXT, FOREIGN KEY REFERENCES events(id) \
  name, TEXT \
  date, DATE \
  time_start, INT \
  time_end, INT \
)";
connTimeSlots.query(timeSlots, function(err, data) {});

// Routes
app.use('/', index);

app.get('/event/create', function(request, response) {
	response.render('create');
});

app.post('/event/createEvent', function(request, response) {
  var event_name = request.params.event_name;
  var creator_email = request.params.creator_email;
  var start_date = request.params.start_date;
  var end_date = request.params.end_date;
  var locations = request.params.locations;
  var createNewEvent = "INSERT INTO events (event_name, creator_email, start_date, end_date, locations) VALUES($1,$2,$3,$4,$5)";
  conn.query(createNewEvent,[name,creator_email,start_date,end_date,locations],function(err,data) {
    if (err) {
      //do something about err here
    } else {
      //create link to emit to client side 
    }
  });
});

app.get('/attend/:id', function(request, response) {
	response.render('create');
});

app.post('/attend/:id', function(request, resposne) {
  //need to flesh this out some more
});

app.post("/attend/:id/updatetimeslot", function(request, resposne) {
  //will also need to flesh this out some more
})

// 404
app.use((req, res) => {
    res.status = 404;
    res.json('error');
});

app.listen(8080);
console.log('Server is listening to port 8080.'.green);