import React, { useState, useEffect } from 'react';
import { app } from './firebase';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const FirebaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      const db = getFirestore(app);
      
      // Test Firestore connection by reading from a test collection
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      
      if (snapshot.empty) {
        // If no documents exist, create a test document
        const docRef = await addDoc(testCollection, {
          message: 'Frontend Firebase test',
          timestamp: new Date().toISOString(),
          source: 'frontend'
        });
        
        setConnectionStatus('✅ Connected (Test document created)');
        setTestData({ id: docRef.id, message: 'Test document created' });
      } else {
        // If documents exist, show the first one
        const firstDoc = snapshot.docs[0];
        setConnectionStatus('✅ Connected');
        setTestData({ 
          id: firstDoc.id, 
          ...firstDoc.data() 
        });
      }
    } catch (err) {
      setConnectionStatus('❌ Connection Failed');
      setError(err.message);
      console.error('Firebase connection error:', err);
    }
  };

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.1)', 
      padding: '2rem', 
      borderRadius: '15px', 
      margin: '2rem 0',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <h3>🔥 Firebase Connection Test</h3>
      <p><strong>Status:</strong> {connectionStatus}</p>
      
      {testData && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Test Data:</h4>
          <pre style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '1rem', 
            borderRadius: '8px',
            fontSize: '0.9rem',
            overflow: 'auto'
          }}>
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div style={{ marginTop: '1rem', color: '#ff6b6b' }}>
          <h4>Error:</h4>
          <p>{error}</p>
        </div>
      )}
      
      <button 
        onClick={testFirebaseConnection}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Test Again
      </button>
    </div>
  );
};

export default FirebaseTest;
