import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { DatabaseSchema, Vehicle, BlogPost, Settings, Admin } from "./src/types.js";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Global active sessions map: token -> adminId
const ACTIVE_SESSIONS: Record<string, string> = {};

// Helper to encrypt passwords using pbkdf2
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "foreclosed_salt_123_abc", 1000, 64, "sha512").toString("hex");
}

// Seed Database default values
const defaultSettings: Settings = {
  companyName: "Foreclosed Auto Deals",
  phone: "+1 (555) 555-0199",
  whatsapp: "https://wa.me/15555550199",
  email: "assets@foreclosedautodeals.com",
  address: "4420 Sovereign Way, Suite 100, Miami, FL 33130",
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com"
  }
};

const seedVehicles: Vehicle[] = [
  {
    id: "v1",
    title: "2022 Mercedes-Benz AMG GT 53",
    make: "Mercedes-Benz",
    model: "AMG GT 53",
    year: 2022,
    mileage: 12450,
    price: 84900,
    location: "Miami, FL",
    description: "Foreclosed asset in immaculate condition. Finished in Obsidian Black Metallic over black Nappa leather. Powered by a 3.0L inline-6 turbo engine with EQ Boost, delivering 429 HP. Fully loaded with AMG Night Package, 20\" AMG wheels, Burmester surround sound, and active parking assist. Quietly repossessed from an upscale estate in Coral Gables. Clean title, dynamic mechanical inspection passed. Immediate ownership transfer available.",
    status: "ALMOST_SOLD",
    videoUrl: "https://www.youtube.com/embed/Y-bYshs_qQo",
    ctaLink: "https://wa.me/15555550199?text=Inquiry%20regarding%20the%202022%20Mercedes-Benz%20AMG%20GT%2053",
    ctaText: "Inquire via WhatsApp",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-06-10").toISOString()
  },
  {
    id: "v2",
    title: "2023 Porsche Cayenne Coupé",
    make: "Porsche",
    model: "Cayenne Coupé",
    year: 2023,
    mileage: 8600,
    price: 79500,
    location: "Beverly Hills, CA",
    description: "Acquired through bank foreclosure. Carrara White Metallic exterior with custom Bordeaux Red leather interior. Powered by a 3.0-liter turbocharged V6 pushing 335 horsepower. Equipped with Panoramic Roof System, Porsche Active Suspension Management (PASM), 21\" RS Spyder Design wheels, and active lane keeping. Absolute showroom condition. Carfax is completely clean. Ownership documents prepared. This vehicle is priced to liquidate within 48 hours.",
    status: "ACTIVE",
    videoUrl: "",
    ctaLink: "https://wa.me/15555550199?text=Inquiry%20regarding%20the%202023%20Porsche%20Cayenne%20Coupé",
    ctaText: "Inquire via WhatsApp",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1614162002161-55c328e35fa6?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-06-15").toISOString()
  },
  {
    id: "v3",
    title: "2021 BMW M4 Competition",
    make: "BMW",
    model: "M4 Competition",
    year: 2021,
    mileage: 19800,
    price: 61000,
    location: "Dallas, TX",
    description: "Repossessed asset from default auto loan portfolio liquidation. Toronto Red Metallic over black Merino leather. Powered by a 3.0L BMW M TwinPower Turbo inline-6 engine producing an aggressive 503 hp. Features M Carbon Bucket Seats, Executive Package, carbon fiber interior trim, and Harman Kardon premium sound. Extremely well maintained, full dealer service history included. Underpriced for quick creditor ledger clearance.",
    status: "ACTIVE",
    videoUrl: "",
    ctaLink: "tel:+15555550199",
    ctaText: "Call Asset Manager Now",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-06-18").toISOString()
  },
  {
    id: "v4",
    title: "2024 Audi RS6 Avant",
    make: "Audi",
    model: "RS6 Avant",
    year: 2024,
    mileage: 4100,
    price: 112000,
    location: "New York, NY",
    description: "Extremely rare high-performance sport avant seized via private debt settlement. Daytona Gray Pearl with black Valcona leather sports custom stitching. Features a twin-turbocharged 4.0-liter V8 outputting 591hp, paired with an eight-speed Tiptronic transmission and legendary Quattro all-wheel drive. Upgrades include carbon ceramics, Dynamic Ride Control, and the Dark Optics Package. Practical, aggressive, and essentially brand new. Repossession title is clean.",
    status: "ALMOST_SOLD",
    videoUrl: "",
    ctaLink: "https://wa.me/15555550199?text=Inquiry%20regarding%20the%202024%20Audi%20RS6%20Avant",
    ctaText: "Secure Listing with WhatsApp",
    images: [
      "https://images.unsplash.com/photo-1606016159991-dfe4f974be5c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-06-21").toISOString()
  },
  {
    id: "v5",
    title: "2022 Range Rover Sport HST",
    make: "Land Rover",
    model: "Range Rover Sport HST",
    year: 2022,
    mileage: 23100,
    price: 54000,
    location: "Atlanta, GA",
    description: "Foreclosed luxury SUV in pristine operational condition, reassigned by court creditor. Santorini Black Metallic over Ebony premium leather. Powered by a mild-hybrid 3.0L inline-6 cylinder engine producing 395 HP. Features air suspension, 22\" gloss black alloy wheels, panoramic sky roof, and high-performance interactive infotainment. Immediate liquidation at standard trade-in value to finalize the corporate recovery order.",
    status: "JUST_SOLD",
    videoUrl: "",
    ctaLink: "tel:+15555550199",
    ctaText: "Register Backup Inquiry",
    images: [
      "https://images.unsplash.com/photo-1509744645300-a2098b1180c6?auto=format&fit=crop&q=80&w=1200"
    ],
    createdAt: new Date("2026-05-15").toISOString()
  }
];

const seedBlogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "The Ultimate Guide to Purchasing Repossessed Luxury Vehicles Safely",
    slug: "buying-repossessed-luxury-vehicles-safety-guide",
    category: "Buying Guides",
    content: "### Transparency is the Key to Smart Investing\n\nRepossessed and foreclosed automotive assets represent an incredible pathway to luxury car ownership at a deep, institutional discount. Every year, financial institutions, pawn lenders, and recovery teams liquidate premium vehicles below their current market value to recoup outstanding debts quickly. However, understanding the process is vital to converting these opportunities into true value.\n\n#### Why Repossessed Cars Cost Less\n\nWhen a borrower defaults on a collateralized loan, the lender's goal is capital preservation, not maximal retail markup. They do not want to hold the asset on their ledgers or pay expensive storage fees. Because of this, they are motivated to price the vehicle aggressively to achieve an immediate clearance sale.\n\n#### Checklist for Buying an Under-Market Repo Asset:\n\n1. **Verify Asset Ownership Documents:** Ensure that the selling entity represents a certified recovery service or has a clean repossession title prepared. This guarantees hassle-free ownership transfers.\n2. **Review Detailed Vehicle Condition Reports:** Excellent recovery agencies execute thorough 100+ point checks. Always read descriptions detailing engine health, electronics, and structural integrity.\n3. **Move Quickly:** High-quality inventory, particularly Porsche, BMW M, and AMG vehicles, is highly coveted. Delayed action almost always results in a missed opportunity.\n\nAt *Foreclosed Auto Deals*, we provide 100% transparency. Our recovery team checks every vehicle's title history, verifies mechanical performance, and handles all title transfer documentation so you can acquire your vehicle with confidence.",
    featuredImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
    seoTitle: "Smart Guide to Repossessed Luxury Cars | Foreclosed Auto Deals",
    metaDescription: "Learn how asset reclamation and foreclosed auto liquidations work. Discover critical safety steps to secure luxury cars at up to 35% below market values.",
    createdAt: new Date("2026-06-11").toISOString()
  },
  {
    id: "b2",
    title: "Why Lenders Prefer Direct Private Liquidation Over Public Auctions",
    slug: "lenders-prefer-direct-private-liquidation-vs-auctions",
    category: "Industry Insights",
    content: "### The Economics of Fast Asset Clearance\n\nMany consumers believe that all repossessed vehicles are destined for chaotic, open public auctions. In reality, modern financial institutions and asset managers are increasingly turning to direct private liquidations. In this article, we outline the economics behind why direct vehicle sales are more efficient for both creditors and smart retail buyers.\n\n#### The Hidden Costs of Auctions\n\nPublic auctions are expensive. Lenders are forced to pay transportation fees, detailing fees, auctioneer commissions, and storage costs during the auction preparation cycle. These fees quickly accumulate, eating into the recovered cash flow.\n\n#### Advantages of Private Direct Clearances:\n\n* **Reduced Intermediary Tolls:** By selling directly to buyers, liquidation platforms eliminate third-party broker fees, passing those savings directly to the final purchaser.\n* **Higher Standards of Inspection:** Public auctions sell vehicles strictly 'as-is' with minimal descriptive support. Private sales provide thorough breakdowns, high-resolution imagery, and dedicated vehicle histories.\n* **Secure and Organized Transactions:** Users bypass the pressure-cooker environment of live bidding, allowing them to make smart, rational decisions while securing the price they deserve.\n\nFor premium marques, direct private liquidation represents the gold standard. Buyer behavior is calm, descriptions are verified, and asset settlement is closed with high corporate security.",
    featuredImage: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200",
    seoTitle: "Why Lenders Choose Private Liquidations Over Auctions",
    metaDescription: "An in-depth look at asset recovery economics. Learn why direct repossessed vehicle sales bypass expensive public auction overheads to lower cost.",
    createdAt: new Date("2026-06-19").toISOString()
  }
];

// Load Database
function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database file, resetting to default seed data:", err);
  }
  
  // Default structure
  const db: DatabaseSchema = {
    admin: null,
    adminPasswordHash: null,
    vehicles: seedVehicles,
    blogPosts: seedBlogPosts,
    settings: defaultSettings,
  };
  saveDb(db);
  return db;
}

// Save Database safely
function saveDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Critical error saving database to disk:", err);
  }
}

// Authentication Middleware
function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authentication token." });
  }

  const token = authHeader.substring(7);
  const adminId = ACTIVE_SESSIONS[token];

  if (!adminId) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }

  const db = loadDb();
  if (!db.admin || db.admin.id !== adminId) {
    return res.status(401).json({ error: "Administrator account not found." });
  }

  next();
}

app.use(express.json());

// Public: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth Status Router
app.get("/api/auth/status", (req, res) => {
  const db = loadDb();
  const authHeader = req.headers.authorization;
  let loggedInAdmin: Admin | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const adminId = ACTIVE_SESSIONS[token];
    if (adminId && db.admin && db.admin.id === adminId) {
      loggedInAdmin = db.admin;
    }
  }

  res.json({
    registered: db.admin !== null,
    admin: loggedInAdmin
  });
});

// Admin: Register First Account
app.post("/api/auth/signup", (req, res) => {
  const db = loadDb();
  if (db.admin) {
    return res.status(400).json({ error: "System is already configured. Future registrations are disabled." });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const adminId = "admin_" + crypto.randomUUID().replace(/-/g, "");
  const pHash = hashPassword(password);

  db.admin = {
    id: adminId,
    name,
    email,
    createdAt: new Date().toISOString()
  };
  db.adminPasswordHash = pHash;

  saveDb(db);

  // Auto-login on signup
  const token = "token_" + crypto.randomBytes(32).toString("hex");
  ACTIVE_SESSIONS[token] = adminId;

  res.status(201).json({
    admin: db.admin,
    token
  });
});

// Admin: Login
app.post("/api/auth/login", (req, res) => {
  const db = loadDb();
  const { email, password } = req.body;

  if (!db.admin || !db.adminPasswordHash) {
    return res.status(400).json({ error: "Asset portal is not setup. Please sign up first." });
  }

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const pHash = hashPassword(password);
  if (email.toLowerCase() !== db.admin.email.toLowerCase() || pHash !== db.adminPasswordHash) {
    return res.status(401).json({ error: "Invalid credentials. Unauthorized access." });
  }

  const token = "token_" + crypto.randomBytes(32).toString("hex");
  ACTIVE_SESSIONS[token] = db.admin.id;

  res.json({
    admin: db.admin,
    token
  });
});

// Admin: Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    delete ACTIVE_SESSIONS[token];
  }
  res.json({ success: true });
});

// Vehicles API: Get All
app.get("/api/vehicles", (req, res) => {
  const db = loadDb();
  res.json(db.vehicles);
});

// Vehicles API: Get By ID
app.get("/api/vehicles/:id", (req, res) => {
  const db = loadDb();
  const vehicle = db.vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle listing not found." });
  }
  res.json(vehicle);
});

// Admin ONLY: Create Vehicle
app.post("/api/vehicles", authenticateAdmin, (req, res) => {
  const db = loadDb();
  const vehicleData = req.body;

  if (!vehicleData.title || !vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.price) {
    return res.status(400).json({ error: "Title, Make, Model, Year, and Price are required." });
  }

  const newVehicle: Vehicle = {
    id: "v_" + crypto.randomUUID().replace(/-/g, "").substring(0, 8),
    title: String(vehicleData.title),
    make: String(vehicleData.make),
    model: String(vehicleData.model),
    year: Number(vehicleData.year),
    mileage: Number(vehicleData.mileage || 0),
    price: Number(vehicleData.price),
    location: String(vehicleData.location || "Miami, FL"),
    description: String(vehicleData.description || ""),
    status: vehicleData.status || "ACTIVE",
    videoUrl: String(vehicleData.videoUrl || ""),
    ctaLink: String(vehicleData.ctaLink || ""),
    ctaText: String(vehicleData.ctaText || "Inquire Info"),
    images: Array.isArray(vehicleData.images) && vehicleData.images.length > 0 ? vehicleData.images : ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"],
    createdAt: new Date().toISOString()
  };

  db.vehicles.unshift(newVehicle);
  saveDb(db);
  res.status(201).json(newVehicle);
});

// Admin ONLY: Update Vehicle
app.put("/api/vehicles/:id", authenticateAdmin, (req, res) => {
  const db = loadDb();
  const index = db.vehicles.findIndex((v) => v.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Vehicle listing not found." });
  }

  const updateData = req.body;
  const currentVehicle = db.vehicles[index];

  db.vehicles[index] = {
    ...currentVehicle,
    title: updateData.title !== undefined ? String(updateData.title) : currentVehicle.title,
    make: updateData.make !== undefined ? String(updateData.make) : currentVehicle.make,
    model: updateData.model !== undefined ? String(updateData.model) : currentVehicle.model,
    year: updateData.year !== undefined ? Number(updateData.year) : currentVehicle.year,
    mileage: updateData.mileage !== undefined ? Number(updateData.mileage) : currentVehicle.mileage,
    price: updateData.price !== undefined ? Number(updateData.price) : currentVehicle.price,
    location: updateData.location !== undefined ? String(updateData.location) : currentVehicle.location,
    description: updateData.description !== undefined ? String(updateData.description) : currentVehicle.description,
    status: updateData.status !== undefined ? updateData.status : currentVehicle.status,
    videoUrl: updateData.videoUrl !== undefined ? String(updateData.videoUrl) : currentVehicle.videoUrl,
    ctaLink: updateData.ctaLink !== undefined ? String(updateData.ctaLink) : currentVehicle.ctaLink,
    ctaText: updateData.ctaText !== undefined ? String(updateData.ctaText) : currentVehicle.ctaText,
    images: Array.isArray(updateData.images) ? updateData.images : currentVehicle.images,
  };

  saveDb(db);
  res.json(db.vehicles[index]);
});

// Admin ONLY: Delete Vehicle
app.delete("/api/vehicles/:id", authenticateAdmin, (req, res) => {
  const db = loadDb();
  const filtered = db.vehicles.filter((v) => v.id !== req.params.id);

  if (filtered.length === db.vehicles.length) {
    return res.status(404).json({ error: "Vehicle listing not found." });
  }

  db.vehicles = filtered;
  saveDb(db);
  res.json({ success: true });
});

// Blog API: Get All
app.get("/api/blog", (req, res) => {
  const db = loadDb();
  res.json(db.blogPosts);
});

// Blog API: Get By Slug
app.get("/api/blog/:slug", (req, res) => {
  const db = loadDb();
  const post = db.blogPosts.find((p) => p.slug === req.params.slug);
  if (!post) {
    return res.status(404).json({ error: "Blog post not found." });
  }
  res.json(post);
});

// Admin ONLY: Create Blog Post
app.post("/api/blog", authenticateAdmin, (req, res) => {
  const db = loadDb();
  const postData = req.body;

  if (!postData.title || !postData.content) {
    return res.status(400).json({ error: "Title and Content are required." });
  }

  const slug = String(postData.slug || postData.title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check unique slug
  if (db.blogPosts.some((p) => p.slug === slug)) {
    return res.status(400).json({ error: "A blog post with this slug or title already exists." });
  }

  const newPost: BlogPost = {
    id: "b_" + crypto.randomUUID().replace(/-/g, "").substring(0, 8),
    title: String(postData.title),
    slug: slug,
    content: String(postData.content),
    category: String(postData.category || "Uncategorized"),
    featuredImage: String(postData.featuredImage || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"),
    seoTitle: String(postData.seoTitle || postData.title),
    metaDescription: String(postData.metaDescription || ""),
    createdAt: new Date().toISOString()
  };

  db.blogPosts.unshift(newPost);
  saveDb(db);
  res.status(201).json(newPost);
});

// Admin ONLY: Update Blog Post
app.put("/api/blog/:id", authenticateAdmin, (req, res) => {
  const db = loadDb();
  const index = db.blogPosts.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Blog post not found." });
  }

  const updateData = req.body;
  const currentPost = db.blogPosts[index];

  db.blogPosts[index] = {
    ...currentPost,
    title: updateData.title !== undefined ? String(updateData.title) : currentPost.title,
    slug: updateData.slug !== undefined ? String(updateData.slug) : currentPost.slug,
    content: updateData.content !== undefined ? String(updateData.content) : currentPost.content,
    category: updateData.category !== undefined ? String(updateData.category) : currentPost.category,
    featuredImage: updateData.featuredImage !== undefined ? String(updateData.featuredImage) : currentPost.featuredImage,
    seoTitle: updateData.seoTitle !== undefined ? String(updateData.seoTitle) : currentPost.seoTitle,
    metaDescription: updateData.metaDescription !== undefined ? String(updateData.metaDescription) : currentPost.metaDescription,
  };

  saveDb(db);
  res.json(db.blogPosts[index]);
});

// Admin ONLY: Delete Blog Post
app.delete("/api/blog/:id", authenticateAdmin, (req, res) => {
  const db = loadDb();
  const filtered = db.blogPosts.filter((p) => p.id !== req.params.id);

  if (filtered.length === db.blogPosts.length) {
    return res.status(404).json({ error: "Blog post not found." });
  }

  db.blogPosts = filtered;
  saveDb(db);
  res.json({ success: true });
});

// Settings API: Get
app.get("/api/settings", (req, res) => {
  const db = loadDb();
  res.json(db.settings);
});

// Admin ONLY: Update Settings
app.put("/api/settings", authenticateAdmin, (req, res) => {
  const db = loadDb();
  const updateData = req.body;

  db.settings = {
    companyName: updateData.companyName !== undefined ? String(updateData.companyName) : db.settings.companyName,
    phone: updateData.phone !== undefined ? String(updateData.phone) : db.settings.phone,
    whatsapp: updateData.whatsapp !== undefined ? String(updateData.whatsapp) : db.settings.whatsapp,
    email: updateData.email !== undefined ? String(updateData.email) : db.settings.email,
    address: updateData.address !== undefined ? String(updateData.address) : db.settings.address,
    socialLinks: {
      ...db.settings.socialLinks,
      facebook: updateData.socialLinks?.facebook !== undefined ? String(updateData.socialLinks.facebook) : db.settings.socialLinks.facebook,
      instagram: updateData.socialLinks?.instagram !== undefined ? String(updateData.socialLinks.instagram) : db.settings.socialLinks.instagram,
      twitter: updateData.socialLinks?.twitter !== undefined ? String(updateData.socialLinks.twitter) : db.settings.socialLinks.twitter,
      youtube: updateData.socialLinks?.youtube !== undefined ? String(updateData.socialLinks.youtube) : db.settings.socialLinks.youtube,
    }
  };

  saveDb(db);
  res.json(db.settings);
});

// Setup Vite & static serving
async function startServer() {
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
    console.log(`Server environment running on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
