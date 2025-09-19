// Test Firebase connection
const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');

// Test Firebase connection
router.get('/firebase-test', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ 
        success: false, 
        message: 'Firebase Admin not initialized. Check service account key.',
        error: 'Database connection is null'
      });
    }

    // Test Firestore connection
    const testDoc = await db.collection('test').doc('connection').get();
    
    if (testDoc.exists) {
      res.json({ 
        success: true, 
        message: 'Firebase connection successful!',
        data: testDoc.data()
      });
    } else {
      // Create a test document
      await db.collection('test').doc('connection').set({
        message: 'Firebase connection test',
        timestamp: new Date().toISOString(),
        status: 'connected'
      });
      
      res.json({ 
        success: true, 
        message: 'Firebase connection successful! Test document created.',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Firebase connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Firebase connection failed',
      error: error.message 
    });
  }
});

module.exports = router;
