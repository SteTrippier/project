require('dotenv').config({ path: __dirname + '/projectVariables.env' })
const express = require("express");
const app = express();
const port = process.env.WEB_LISTEN_PORT || 1093;
const login = require("./public/js/harrisonsLogin.js");
const bodyParser = require('body-parser')
const { Pool } = require('pg');
const session = require("express-session");
const cookieParser = require("cookie-parser");
var users = [];
const tls = require('tls');
// Create a custom TLS configuration to trust self-signed certificates
const tlsConfig = {
  rejectUnauthorized: false // Set to false to trust self-signed certificates
};
// Set the NODE_TLS_REJECT_UNAUTHORIZED environment variable to "0"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Create a connection pool to the PostgreSQL database
// Todo repace hardcode values with environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

app.set('views', __dirname + '/views');
app.use(cookieParser());
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// auto email confirmation
var nodemailer = require('nodemailer');
var senderEmail = process.env.EMAIL_ADD;
var senderPass = process.env.EMAIL_PASS;
var receiverEmail = process.env.TEST_EMAIL;

var emailTitle ={
    success: "Holiday booking confirmed!",
    fail: "Holiday booking failed"
};
var emailBody = {
    success: "Your holiday has been successfully booked for startDate until endDate",
    fail: "Your holiday booking for startDate until endDate could not be processed due to reason"
}

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: senderEmail,
    pass: senderPass
  },
  tls: tlsConfig
});

var mailSuccessOptions = {
  from: senderEmail,
  to: receiverEmail,
  subject: emailTitle.success,
  text: emailBody.success
}

var mailFailOptions = {
    from: senderEmail,
    to: receiverEmail,
    subject: emailTitle.fail,
    text: emailBody.fail
}

function holidayFailEmail(){
  console.log("holidayFailEmail");
  transporter.sendMail(mailFailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
} 


app.listen(port, () => console.log("Servers has started on port: " + process.env.WEB_LISTEN_PORT));

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




//Holiday requests
app.post("/deleteholiday", async (req, res) => {
  console.log(req.body);
  try{
    const { holidayID } = req.body;
    await pool.query('DELETE FROM holidays WHERE holidayid = $1', [holidayID]);
    res.json({ message: 'Holiday deleted successfully' });
  }
  catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: 'Error deleting holiday' });
  }
});

app.post("/bookholiday", async (req, res) => {
  
  console.log(req.body);
  if (req.body.stat == "success"){
    try{
      const { startDate, endDate, employeeId, comment } = req.body;
      await pool.query('INSERT INTO holidays (start_date, end_date, employee_id, comment) VALUES ($1, $2, $3, $4)', [startDate, endDate, employeeId, comment]);
      console.log("success, you booked the holiday.")
      holidaySuccessEmail();
      res.json({ message: 'Holiday booked' });
    }
    catch (error) {
      holidayFailEmail();
      console.error('Error booking holiday:', error);
      res.status(500).json({ error: 'Error booking holiday' });
    }
  }
  else if (req.body.stat == "fail"){
    console.log("failed to book the holiday.")
    holidayFailEmail();
  }
  else{
    console.log("Something else went wrong.")
  }
});

function holidaySuccessEmail(){
    console.log("holidaySuccessEmail");
    transporter.sendMail(mailSuccessOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}


app.get("/getholidays", async (req, res) => {

  
  try{
    const result = await pool.query('SELECT * FROM holidays');
    console.log(result.rows);
    res.json(result.rows);
  }
  catch (error) {
    console.error('Error getting holidays:', error);
    res.status(500).json({ error: 'Error getting holidays' });
  }
});

