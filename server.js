require("dotenv").config({ path: __dirname + "/projectVariables.env" });
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const port = process.env.WEB_LISTEN_PORT || 1093;
const login = require("./public/js/harrisonsLogin.js");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const cookieParser = require("cookie-parser");
const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");

// Create a connection to the database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

app.use(cookieParser());

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () =>
  console.log("Servers has started on port: " + process.env.WEB_LISTEN_PORT)
);
const fs = require("fs");
// Load self-signed certificate
const ca = fs.readFileSync("server.crt");

// auto email confirmation
var nodemailer = require("nodemailer");
const { start } = require("repl");
var senderEmail = process.env.EMAIL_ADD;
var senderPass = process.env.EMAIL_PASS;
var receiverEmail = process.env.TEST_EMAIL;

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true, //ssl
  auth: {
    user: senderEmail,
    pass: senderPass,
  },
});

// setup email data
var mailSuccessOptions = {
  from: senderEmail,
  to: receiverEmail,
  subject: "Holiday booking confirmed!",
  text: "Your holiday has been successfully booked, enjoy your holiday! Please do not reply to this automated email.",
  ca: ca,
};
var mailFailOptions = {
  from: senderEmail,
  to: receiverEmail,
  subject: "Holiday booking failed",
  text: "Your holiday booking could not be processed due to a booking clash with another employee. Please do not reply to this automated email.",
  ca: ca,
};

// send email on failure of booking
function holidayFailEmail(start, end, reason) {
  mailFailOptions.text =
    "Your holiday booking for " +
    start +
    " until " +
    end +
    " could not be processed due to " +
    reason +
    ". Please do not reply to this automated email.";
  console.log("mailFailOptions");
  transporter.sendMail(mailFailOptions, function (error, info) {
    if (error) {
      console.log("Holiday fail email error:" + error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
// send email on success of booking
function holidaySuccessEmail(start, end) {
  mailSuccessOptions.text =
    "Your holiday booking for " +
    start +
    " until " +
    end +
    " has been successfully booked, enjoy your holiday! Please do not reply to this automated email.";
  console.log("mailSuccessOptions");
  transporter.sendMail(mailSuccessOptions, function (error, info) {
    if (error) {
      console.log("Holiday success email error:" + error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// Check if the user is logged in before allowing access to the page.
function checkAuth(req, res, next) {
  console.log("checkAuth called");
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Check if the user is logged in as a manager before allowing access to the page.
function checkManager(req, res, next) {
  console.log("checkManager called");
  if (req.session.loggedin && req.session.role == "manager") {
    next();
  } else {
    console.log(
      "checkManager failed, unauthorised user: ",
      req.session.loggedin,
      req.session.role
    );
    res.status(403).json({
      error: "Unauthorized",
    });
  }
}

app.post("/updateHolidayAllowance", checkManager, async (req, res) => {
  try {
    const { username, holidayAllowance } = req.body;
    await pool.query(
      "UPDATE employees SET annual_leave_remaining = $1 WHERE username = $2",
      [holidayAllowance, username]
    );
    res.json({ message: "Holiday allowance updated successfully" });
    console.log(
      "username: " +
        username +
        " holidayAllowance: " +
        holidayAllowance +
        " updated successfully"
    );
  } catch (error) {
    console.error("Error updating holiday allowance:", error);
    res.status(500).json({ error: "Error updating holiday allowance" });
  }
});

//get a list of all employees first name and last name
app.get("/getAllEmployeesNameAndUsername", checkAuth, async (req, res) => {
  try {
    const query =
      "SELECT firstname, lastname, username, annual_leave_remaining from employees";
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error retrieving employees:", error);
    res.status(500).json({ error: "Error retrieving employees" });
  }
});

app.get("/getAllEmployees", checkAuth, async (req, res) => {
  try {
    const query = "SELECT * from employees";
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error retrieving employees:", error);
    res.status(500).json({ error: "Error retrieving employees" });
  }
});

passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      console.log(
        "LocalStrategy called with username: " +
          username +
          " and password: " +
          password +
          ""
      );
      // Find the user with the given username
      const user = await User.findOne(username);
      console.log(
        "passport.use localStrategy: " +
          user.id +
          " " +
          user.username +
          " " +
          user.password_hash +
          " " +
          user.role
      );
      // If no user was found, call `done` with `false`
      if (!user) {
        console.log("passport.use localStrategy: no user found");
        return done(null, false);
      }

      // Check if the password is correct
      const passMatch = await user.verifyPassword(password);
      // If the password is wrong, call `done` with `false`
      if (!passMatch) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      // If there's an error, pass it to `done`
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, { id: user.id, username: user.username, role: user.role });
});

passport.deserializeUser(async (user, done) => {
  // use the id from the serialized user to fetch the complete user object
  // from the database, if necessary
  const fullUser = await User.findById(user.id);
  done(null, fullUser);
});

app.get("/", checkAuth, (req, res) => {
  res.status(200).send(__dirname + "/public/home.html");
});

app.get("/home.html", checkAuth, (req, res) => {
  res.status(200).send(__dirname + "/home.html");
});

app.get("/users", checkAuth, async (req, res) => {
  try {
    const query = "SELECT id, username, role FROM users";
    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Error retrieving users" });
  }
});

// NOTICES API
// Define a route to handle GET requests to retrieve the notices
app.get("/notices", checkAuth, async (req, res) => {
  console.log("GET /notices called");
  try {
    // Query the database to retrieve all notices from the noticeboard table
    const result = await pool.query("SELECT * FROM notices");
    // Return the results as JSON
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving notices:", error);
    res.status(500).json({ error: "Error retrieving notices" });
  }
});
// Define a route to handle POST requests to add a new notice
app.post("/notices", checkManager, async (req, res) => {
  console.log("POST /notices called");
  try {
    console.log(req.body);
    // Extract the notice title and description from the request body
    const { title, description } = req.body;

    // Insert the notice into the noticeboard table
    await pool.query(
      "INSERT INTO notices (title, description) VALUES ($1, $2)",
      [title, description]
    );

    // Return a success message
    res.json({ message: "Notice added successfully" });
  } catch (error) {
    console.error("Error adding notice:", error);
    res.status(500).json({ error: "Error adding notice" });
  }
});

// remove user API
app.post("/removeuser", checkManager, async (req, res) => {
  // delete user from the database
  // end any sessions for that user
  // send email to user to confirm deletion
  // send email to admin to confirm deletion
  console.log("removeUser called");
  try {
    const { username } = req.body;
    console.log(username);
    // First, check if a row with the given username exists in the database
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rowCount === 0) {
      console.log("no user found");
      res.status(404).json({ error: "User not found" });
      return;
    } else {
      // If it exists, proceed with the deletion
      let deleted = await pool.query("DELETE FROM users WHERE username = $1", [
        username,
      ]);
      console.log("user deleted");
      res.json({ message: "User deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

// LOG IN AND SIGN UP API
//send login page
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log("login post api : user not found");
      // Authentication failed, send a JSON response with an error message
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // Success, log in the user
    req.logIn(user, function (err) {
      if (err) {
        console.log("error logging in");
        return next(err);
      }
      // Authentication succeeded, return a JSON response with the URL to redirect to
      return res.json({ redirect: "/home.html" });
    });
  })(req, res, next);
});

app.get("/api/user_role", checkAuth, (req, res) => {
  console.log("GET /api/user_role called");
  console.log(req.user);
  if (req.user === undefined) {
    // The user is not logged in
    res.json({});
  } else {
    res.json({
      role: req.user.role,
      // other details can be added here as necessary
    });
  }
});

app.get("/api/user", checkAuth, (req, res) => {
  console.log("GET /api/user called");
  console.log(req.user);
  if (req.user === undefined) {
    // The user is not logged in
    res.json({});
  } else {
    res.json({
      username: req.user.username,
      // other details can be added here as necessary
    });
  }
});

app.get("/api/employee_id", checkAuth, (req, res) => {
  console.log("GET /api/employee_id called");
  console.log(req.user);
  if (req.user === undefined) {
    // The user is not logged in
    res.json({});
  } else {
    res.json({
      employee_id: req.user.id,
      // other details can be added here as necessary
    });
  }
});

app.get("/api/workingDays", checkAuth, async (req, res) => {
  console.log("GET /api/workingDays called");
  console.log(req.user);
  if (req.user === undefined) {
    // The user is not logged in
    res.json({});
  } else {
    try {
      const result = await pool.query(
        "SELECT workingdays FROM employees WHERE username = $1",
        [req.user.username]
      );
      res.json({
        workingDays: result.rows[0].workingdays,
      });
    } catch (error) {
      console.error("Error retrieving working days:", error);
      res.status(500).json({ error: "Error retrieving working days" });
    }
  }
});

app.get("/api/remaining_holiday", checkAuth, async (req, res) => {
  console.log("GET /api/remaining_holiday called");
  console.log(req.user);
  if (req.user === undefined) {
    // The user is not logged in
    res.json({});
  } else {
    try {
      const result = await pool.query(
        "SELECT annual_leave_remaining FROM employees WHERE username = $1",
        [req.user.username]
      );
      res.json({
        remaining_holiday: result.rows[0].annual_leave_remaining,
      });
    } catch (error) {
      console.error("Error retrieving remaining holiday:", error);
      res.status(500).json({ error: "Error retrieving remaining holiday" });
    }
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log("An error occured when logging out" + err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
});

app.post("/signup", async (req, res) => {
  try {
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
      status,
    } = req.body;

    // Create a new User instance
    const tempUser = new User(null, username, password, role);

    // Set the password and save the User instance
    const savedPassword = await tempUser.setPassword(password);
    const saved = await tempUser.save();

    if (saved) {
      await pool.query(
        "INSERT INTO employees (username, firstname, lastname, email, tel, house, postcode, department, role, workingdays, status, annual_leave_remaining) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
        [
          username,
          firstname,
          lastname,
          email,
          tel,
          house,
          postcode,
          department,
          role,
          workingdays,
          status,
          0,
        ]
      );
      res.json({ message: "User registered successfully" });
    } else {
      res.json({ message: "User registration failed" });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    await pool.query("DELETE FROM users WHERE username = $1", [
      req.body.username,
    ]);
    res.status(500).json({ error: "Error registering user" });
  }
});

app.post("/deleteholiday", checkAuth, async (req, res) => {
  console.log(req.body);

  // Validate that the request body contains 'holidayID'
  if (!req.body.holidayID) {
    res.status(400).json({ error: "Missing holidayID in request body" });
    return;
  }

  const { holidayID } = req.body;

  try {
    // First, check if a row with the given holidayID exists in the database
    const result = await pool.query(
      "SELECT * FROM holidays WHERE holidayid = $1",
      [holidayID]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Holiday not found" });
      return;
    }

    // If it exists, proceed with the deletion
    await pool.query("DELETE FROM holidays WHERE holidayid = $1", [holidayID]);
    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    res.status(500).json({ error: "Error deleting holiday" });
  }
});

app.post("/bookholiday", checkAuth, async (req, res) => {
  let { startDate, endDate, employeeId, comment } = req.body;
  startDate = new Date(startDate).toLocaleDateString("en-GB");
  endDate = new Date(endDate).toLocaleDateString("en-GB");
  console.log(req.body);
  if (req.body.stat == "success") {
    try {
      await pool.query(
        "INSERT INTO holidays (start_date, end_date, employee_id, comment) VALUES ($1, $2, $3, $4)",
        [startDate, endDate, employeeId, comment]
      );
      console.log("success, you booked the holiday.");
      holidaySuccessEmail(startDate, endDate);
      res.json({ message: "Holiday booked" });
    } catch (error) {
      holidayFailEmail(
        startDate,
        endDate,
        "an error occured on the server, please try again later"
      );
      console.error("Error booking holiday:", error);
      res.status(500).json({ error: "Error booking holiday" });
    }
  } else if (req.body.stat == "fail") {
    holidayFailEmail(startDate, endDate, "booking clash");
    console.log("failed to book the holiday.");
  } else {
    console.log("Something else went wrong.");
  }
});

app.get("/getholidays", checkAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM holidays");

    // If there are no holidays in the database, send a meaningful message
    if (result.rowCount === 0) {
      res.json({ message: "No holidays found" });
      return;
    }

    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting holidays:", error);
    res.status(500).json({ error: "Error getting holidays" });
  }
});

/////////////////////PROCUREMENT API//////////////////////////
app.get("/procurement", checkAuth, (req, res) => {
  res.sendFile(__dirname + "/public/procurement.html");
});

// GET endpoint to retrieve all procurement requests
app.get("/api/procurements", async (req, res) => {
  try {
    const procurements = await pool.query(
      "SELECT * FROM Procurement ORDER BY Date DESC"
    );
    res.json(procurements);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST endpoint to add a new procurement request
app.post("/api/procurements", express.json(), async (req, res) => {
  try {
    const { Requestedby, Request } = req.body;
    await pool.query(
      "INSERT INTO Procurement (Requestedby, Request) VALUES ($1, $2)",
      [Requestedby, Request]
    );
    res.status(201).json({ message: "Procurement request added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT endpoint to update status of a procurement request
app.put("/api/procurements/:id", express.json(), async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (status !== "requested" && status !== "fulfilled") {
      res.status(400).json({ message: "Invalid status"  +  status});
      return;
    }
    await pool.query("UPDATE Procurement SET status = $1 WHERE Id = $2", [
      status,
      id,
    ]);
    res.json({ 
      message: "Procurement request updated successfully",
      status: "good"
   });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
