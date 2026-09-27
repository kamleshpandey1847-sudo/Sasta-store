import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, writeBatch, getDoc } from "firebase/firestore";
import fs from "fs";

let db: any = null;

export function getDb() {
  if (db) return db;
  
  const configPath = "./firebase-applet-config.json";
  if (!fs.existsSync(configPath)) {
    console.warn("No firebase-applet-config.json found.");
    return null;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const app = getApps().length === 0 ? initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
      measurementId: config.measurementId
    }) : getApp();

    const databaseId = config.firestoreDatabaseId || "(default)";
    db = getFirestore(app, databaseId);
    console.log(`Firebase Client SDK initialized with database ID: ${databaseId}`);
  } catch (error) {
    console.error("Failed to initialize Firebase Client SDK:", error);
  }
  return db;
}

export async function getCollectionDocs(collectionName: string): Promise<any[]> {
  const firestoreDb = getDb();
  if (!firestoreDb) return [];
  try {
    const colRef = collection(firestoreDb, collectionName);
    const snap = await getDocs(colRef);
    const docs: any[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data) {
        if (!data.id) {
          data.id = d.id;
        }
        docs.push(data);
      }
    });
    return docs;
  } catch (err) {
    console.error(`Error getting docs for ${collectionName}:`, err);
    throw err;
  }
}

export async function setDocument(collectionName: string, docId: string, data: any): Promise<void> {
  const firestoreDb = getDb();
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    await setDoc(docRef, data);
  } catch (err) {
    console.error(`Error setting doc ${docId} in ${collectionName}:`, err);
    throw err;
  }
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  const firestoreDb = getDb();
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Error deleting doc ${docId} in ${collectionName}:`, err);
    throw err;
  }
}

export async function batchSetDocuments(collectionName: string, items: { id: string, data: any }[]): Promise<void> {
  const firestoreDb = getDb();
  if (!firestoreDb || items.length === 0) return;
  try {
    const batch = writeBatch(firestoreDb);
    items.forEach((item) => {
      const docRef = doc(firestoreDb, collectionName, item.id);
      batch.set(docRef, item.data);
    });
    await batch.commit();
  } catch (err) {
    console.error(`Error batch setting docs for ${collectionName}:`, err);
    throw err;
  }
}

export async function getDocument(collectionName: string, docId: string): Promise<any | null> {
  const firestoreDb = getDb();
  if (!firestoreDb) return null;
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.error(`Error getting doc ${docId} in ${collectionName}:`, err);
    return null;
  }
}
