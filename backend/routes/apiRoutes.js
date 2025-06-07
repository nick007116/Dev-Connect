const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

module.exports = router;