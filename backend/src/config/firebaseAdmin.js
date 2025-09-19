const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const path = require("path");

let db;

try {
  // Load key JSON
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  const serviceAccount = JSON.parse(
    readFileSync(serviceAccountPath, "utf8")
  );

  // Khởi tạo Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://classroom-app-3ee5e-default-rtdb.firebaseio.com",
  });

  db = admin.firestore();
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
  db = null;
}

module.exports = { admin, db };
