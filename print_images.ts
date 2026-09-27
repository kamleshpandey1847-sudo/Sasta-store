import fs from "fs";

const products = JSON.parse(fs.readFileSync("./data/products.json", "utf8"));
const targetIds = ["prod-1782994959209", "prod-1782995240628", "prod-1782995486080"];

console.log("Details of the 3 target products:");
products.forEach((p) => {
  if (targetIds.includes(p.id)) {
    console.log(`\nID: ${p.id}`);
    console.log(`Name: "${p.name}"`);
    console.log(`Category: "${p.category}"`);
    console.log(`InStock: ${p.inStock}`);
    console.log("Images:", p.images);
  }
});
