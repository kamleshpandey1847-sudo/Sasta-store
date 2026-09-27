import { getCollectionDocs } from "./src/firebase_client.js";

async function main() {
  try {
    console.log("Fetching products from Firestore...");
    const docs = await getCollectionDocs("products");
    console.log(`Found ${docs.length} products in Firestore:`);
    docs.forEach((d) => {
      console.log(`- ID: ${d.id}, Name: "${d.name}", Category: "${d.category}", inStock: ${d.inStock}`);
    });
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

main();
