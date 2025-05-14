require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const { db } = require('./config/firebase');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');

app.use(express.json());

// Define routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/wallets', walletRoutes);

// Define a simple route for the root path
app.get('/', (req, res) => {
  res.send('Welcome to the Banking App Backend!');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
