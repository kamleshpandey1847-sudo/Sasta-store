import { getCollectionDocs } from "./src/firebase_client";

async function run() {
  console.log("Fetching users from Firestore...");
  try {
    const firestoreUsers = await getCollectionDocs("users");
    console.log(`Found ${firestoreUsers.length} users in Firestore:`);
    firestoreUsers.forEach((u: any) => {
      console.log(`- Username: ${u.username}, Password: ${u.password}, Verified: ${u.verified}`);
    });
    process.exit(0);
  } catch (err) {
    console.error("Error fetching users:", err);
    process.exit(1);
  }
}

run();
