import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import {
  getDb,
  getCollectionDocs,
  setDocument,
  deleteDocument,
  batchSetDocuments,
  getDocument
} from "./src/firebase_client.js";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// ES Module path resolution helpers
const __filename = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : "";
const __dirname = __filename ? path.dirname(__filename) : "";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");
const WISHLISTS_FILE = path.join(DATA_DIR, "wishlists.json");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Default pre-populated products
const defaultProducts: any[] = [];

// Helper to read JSON safely
const readJSON = (filePath: string, defaultValue: any) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
};

// Helper to write JSON safely
const writeJSON = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
};

// Load initial data
let products = readJSON(PRODUCTS_FILE, defaultProducts);
let orders = readJSON(ORDERS_FILE, []);
let users = readJSON(USERS_FILE, {});
let reviews = readJSON(REVIEWS_FILE, []);
let notifications = readJSON(NOTIFICATIONS_FILE, []);
let wishlists = readJSON(WISHLISTS_FILE, {});
let activeOtps: Record<string, { code: string; expiry: number; channel: string }> = {};


async function syncFromFirestore() {
  const firestoreDb = getDb();
  if (!firestoreDb) {
    console.warn("Firebase Sync status: Running with local JSON backup because Firestore is currently inaccessible.");
    return;
  }

  try {
    console.log("Syncing data from Firestore with bidirectional merge...");

    // 1. Merge Products
    const defaultIds = ["prod-1", "prod-2", "prod-3", "prod-4"];
    for (const defaultId of defaultIds) {
      try {
        await deleteDocument("products", defaultId);
      } catch (err) {
        console.error(`Error deleting default product ${defaultId}:`, err);
      }
    }

    // Read current local products from file to merge
    const localProducts = readJSON(PRODUCTS_FILE, defaultProducts).filter((p: any) => !defaultIds.includes(p.id));

    // Get products from Firestore
    const firestoreProductsRaw = await getCollectionDocs("products");
    const firestoreProducts = firestoreProductsRaw.filter((p: any) => p && p.id && !defaultIds.includes(p.id));

    // Bidirectional merge products:
    const mergedProductsMap = new Map<string, any>();
    
    // Load local first
    localProducts.forEach((p: any) => {
      mergedProductsMap.set(p.id, p);
    });

    // Merge Firestore (overwrites local if exists, or adds new ones)
    firestoreProducts.forEach((p: any) => {
      const local = mergedProductsMap.get(p.id);
      if (local) {
        const timeLocal = local.createdAt ? new Date(local.createdAt).getTime() : 0;
        const timeFire = p.createdAt ? new Date(p.createdAt).getTime() : 0;
        if (timeFire >= timeLocal) {
          mergedProductsMap.set(p.id, p);
        }
      } else {
        mergedProductsMap.set(p.id, p);
      }
    });

    const mergedProducts = Array.from(mergedProductsMap.values());
    // Sort products by createdAt desc
    mergedProducts.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    products = mergedProducts;
    writeJSON(PRODUCTS_FILE, products);

    // Save back any missing products to Firestore
    const productsToPush: { id: string, data: any }[] = [];
    const firestoreProductIds = new Set(firestoreProducts.map((p: any) => p.id));
    
    mergedProducts.forEach((p: any) => {
      if (!firestoreProductIds.has(p.id)) {
        productsToPush.push({ id: p.id, data: p });
      }
    });

    if (productsToPush.length > 0) {
      await batchSetDocuments("products", productsToPush);
      console.log(`Seeded/synchronized ${productsToPush.length} products back to Firestore.`);
    }
    console.log(`Total active products merged: ${products.length}`);


    // 2. Merge Orders
    const localOrders = readJSON(ORDERS_FILE, []);
    const firestoreOrdersRaw = await getCollectionDocs("orders");
    const firestoreOrders = firestoreOrdersRaw.filter((o: any) => o && o.id);

    const mergedOrdersMap = new Map<string, any>();
    localOrders.forEach((o: any) => {
      mergedOrdersMap.set(o.id, o);
    });
    firestoreOrders.forEach((o: any) => {
      const local = mergedOrdersMap.get(o.id);
      if (local) {
        const timeLocal = local.createdAt ? new Date(local.createdAt).getTime() : 0;
        const timeFire = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        if (timeFire >= timeLocal) {
          mergedOrdersMap.set(o.id, o);
        }
      } else {
        mergedOrdersMap.set(o.id, o);
      }
    });

    const mergedOrders = Array.from(mergedOrdersMap.values());
    mergedOrders.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    orders = mergedOrders;
    writeJSON(ORDERS_FILE, orders);

    const ordersToPush: { id: string, data: any }[] = [];
    const firestoreOrderIds = new Set(firestoreOrders.map((o: any) => o.id));

    mergedOrders.forEach((o: any) => {
      if (!firestoreOrderIds.has(o.id)) {
        ordersToPush.push({ id: o.id, data: o });
      }
    });

    if (ordersToPush.length > 0) {
      await batchSetDocuments("orders", ordersToPush);
      console.log(`Seeded/synchronized ${ordersToPush.length} orders back to Firestore.`);
    }
    console.log(`Total orders merged: ${orders.length}`);


    // 3. Bidirectional Sync of Users (To ensure user accounts are preserved across dev-server restarts and deployments)
    const localUsers = readJSON(USERS_FILE, {});
    const firestoreUsersRaw = await getCollectionDocs("users");
    const firestoreUsersMap = new Map<string, string>();
    firestoreUsersRaw.forEach((u: any) => {
      if (u && u.username && u.password) {
        firestoreUsersMap.set(u.username.toLowerCase().trim(), u.password);
      }
    });

    const mergedUsers = { ...localUsers };
    firestoreUsersMap.forEach((password, username) => {
      mergedUsers[username] = password;
    });

    users = mergedUsers;
    writeJSON(USERS_FILE, users);

    // Push any local-only users back to Firestore
    const usersToPush: { id: string, data: any }[] = [];
    Object.entries(mergedUsers).forEach(([username, password]) => {
      const cleanU = username.toLowerCase().trim();
      const firestoreUser = firestoreUsersRaw.find((u: any) => u && u.id && u.id.toLowerCase().trim() === cleanU);
      if (!firestoreUser) {
        usersToPush.push({
          id: cleanU,
          data: {
            username: cleanU,
            password: password,
            verified: true,
            verifiedAt: new Date().toISOString()
          }
        });
      }
    });

    if (usersToPush.length > 0) {
      await batchSetDocuments("users", usersToPush);
      console.log(`Synchronized ${usersToPush.length} missing user accounts to Firestore.`);
    }
    console.log(`Total active user accounts loaded & merged: ${Object.keys(users).length}`);

    // 4. Merge Reviews
    const localReviews = readJSON(REVIEWS_FILE, []);
    const firestoreReviewsRaw = await getCollectionDocs("reviews");
    const firestoreReviews = firestoreReviewsRaw.filter((r: any) => r && r.id);

    const mergedReviewsMap = new Map<string, any>();
    localReviews.forEach((r: any) => {
      mergedReviewsMap.set(r.id, r);
    });
    firestoreReviews.forEach((r: any) => {
      const local = mergedReviewsMap.get(r.id);
      if (local) {
        const timeLocal = local.createdAt ? new Date(local.createdAt).getTime() : 0;
        const timeFire = r.createdAt ? new Date(r.createdAt).getTime() : 0;
        if (timeFire >= timeLocal) {
          mergedReviewsMap.set(r.id, r);
        }
      } else {
        mergedReviewsMap.set(r.id, r);
      }
    });

    const mergedReviews = Array.from(mergedReviewsMap.values());
    mergedReviews.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    reviews = mergedReviews;
    writeJSON(REVIEWS_FILE, reviews);

    const reviewsToPush: { id: string, data: any }[] = [];
    const firestoreReviewIds = new Set(firestoreReviews.map((r: any) => r.id));

    mergedReviews.forEach((r: any) => {
      if (!firestoreReviewIds.has(r.id)) {
        reviewsToPush.push({ id: r.id, data: r });
      }
    });

    if (reviewsToPush.length > 0) {
      await batchSetDocuments("reviews", reviewsToPush);
      console.log(`Seeded/synchronized ${reviewsToPush.length} reviews back to Firestore.`);
    }
    console.log(`Total reviews merged: ${reviews.length}`);

    // 5. Merge Notifications
    const localNotifications = readJSON(NOTIFICATIONS_FILE, []);
    const firestoreNotificationsRaw = await getCollectionDocs("notifications");
    const firestoreNotifications = firestoreNotificationsRaw.filter((n: any) => n && n.id);

    const mergedNotificationsMap = new Map<string, any>();
    localNotifications.forEach((n: any) => {
      mergedNotificationsMap.set(n.id, n);
    });
    firestoreNotifications.forEach((n: any) => {
      const local = mergedNotificationsMap.get(n.id);
      if (local) {
        const timeLocal = local.createdAt ? new Date(local.createdAt).getTime() : 0;
        const timeFire = n.createdAt ? new Date(n.createdAt).getTime() : 0;
        if (timeFire >= timeLocal) {
          mergedNotificationsMap.set(n.id, n);
        }
      } else {
        mergedNotificationsMap.set(n.id, n);
      }
    });

    const mergedNotifications = Array.from(mergedNotificationsMap.values());
    mergedNotifications.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    notifications = mergedNotifications;
    writeJSON(NOTIFICATIONS_FILE, notifications);

    const notificationsToPush: { id: string, data: any }[] = [];
    const firestoreNotificationIds = new Set(firestoreNotifications.map((n: any) => n.id));

    mergedNotifications.forEach((n: any) => {
      if (!firestoreNotificationIds.has(n.id)) {
        notificationsToPush.push({ id: n.id, data: n });
      }
    });

    if (notificationsToPush.length > 0) {
      await batchSetDocuments("notifications", notificationsToPush);
      console.log(`Seeded/synchronized ${notificationsToPush.length} notifications back to Firestore.`);
    }
    console.log(`Total notifications merged: ${notifications.length}`);

    // 6. Merge Wishlists
    const localWishlists = readJSON(WISHLISTS_FILE, {});
    const firestoreWishlistsRaw = await getCollectionDocs("wishlists");
    const mergedWishlists = { ...localWishlists };
    firestoreWishlistsRaw.forEach((w: any) => {
      if (w && w.id) {
        const username = w.id;
        const firestoreProductIds = Array.isArray(w.productIds) ? w.productIds : [];
        const localProductIds = Array.isArray(localWishlists[username]) ? localWishlists[username] : [];
        const mergedIds = Array.from(new Set([...localProductIds, ...firestoreProductIds]));
        mergedWishlists[username] = mergedIds;
      }
    });
    wishlists = mergedWishlists;
    writeJSON(WISHLISTS_FILE, wishlists);

    const wishlistsToPush: { id: string, data: any }[] = [];
    for (const [uname, pids] of Object.entries(wishlists)) {
      wishlistsToPush.push({ id: uname, data: { username: uname, productIds: pids } });
    }
    if (wishlistsToPush.length > 0) {
      await batchSetDocuments("wishlists", wishlistsToPush);
      console.log(`Seeded/synchronized ${wishlistsToPush.length} wishlists back to Firestore.`);
    }
    console.log(`Total wishlists loaded/merged: ${Object.keys(wishlists).length}`);

  } catch (error) {
    const errMsg = String(error);
    console.warn("Firebase Sync status: Running with local JSON backup because Firestore is currently inaccessible:", errMsg);
  }
}

async function startServer() {
  const app = express();
  
  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve uploaded files statically
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Serve public static assets (Google Search Console verification, robots.txt, sitemap.xml)
  const PUBLIC_DIR = path.join(process.cwd(), "public");
  app.use(express.static(PUBLIC_DIR));
  app.get("/google43d84f900565b907.html", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(PUBLIC_DIR, "google43d84f900565b907.html"));
  });

  // --- API Endpoints ---

  // Check if user exists
  app.post("/api/users/check", async (req, res) => {
    const { username } = req.body;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username or Mobile Number is required" });
    }
    const cleanUsername = username.toLowerCase().trim();
    let exists = Object.prototype.hasOwnProperty.call(users, cleanUsername);

    if (!exists) {
      try {
        const firestoreUser = await getDocument("users", cleanUsername);
        if (firestoreUser && firestoreUser.password) {
          users[cleanUsername] = firestoreUser.password;
          writeJSON(USERS_FILE, users);
          exists = true;
          console.log(`Resolved and cached user ${cleanUsername} from Firestore during check.`);
        }
      } catch (err) {
        console.error(`Failed to lookup user ${cleanUsername} in Firestore:`, err);
      }
    }

    res.json({ exists });
  });

  // Login existing user with custom password
  app.post("/api/users/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username or Mobile Number is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    
    const cleanUsername = username.toLowerCase().trim();
    let exists = Object.prototype.hasOwnProperty.call(users, cleanUsername);

    if (!exists) {
      try {
        const firestoreUser = await getDocument("users", cleanUsername);
        if (firestoreUser && firestoreUser.password) {
          users[cleanUsername] = firestoreUser.password;
          writeJSON(USERS_FILE, users);
          exists = true;
          console.log(`Resolved and cached user ${cleanUsername} from Firestore during login.`);
        }
      } catch (err) {
        console.error(`Failed to lookup user ${cleanUsername} in Firestore:`, err);
      }
    }

    if (!exists) {
      return res.status(404).json({ error: "User account does not exist. Please register first." });
    }

    if (users[cleanUsername] !== password) {
      return res.status(401).json({ error: "Incorrect password! Please try again. / गलत पासवर्ड! दोबारा कोशिश करें।" });
    }

    return res.json({ success: true, username: cleanUsername });
  });

  // Send OTP for Registration (WhatsApp or SMS)
  app.post("/api/otp/send", async (req, res) => {
    const { username, channel } = req.body;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    const cleanUsername = username.toLowerCase().trim();
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(cleanUsername)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number" });
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanChannel = channel === "sms" ? "SMS" : "WhatsApp";

    // Track active OTP on server
    activeOtps[cleanUsername] = {
      code,
      expiry: Date.now() + 5 * 60 * 1000, // valid for 5 mins
      channel: cleanChannel
    };

    // Console logs representing simulated gateway send-out
    console.log("\n=======================================================");
    console.log(`[OTP GATEWAY SENT - ${cleanChannel.toUpperCase()}]`);
    console.log(`TO: +91 ${cleanUsername}`);
    console.log(`MESSAGE: SastaStore verification code: ${code}. Valid for 5 minutes.`);
    console.log("=======================================================\n");

    // Returns the code directly in development sandbox to display simulated device popups
    res.json({
      success: true,
      channel: cleanChannel,
      message: `OTP successfully simulated via ${cleanChannel}!`,
      otp: code // Returned for user preview sandbox testing
    });
  });

  // Verify OTP for Registration
  app.post("/api/otp/verify", async (req, res) => {
    const { username, otp } = req.body;
    if (!username || !otp) {
      return res.status(400).json({ error: "Username and OTP are required" });
    }

    const cleanUsername = username.toLowerCase().trim();
    const record = activeOtps[cleanUsername];

    if (!record) {
      return res.status(400).json({ error: "No pending OTP request found. Please request a new OTP." });
    }

    if (Date.now() > record.expiry) {
      delete activeOtps[cleanUsername];
      return res.status(400).json({ error: "OTP expired! Please request a new one." });
    }

    if (record.code !== otp.trim()) {
      return res.status(400).json({ error: "Incorrect OTP! Please check the code and try again." });
    }

    // OTP matches perfectly! Delete OTP record
    delete activeOtps[cleanUsername];

    res.json({ success: true, verified: true });
  });

  // Register New User with Chosen Password
  app.post("/api/users/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const cleanUsername = username.toLowerCase().trim();
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long" });
    }

    // Save user in local database & Firestore
    users[cleanUsername] = password;
    writeJSON(USERS_FILE, users);

    // Save user to Firestore
    try {
      await setDocument("users", cleanUsername, {
        username: cleanUsername,
        password: password,
        verified: true,
        verifiedAt: new Date().toISOString()
      });
      console.log(`Successfully registered user ${cleanUsername} in Firestore with customized password.`);
    } catch (err) {
      console.error(`Failed to save verified user ${cleanUsername} to Firestore:`, err);
    }

    res.json({ success: true, username: cleanUsername });
  });

  // Get all products
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  // Get a single product
  app.get("/api/products/:id", (req, res) => {
    const product = products.find((p: any) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

  // Create a product (Creator only)
  app.post("/api/products", async (req, res) => {
    const { name, description, price, originalPrice, images, category, sizes, sizePrices } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: "Name, price, and category are required" });
    }

    // Process images (both URLs and base64)
    const processedImages: string[] = [];
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (typeof img === "string" && img.trim() !== "") {
          // Keep base64 strings and standard URLs directly so they are persisted in Firestore 
          // and accessible across multiple stateless container instances (multi-user safe)
          processedImages.push(img);
        }
      });
    }

    // If no images provided, use a placeholder
    if (processedImages.length === 0) {
      processedImages.push("https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80");
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      name,
      description: description || "",
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      images: processedImages,
      category,
      sizes: Array.isArray(sizes) ? sizes : [],
      sizePrices: sizePrices || {},
      inStock: true,
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    writeJSON(PRODUCTS_FILE, products);

    // Save to Firestore
    try {
      await setDocument("products", newProduct.id, newProduct);
      console.log(`Saved product ${newProduct.id} to Firestore.`);
    } catch (err) {
      console.error(`Failed to save product ${newProduct.id} to Firestore:`, err);
    }

    res.status(201).json(newProduct);
  });

  // Edit a product (Creator only)
  app.put("/api/products/:id", async (req, res) => {
    const id = req.params.id;
    const index = products.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, description, price, originalPrice, images, category, inStock, sizes, sizePrices } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: "Name, price, and category are required" });
    }

    // Process images
    const processedImages: string[] = [];
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (typeof img === "string" && img.trim() !== "") {
          // Keep base64 strings and standard URLs directly so they are persisted in Firestore 
          // and accessible across multiple stateless container instances (multi-user safe)
          processedImages.push(img);
        }
      });
    }

    if (processedImages.length === 0) {
      processedImages.push("https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80");
    }

    const updatedProduct = {
      ...products[index],
      name,
      description: description || "",
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      images: processedImages,
      category,
      sizes: Array.isArray(sizes) ? sizes : [],
      sizePrices: sizePrices || {},
      inStock: inStock !== undefined ? !!inStock : true,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    writeJSON(PRODUCTS_FILE, products);

    // Update in Firestore
    try {
      await setDocument("products", id, updatedProduct);
      console.log(`Updated product ${id} in Firestore.`);
    } catch (err) {
      console.error(`Failed to update product ${id} in Firestore:`, err);
    }

    res.json(updatedProduct);
  });

  // Toggle stock status of a product (Creator only)
  app.patch("/api/products/:id/stock", async (req, res) => {
    const id = req.params.id;
    const index = products.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { inStock } = req.body;
    if (inStock === undefined) {
      return res.status(400).json({ error: "inStock value is required" });
    }

    const updatedProduct = {
      ...products[index],
      inStock: !!inStock,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    writeJSON(PRODUCTS_FILE, products);

    // Update in Firestore
    try {
      await setDocument("products", id, updatedProduct);
      console.log(`Updated product ${id} stock in Firestore.`);
    } catch (err) {
      console.error(`Failed to update product ${id} stock in Firestore:`, err);
    }

    res.json(updatedProduct);
  });

  // Delete a product (Creator only)
  app.delete("/api/products/:id", async (req, res) => {
    const id = req.params.id;
    const index = products.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    products.splice(index, 1);
    writeJSON(PRODUCTS_FILE, products);

    // Delete from Firestore
    try {
      await deleteDocument("products", id);
      console.log(`Deleted product ${id} from Firestore.`);
    } catch (err) {
      console.error(`Failed to delete product ${id} from Firestore:`, err);
    }

    res.json({ success: true, message: "Product deleted" });
  });

  // Get all orders (Creator only, but allows normal user to filter by query parameter username)
  app.get("/api/orders", (req, res) => {
    const { username } = req.query;
    if (username) {
      const cleanUsername = String(username).toLowerCase().trim();
      const userOrders = orders.filter((o: any) => {
        const orderUsername = String(o.username || "").toLowerCase().trim();
        const orderMobile = String(o.customerDetails?.mobile || "").trim();
        return orderUsername === cleanUsername || orderMobile === cleanUsername;
      });
      return res.json(userOrders);
    }
    res.json(orders);
  });

  // Create an order (User)
  app.post("/api/orders", async (req, res) => {
    const { items, customerDetails, username } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items are required" });
    }

    if (!customerDetails || 
        !customerDetails.name || 
        !customerDetails.mobile || 
        !customerDetails.address || 
        !customerDetails.state || 
        !customerDetails.cityVillageTown || 
        !customerDetails.landmark ||
        !customerDetails.pincode) {
      return res.status(400).json({ error: "All customer details are required" });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      // Find original product to verify price
      const originalProduct = products.find((p: any) => p.id === item.productId);
      const priceAtPurchase = originalProduct ? originalProduct.price : item.priceAtPurchase;
      totalAmount += priceAtPurchase * item.quantity;

      return {
        productId: item.productId,
        name: item.name,
        image: item.image || (originalProduct && originalProduct.images && originalProduct.images.length > 0 ? originalProduct.images[0] : "") || "",
        priceAtPurchase,
        quantity: item.quantity
      };
    });

    const newOrder = {
      id: `ord-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      items: orderItems,
      totalAmount,
      customerDetails: {
        ...customerDetails,
        villageName: customerDetails.villageName || ""
      },
      status: "Pending",
      createdAt: new Date().toISOString(),
      username: username ? String(username).toLowerCase().trim() : undefined
    };

    orders.unshift(newOrder);
    writeJSON(ORDERS_FILE, orders);

    // Save to Firestore
    try {
      await setDocument("orders", newOrder.id, newOrder);
      console.log(`Saved order ${newOrder.id} to Firestore.`);
    } catch (err) {
      console.error(`Failed to save order ${newOrder.id} to Firestore:`, err);
    }

    res.status(201).json(newOrder);
  });

  // Update order status or arrival date (Creator or User)
  app.patch("/api/orders/:id", async (req, res) => {
    const id = req.params.id;
    const { status, arrivalDate, returnWindowDays } = req.body;

    const order = orders.find((o: any) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (status !== undefined) {
      const validStatuses = ["Pending", "Accepted", "Shipped", "Delivered", "Cancelled", "Returned"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      order.status = status;
      order.updatedAt = new Date().toISOString();
      if (status === "Delivered") {
        order.deliveredAt = new Date().toISOString();
      }
    }

    if (arrivalDate !== undefined) {
      order.arrivalDate = arrivalDate;
      order.updatedAt = new Date().toISOString();
    }

    if (returnWindowDays !== undefined) {
      order.returnWindowDays = returnWindowDays;
      order.updatedAt = new Date().toISOString();
    }

    writeJSON(ORDERS_FILE, orders);

    // Save to Firestore
    try {
      await setDocument("orders", id, order);
      console.log(`Updated order ${id} in Firestore.`);
    } catch (err) {
      console.error(`Failed to update order ${id} in Firestore:`, err);
    }

    res.json(order);
  });

  // Get all registered users and their credentials / associated names & mobiles from orders (Creator only)
  app.get("/api/creator/users", (req, res) => {
    const usersList = Object.keys(users).map(username => {
      // Find orders for this username
      const userOrders = orders.filter((o: any) => o.username === username);
      
      // Extract unique names and mobile numbers from their orders
      const names = Array.from(new Set(userOrders.map((o: any) => o.customerDetails?.name).filter(Boolean)));
      const mobiles = Array.from(new Set(userOrders.map((o: any) => o.customerDetails?.mobile).filter(Boolean)));

      return {
        username,
        password: users[username],
        names,
        mobiles,
        ordersCount: userOrders.length
      };
    });

    res.json(usersList);
  });

  // Get reviews for a product
  app.get("/api/reviews", (req, res) => {
    const { productId } = req.query;
    if (productId) {
      const filtered = reviews.filter((r: any) => r.productId === String(productId));
      return res.json(filtered);
    }
    res.json(reviews);
  });

  // Create a review
  app.post("/api/reviews", async (req, res) => {
    const { productId, username, rating, comment } = req.body;
    if (!productId || !username || !rating) {
      return res.status(400).json({ error: "productId, username, and rating are required" });
    }

    const newReview = {
      id: `rev-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      productId,
      username: String(username).toLowerCase().trim(),
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date().toISOString()
    };

    reviews.unshift(newReview);
    writeJSON(REVIEWS_FILE, reviews);

    // Save to Firestore
    try {
      await setDocument("reviews", newReview.id, newReview);
      console.log(`Saved review ${newReview.id} to Firestore.`);
    } catch (err) {
      console.error(`Failed to save review to Firestore:`, err);
    }

    res.status(201).json(newReview);
  });

  // Get all notifications or notifications for a user
  app.get("/api/notifications", (req, res) => {
    const { username } = req.query;
    if (username) {
      const cleanUsername = String(username).toLowerCase().trim();
      const filtered = notifications.filter((n: any) => {
        return n.targetType === "all" || String(n.targetUser || "").toLowerCase().trim() === cleanUsername;
      });
      return res.json(filtered);
    }
    res.json(notifications);
  });

  // Create a new notification
  app.post("/api/notifications", async (req, res) => {
    const { title, message, targetType, targetUser } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "title and message are required" });
    }

    const newNotification = {
      id: `notif-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      message,
      targetType: targetType || "all",
      targetUser: targetUser ? String(targetUser).toLowerCase().trim() : "",
      createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotification);
    writeJSON(NOTIFICATIONS_FILE, notifications);

    // Save to Firestore
    try {
      await setDocument("notifications", newNotification.id, newNotification);
      console.log(`Saved notification ${newNotification.id} to Firestore.`);
    } catch (err) {
      console.error(`Failed to save notification to Firestore:`, err);
    }

    res.status(201).json(newNotification);
  });

  // Delete a notification
  app.delete("/api/notifications/:id", async (req, res) => {
    const id = req.params.id;
    const index = notifications.findIndex((n: any) => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notifications.splice(index, 1);
    writeJSON(NOTIFICATIONS_FILE, notifications);

    try {
      await deleteDocument("notifications", id);
      console.log(`Deleted notification ${id} from Firestore.`);
    } catch (err) {
      console.error(`Failed to delete notification ${id} from Firestore:`, err);
    }

    res.json({ success: true });
  });

  // --- Wishlist Endpoints ---

  // Get user's wishlist
  app.get("/api/wishlist", (req, res) => {
    const { username } = req.query;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username is required" });
    }
    const cleanUsername = username.toLowerCase().trim();
    const productIds = wishlists[cleanUsername] || [];
    res.json({ success: true, productIds });
  });

  // Toggle wishlist product
  app.post("/api/wishlist/toggle", async (req, res) => {
    const { username, productId } = req.body;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const cleanUsername = username.toLowerCase().trim();
    if (!wishlists[cleanUsername]) {
      wishlists[cleanUsername] = [];
    }

    const currentList: string[] = wishlists[cleanUsername];
    const index = currentList.indexOf(productId);
    let added = false;

    if (index === -1) {
      currentList.push(productId);
      added = true;
    } else {
      currentList.splice(index, 1);
    }

    wishlists[cleanUsername] = currentList;
    writeJSON(WISHLISTS_FILE, wishlists);

    // Save to Firestore
    try {
      await setDocument("wishlists", cleanUsername, {
        username: cleanUsername,
        productIds: currentList
      });
      console.log(`Updated wishlist for ${cleanUsername} in Firestore.`);
    } catch (err) {
      console.error(`Failed to update wishlist for ${cleanUsername} in Firestore:`, err);
    }

    res.json({ success: true, added, productIds: currentList });
  });

  // --- SastaStore AI Support Endpoint ---
  app.post("/api/gemini/support", async (req, res) => {
    const { prompt, conversationHistory } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemInstruction = `You are "SastaStore AI Assistant" (सस्ता स्टोर AI सहायता), the official 24x7 intelligent help desk assistant for SastaStore (सस्ता स्टोर), India's premier wholesale marketplace connecting buyers directly with local creators and artisans.

CRITICAL SCOPE CONSTRAINTS:
1. You MUST ONLY answer questions related to SastaStore, its platform, products, orders, shipping, Cash on Delivery (COD), returns/replacements, creator listings, and user support.
2. If the user asks anything completely unrelated to SastaStore or e-commerce (e.g. general programming code, news, politics, homework math, random trivia, movie plots), politely decline in a friendly tone:
   "I am SastaStore's AI Help Assistant! I can only answer questions regarding SastaStore products, orders, delivery, Cash on Delivery, and shopping support." (or equivalent in Hindi/Hinglish if requested).
3. KEY SASTASTORE FACTS:
   - Wholesale savings up to 70% off by sourcing directly from local creators with NO middlemen.
   - 100% Cash on Delivery (COD) on all orders across all states, towns, and villages in India.
   - 100% FREE delivery on all orders with fast dispatch (average 2-3 business days).
   - Easy 7-day hassle-free replacement/return guarantee for damaged or incorrect products.
   - Quick mobile OTP registration (via SMS or WhatsApp) and easy password login.
   - Real-time order tracking available directly under the "My Orders" tab.
   - Direct Instagram contact: @editing_verse_03 (https://www.instagram.com/editing_verse_03?igsh=cHRpZjB5ZGQ5cTBo).
4. Maintain a warm, polite, respectful, and helpful tone. Format responses cleanly with bullet points or short paragraphs. You can answer in English, Hindi, or Hinglish based on the user's input language.`;

    try {
      if (process.env.GEMINI_API_KEY) {
        let contents: any[] = [];
        if (Array.isArray(conversationHistory)) {
          conversationHistory.forEach((msg: any) => {
            if (msg.role && msg.text) {
              contents.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.text }]
              });
            }
          });
        }
        contents.push({ role: "user", parts: [{ text: prompt }] });

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.6
          }
        });

        const reply = response.text || "I am SastaStore AI Assistant. How can I assist you with your SastaStore orders or products today?";
        return res.json({ reply });
      }
    } catch (err) {
      console.error("Gemini support API error:", err);
    }

    // Smart fallback if API Key is not configured or temporary network issue
    const lower = prompt.toLowerCase();
    let reply = "Hello! I am SastaStore AI Assistant. I am here to help you with anything related to SastaStore!";
    if (lower.includes("track") || lower.includes("status") || lower.includes("where") || lower.includes("order")) {
      reply = "🚚 **Tracking Your Order on SastaStore**:\n\nYou can track all your orders under the **My Orders** tab! Click on any order card to see real-time status: Order Placed ➔ Creator Packed ➔ Dispatched ➔ Delivered.";
    } else if (lower.includes("cod") || lower.includes("cash") || lower.includes("payment") || lower.includes("pay")) {
      reply = "💵 **100% Cash on Delivery (COD)**:\n\nSastaStore supports Cash on Delivery on all orders across India! You pay only when your item is safely delivered to your doorstep or village.";
    } else if (lower.includes("return") || lower.includes("replace") || lower.includes("damage") || lower.includes("refund")) {
      reply = "🔄 **Returns & Replacements**:\n\nEvery product comes with SastaStore's 7-Day Guarantee. Go to **My Orders**, select your order, and click 'Help / Support' to raise a ticket or request a free replacement.";
    } else if (lower.includes("delivery") || lower.includes("shipping") || lower.includes("charge") || lower.includes("fee")) {
      reply = "⚡ **Free Delivery**:\n\nDelivery is 100% FREE on all SastaStore orders with no hidden processing fees! Average delivery time is 2-3 business days.";
    } else if (lower.includes("register") || lower.includes("login") || lower.includes("account") || lower.includes("otp")) {
      reply = "📱 **Registration & Login**:\n\nSimply enter your 10-digit mobile number, verify the 6-digit OTP sent via SMS or WhatsApp, set your password, and start shopping!";
    } else if (lower.includes("creator") || lower.includes("wholesale") || lower.includes("sasta") || lower.includes("discount")) {
      reply = "🏷️ **Wholesale Direct Prices**:\n\nSastaStore connects you directly with local creators and artisans without middlemen, giving you up to 70% wholesale savings!";
    } else if (lower.includes("insta") || lower.includes("instagram")) {
      reply = "📷 **Official Instagram Support**:\n\nYou can reach out directly on Instagram at **@editing_verse_03** (https://www.instagram.com/editing_verse_03?igsh=cHRpZjB5ZGQ5cTBo) for immediate assistance!";
    } else {
      reply = "I am SastaStore's official 24x7 AI Help Assistant! You can ask me about order tracking, Cash on Delivery (COD), free delivery, 7-day returns, or wholesale creator prices. How can I help you today?";
    }

    res.json({ reply });
  });

  // --- Vite & Client App Serving ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sasta Store Server] running on http://0.0.0.0:${PORT}`);
    // Sync data from Firestore in background after server binds to port 3000
    syncFromFirestore().catch((err) => {
      console.warn("Background Firestore sync failed:", err);
    });
  });
}

startServer();
