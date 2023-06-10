require('dotenv').config({ path: __dirname + '/projectVariables.env' })
const express = require("express");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const port = process.env.WEB_LISTEN_PORT || 1093;
const login = require("./public/js/harrisonsLogin.js");
const bodyParser = require('body-parser')
const { Pool } = require('pg');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt');
app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Create a connection to the database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

app.use(cookieParser());
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => console.log("Servers has started on port: " + process.env.WEB_LISTEN_PORT));
const fs = require('fs');
// Load self-signed certificate
const ca = fs.readFileSync('server.crt');

// auto email confirmation
var nodemailer = require('nodemailer');
const { start } = require('repl');
var senderEmail = process.env.EMAIL_ADD;
var senderPass = process.env.EMAIL_PASS;
var receiverEmail = process.env.TEST_EMAIL;

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true, //ssl
  auth: {
      user:senderEmail,
      pass:senderPass
  }
});

// setup email data
var mailSuccessOptions = {
  from: senderEmail,
  to: receiverEmail,
  subject: "Holiday booking confirmed!",
  text: "Your holiday has been successfully booked, enjoy your holiday! Please do not reply to this automated email.",
  ca: ca
}
var mailFailOptions = {
    from: senderEmail,
    to: receiverEmail,
    subject: "Holiday booking failed",
    text:"Your holiday booking could not be processed due to a booking clash with another employee. Please do not reply to this automated email.",
    ca: ca
}

// send email on failure of booking
function holidayFailEmail(start, end, reason){
  mailFailOptions.text = "Your holiday booking for " + start + " until "+ end + " could not be processed due to "+ reason +". Please do not reply to this automated email.";
  console.log("mailFailOptions");
  transporter.sendMail(mailFailOptions, function(error, info){
    if (error) {
      console.log("Holiday fail email error:" + error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
} 
// send email on success of booking
function holidaySuccessEmail(start , end){
  mailSuccessOptions.text = "Your holiday booking for " + start + " until "+ end + " has been successfully booked, enjoy your holiday! Please do not reply to this automated email.";
  console.log("mailSuccessOptions");
  transporter.sendMail(mailSuccessOptions, function(error, info){
    if (error) {
      console.log("Holiday success email error:" + error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}





// Check if the user is logged in before allowing access to the page.
function checkAuth(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect("/login");
  }
}


passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      console.log("username: " + username);
      console.log("password: " + password);

      const user = await User.findOne({ username: username });
      console.log("LocalStrategy called");
      console.log("user: " + user);
      
      if (!user) {
        return done(null, false); // If no user was found, call `done` with `false`
      }
      if (!user.verifyPassword(password)) {
        return done(null, false); // If the password is wrong, call `done` with `false`
      }
      return done(null, user); // If everything's okay, call `done` with the authenticated user
    } catch (err) {
      return done(err); // If there's an error, pass it to `done`
    }
  }
));


async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}






app.get("/", (req, res) => {
  res.status(200).send(__dirname + "/public/home.html");
});

app.get("/home.html", checkAuth, (req, res) => {
  res.status(200).send(__dirname + "/home.html");
});





// NOTICES API
// Define a route to handle GET requests to retrieve the notices
app.get('/notices', async (req, res) => {
  console.log ('GET /notices called');
  try {

    // Query the database to retrieve all notices from the noticeboard table
    const result = await pool.query('SELECT * FROM notices');
    // Return the results as JSON
    res.json(result.rows);

  } catch (error) {
    console.error('Error retrieving notices:', error);
    res.status(500).json({ error: 'Error retrieving notices' });
  }
});
// Define a route to handle POST requests to add a new notice
app.post('/notices', async (req, res) => {
  console.log ('POST /notices called');
  try {
    console.log(req.body);
    // Extract the notice title and description from the request body
    const { title, description } = req.body;

    // Insert the notice into the noticeboard table
    await pool.query('INSERT INTO notices (title, description) VALUES ($1, $2)', [title, description]);

    // Return a success message
    res.json({ message: 'Notice added successfully' });

  } catch (error) {
    console.error('Error adding notice:', error);
    res.status(500).json({ error: 'Error adding notice' });
  }
});





// remove user API
app.post("/removeuser", async (req, res) => {
  // delete user from the database
  // end any sessions for that user
  // send email to user to confirm deletion
  // send email to admin to confirm deletion
  console.log("removeUser called");
  try {
    const { username } = req.body;
    console.log(username);
    // First, check if a row with the given username exists in the database
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // If it exists, proceed with the deletion
    await pool.query('DELETE FROM users WHERE username = $1', [username]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});










// LOG IN AND SIGN UP API
//send login page
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});


app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
   
    if (err) {
      // Handle any errors that occur during authentication
      return next(err);
    }

    if (!user) {
      console.log("user not found");
      // Authentication failed, send a JSON response with an error message
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Authentication succeeded, redirect to the home page
    return res.redirect('/home.html');
  })(req, res, next);
});












app.post("/signup", async (req, res) => {
  try{
    const { 
      username, 
      password,
      firstname,
      lastname,
      email,
      tel,
      house,
      postcode,
      department,
      role,
      workingdays,
      status
    } = req.body;

    tempUser = new User(null, username, hashPassword(password), role);
    saved = await tempUser.save();
    if(saved){
      await pool.query('INSERT INTO employees (username, password, firstname, lastname, email, tel, house, postcode, department, role, workingdays, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [username, password, firstname, lastname, email, tel, house, postcode, department, role, workingdays, status]);
      res.json({ message: 'User registered successfully' });
    }
    else{
      res.json({ message: 'User registration failed' });
    }
  }
  catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});





app.post("/deleteholiday", async (req, res) => {
  console.log(req.body);

  // Validate that the request body contains 'holidayID'
  if (!req.body.holidayID) {
    res.status(400).json({ error: 'Missing holidayID in request body' });
    return;
  }

  const { holidayID } = req.body;

  try{
    // First, check if a row with the given holidayID exists in the database
    const result = await pool.query('SELECT * FROM holidays WHERE holidayid = $1', [holidayID]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Holiday not found' });
      return;
    }
    
    // If it exists, proceed with the deletion
    await pool.query('DELETE FROM holidays WHERE holidayid = $1', [holidayID]);
    res.json({ message: 'Holiday deleted successfully' });
  }
  catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: 'Error deleting holiday' });
  }
});


app.post("/bookholiday", async (req, res) => {
  let { startDate, endDate, employeeId, comment } = req.body;
  startDate = new Date(startDate).toLocaleDateString('en-GB');
  endDate = new Date(endDate).toLocaleDateString('en-GB');
  console.log(req.body);
  if (req.body.stat == "success"){
    try{
      await pool.query('INSERT INTO holidays (start_date, end_date, employee_id, comment) VALUES ($1, $2, $3, $4)', [startDate, endDate, employeeId, comment]);
      console.log("success, you booked the holiday.")
      holidaySuccessEmail(startDate, endDate);
      res.json({ message: 'Holiday booked' });
    }
    catch (error) {
      holidayFailEmail(startDate, endDate, "an error occured on the server, please try again later");
      console.error('Error booking holiday:', error);
      res.status(500).json({ error: 'Error booking holiday' });
    }
  }
  else if (req.body.stat == "fail"){
    holidayFailEmail(startDate, endDate, "booking clash");
    console.log("failed to book the holiday.")
  }
  else{
    console.log("Something else went wrong.")
  }
});


app.get("/getholidays", async (req, res) => {
  try{
    const result = await pool.query('SELECT * FROM holidays');
    
    // If there are no holidays in the database, send a meaningful message
    if (result.rowCount === 0) {
      res.json({ message: 'No holidays found' });
      return;
    }
    
    console.log(result.rows);
    res.json(result.rows);
  }
  catch (error) {
    console.error('Error getting holidays:', error);
    res.status(500).json({ error: 'Error getting holidays' });
  }
});

