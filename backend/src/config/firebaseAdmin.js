const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const path = require("path");

let db;

try {
  let serviceAccount;
  
  // Try to load from environment variables first
  if (process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
    };
  } else {
    // Fallback to service account key file
    const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  }

  // Khởi tạo Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL || "https://classroom-app-3ee5e-default-rtdb.firebaseio.com",
  });

  db = admin.firestore();
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
  db = null;
}

module.exports = { admin, db };
