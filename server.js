const express = require("express");
const app = express();
const port = 1093;
const login = require("./public/js/harrisonsLogin.js");
const bodyParser = require('body-parser')
const { Pool } = require('pg');
const session = require("express-session");
const cookieParser = require("cookie-parser");
var users = [];


// Create a connection pool to the PostgreSQL database
// Todo repace hardcode values with environment variables
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Stein21244!',
  port: 5432,
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




app.listen(port, () => console.log("Servers has started on port: " + port));

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


// Define a route to handle GET requests to retrieve the notices
app.get('/notices', async (req, res) => {
  console.log ('GET /notices called');
  try {

    // Query the database to retrieve all notices from the noticeboard table
    const result = await pool.query('SELECT * FROM notices ORDER BY id DESC');
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

app.post("/bookholiday", async (req, res) => {
  console.log(req.body);
  try{
    const { startDate, endDate, employeeId } = req.body;
    await pool.query('INSERT INTO holidays (startdate, enddate, employeeid) VALUES ($1, $2, $3)', [startDate, endDate, employeeId]);
    res.json({ message: 'Holiday booked successfully' });
  }
  catch (error) {
    console.error('Error booking holiday:', error);
    res.status(500).json({ error: 'Error booking holiday' });
  }
});

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

app.post("/register", async (req, res) => {
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
      workingdays,
      status
    } = req.body;
    await pool.query('INSERT INTO employees (username, password, firstname, lastname, email, tel, house, postcode, department, workingdays, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [username, password, firstname, lastname, email, tel, house, postcode, department, workingdays, status]);
    res.json({ message: 'User registered successfully' });
  }
  catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

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
}
);
