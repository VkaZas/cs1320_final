const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const colors = require('colors');
const babel = require('@babel/core');
const index = require('./routes/index'); 
const uuidv4 = require('uuid/v4');
var buildUrl = require('build-url');
var nodemailer = require('nodemailer');

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
  id TEXT PRIMARY KEY, \
  name TEXT, \
  creator_email, TEXT\
  start_date, DATE \
  end_date, DATE \
  start_time_list, TEXT \
  end_time_list, TEXT \
  attendents, TEXT \
  locations TEXT, \
  location_votes TEXT \
)";
connEvents.query(events, function(err, data) {});

var timeSlots = "CREATE TABLE time_slots (\
  event_id TEXT, FOREIGN KEY REFERENCES events(id) \
  name, TEXT \
  date, DATE \
  slotScore, TEXT \
)";
connTimeSlots.query(timeSlots, function(err, data) {});

//Email setup
var transporter = nodemailer.createTransport({
  service:' gmail',
  auth: {
    user: 'meetng132@gmail.com',
    pass: 'meetng1322018'
  }
});

// Routes
app.use('/', index);

app.get('/event/create', function(request, response) {
	response.render('create');
});

app.post('/event/createEvent', function(request, response) {
  var id = uuidv4()
  var event_name = request.params.event_name;
  var creator_email = request.params.creator_email;
  var start_date = request.params.start_date;
  var end_date = request.params.end_date;
  var locations = request.params.locations;
  var createNewEvent = "INSERT INTO events (id, event_name, creator_email, start_date, end_date, locations) VALUES($1,$2,$3,$4,$5)";
  conn.query(createNewEvent,[id,name,creator_email,start_date,end_date,locations],function(err,data) {
    if (err) {
      console.log(err);
      //maybe alert the user and redirect somewhere?
    } else {
      //create link to emit to email to the creator
      //how are we doing this - locally or serving this on aws or something like that? 
      var decision_url = buildUrl('http://localhost:8080', {
        path: 'event/' + id + '/decide'
      });
      //email content set up
      var mailoptions = {
        from: 'meetng132@gmail.com',
        to: creator_email,
        subject: 'Link to Decision Page for ' + event_name,
        text: 'Here\'s your link! ' + decision_url
      };
      //url we're sending to the creator so they can send it to attendees
      var attend_url = buildUrl('hhtp://localhost:8080', {
        path: 'attend/' + id
      });
      //send email to creator with link to 
      transporter.sendMail(mailoptions, function(err, data) {
        if (err) {
          console.log(err);
          io.sockets.in(id).emit('url', attend_url, decision_url);
        } else {
          io.sockets.in(id).emit('url', attend_url);
        }
      });
    }
  });
});

app.get('/attend/:id', function(request, response) {
  var id = request.params.id;
	response.render('create');
});

app.post('/attend/:id', function(request, resposne) {
  
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