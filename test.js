// test.js

const User = require('./models/user');

async function test() {
  const username = 'testUsername';
  const password = 'testPassword'; // Replace with the correct password

  // Test findOne method
  const user = await User.findOne(username);
  if (user) {
    console.log(`Found user with username: ${user.username}`);
  } else {
    console.log(`No user found with username: ${username}`);
  }

  // Test verifyPassword method
  if (user) {
    const isMatch = await user.verifyPassword(password);
    if (isMatch) {
      console.log(`Password is correct for user: ${user.username}`);
    } else {
      console.log(`Password is incorrect for user: ${user.username}`);
    }
  }
}

test();
