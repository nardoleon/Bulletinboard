//declare npm packages
const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      pug = require('pug'),
      Sequelize = require('sequelize');

// declaring that we are using express
var app = express(),
//connecting to 'bulletinboard' database, accessing 'process.env.POSTGRES_USER' from .bash_profile
    sequelize = new Sequelize('bulletinboard', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, { dialect: 'postgres' });

//requiring route, notices.js in 'routes' folder
var noticesRouter = require('./routes/notices');

//creates the table, 'notices'
//come back to 'Why does it add an s in the table name?'
var notice = sequelize.define('notice', {
    title: Sequelize.STRING,
    body: Sequelize.TEXT
});

app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }})
);

//use morgan middleware to print HTTP requests to help with debugging
app.use(morgan('dev'));

//In order to parse a text input from a user, we need bodyParser to convert the data to a JavaScript string
app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }})
);

//setting the view engine as pug - pug files render to html
app.set('view engine', 'pug');

//use noticesRouter variable
app.use('/notices', noticesRouter);

//get request to redirect the 'homepage' to the notices route

//1. go to route notices.js, go to the app.get('/') in the
//notices.js file
app.get('/', (request, response) => {
  response.redirect('/notices');
});

//get request to /board route
app.get('/board', (request, response) => {
  //Promise to findAll - native method in sequelize, findAll returns
  //everything in the notice table
  //'notices' is passed as a parameter
  notice.findAll().then((notices) => {
    //renders the board.pug file, in the notices folder
    //notices object is passed as a parameter, to be rendered in pug file
    response.render('notices/board', { notices: notices });
  });
});

//insert a new entry into the notices table
app.post('/notices', (request, response) => {
  console.log("*****************"); 
 
 console.log(request.body); 

  notice.create(request.body).then(() => {
    response.redirect('/board');
  });
});
//promise - connects to database with sequelize
sequelize.sync().then(() => {
  console.log('Connected to database');
  //creates a server
  app.listen(4000, () => {
    console.log('Web Server is running on port 4000');
  });
});
