import fs from "fs";

const products = JSON.parse(fs.readFileSync("./data/products.json", "utf8"));
console.log(`Total products: ${products.length}`);
products.forEach((p, index) => {
  console.log(`\nProduct #${index + 1}:`);
  console.log(`- ID: ${p.id}`);
  console.log(`- Name: "${p.name}"`);
  console.log(`- Category: "${p.category}"`);
  console.log(`- Price: ${p.price} (${typeof p.price})`);
  console.log(`- OriginalPrice: ${p.originalPrice}`);
  console.log(`- inStock: ${p.inStock}`);
  console.log(`- Images count: ${p.images ? p.images.length : 0}`);
  if (p.images && p.images.length > 0) {
    console.log(`  - First Image preview: ${p.images[0].substring(0, 60)}...`);
  }
  console.log(`- Sizes:`, p.sizes);
  console.log(`- CreatedAt: ${p.createdAt}`);
});
