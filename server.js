require('dotenv').config({ path: __dirname + '/projectVariables.env' })
const express = require("express");
const app = express();
const port = process.env.WEB_LISTEN_PORT || 1093;
const login = require("./public/js/harrisonsLogin.js");
const bodyParser = require('body-parser')
const { Pool } = require('pg');
const session = require("express-session");
const cookieParser = require("cookie-parser");

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

app.get("/", (req, res) => {
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





// LOG IN AND SIGN UP API
//send login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  try{
    const { username, password } = req.body;
    await pool.query('SELECT * FROM employees WHERE username = $1 AND password = $2', [username, password]);
    res.json({ message: 'Login successful' });
  }
  catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.post("/signup", async (req, res) => {
  console.log(req.body);
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
    await pool.query('INSERT INTO employees (username, password, firstname, lastname, email, tel, house, postcode, department, role, workingdays, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [username, password, firstname, lastname, email, tel, house, postcode, department, role, workingdays, status]);
    res.json({ message: 'User registered successfully' });
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

