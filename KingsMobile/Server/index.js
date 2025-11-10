const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const repairRoutes = require('./routes/repairRoutes');
const salesRoutes = require('./routes/salesRoutes');
const masterDataRoutes = require('./routes/masterDataRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/master-data', masterDataRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kings Mobile Management System API is running...',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Kings Mobile API Server is running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}`);
  console.log(`👤 User API: http://localhost:${PORT}/api/users`);
  console.log(`📦 Inventory API: http://localhost:${PORT}/api/inventory`);
  console.log(`🔧 Repair API: http://localhost:${PORT}/api/repairs`);
  console.log(`💰 Sales/POS API: http://localhost:${PORT}/api/sales`);
  console.log(`🗂️ Master Data API: http://localhost:${PORT}/api/master-data`);
});
