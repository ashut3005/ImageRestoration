const bcrypt = require('bcrypt');
const User = require('../models/User');

// Register user
exports.register = async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.status(201).send('Registered successfully');
  } catch (err) {
    res.status(400).send('Error registering user');
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('Invalid credentials');

  res.send('Login successful');
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.send("Password updated successfully");
  } catch (err) {
    res.status(500).send("Server error");
  }
};
