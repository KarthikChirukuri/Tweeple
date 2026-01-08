require("dotenv").config();
require("./raspHook"); // runtime hooks

const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Post = require("./models/post.js");
const User = require("./models/user.js");
const TestUser = require("./models/testUser");
const raspMiddleware = require("./Middlewares/raspMiddleware");
const logger = require("./logger");

const dbUrl = process.env.ATLASDB_URL;

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = "mySecretKey";

// -------------------- MIDDLEWARES -------------------- //
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

// 👉 RASP MIDDLEWARE MUST COME HERE (BEFORE ROUTES)
// app.use(raspMiddleware);

// -------------------- MONGO CONNECTION -------------------- //
main()
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

async function main() {
  await mongoose.connect(dbUrl);
}



// -------------------- VIEW ENGINE -------------------- //
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- ATTACH LOGGED-IN USER -------------------- //
async function attachUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("username");
    req.user = user;
  } catch (err) {
    req.user = null;
  }
  next();
}
app.use(attachUser);

// -------------------- ROUTES -------------------- //

// Login
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User Not Found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "1h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000,
    });
    res.redirect("/");
  } catch (err) {
    console.error("[Login Error]", err);
    res.status(500).send("Server Error");
  }
});

// Signup
app.get("/signUp", (req, res) => {
  res.render("signUp.ejs");
});

app.post("/signUp", async (req, res) => {
  try {
    let { username, password, confirmPassword } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.json({ error: "User already exists" });

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error("[Signup Error]", err);
    res.status(500).send("Server Error");
  }
});

// Home route - show all posts
app.get("/", async (req, res) => {
  let posts = await Post.find();
  res.render("index.ejs", { posts, currentUser: req.user });
});

// New Post form
app.get("/post/new", (req, res) => {
  // Pass title if present, else null
  const title = req.query.title || null;
  res.render("new.ejs", { title });
});

// Create new post
app.post("/posting", async (req, res) => {
  try {
    let { title, content } = req.body;
    let newPost = new Post({ title, content });
    await newPost.save();
    console.log(" Post saved successfully");
    res.redirect("/");
  } catch (err) {
    console.error(" Error saving post:", err);
    res.status(500).send("Error saving post");
  }
});

// Show a post
app.get("/post/:id", async (req, res) => {
  let { id } = req.params;
  let post = await Post.findById(id);
  if (!post) return res.status(404).send("Post not found");
  res.render("showUser.ejs", { post });
});

// Edit post
app.get("/post/:id/edit", async (req, res) => {
  let { id } = req.params;
  let post = await Post.findById(id);
  res.render("edit.ejs", { post });
});

// Update post
app.patch("/post/:id", async (req, res) => {
  let { id } = req.params;
  let { content } = req.body;
  await Post.findByIdAndUpdate(id, { content }, { runValidators: true, new: true });
  res.redirect("/");
});

// Delete post
app.delete("/post/:id", async (req, res) => {
  let { id } = req.params;
  await Post.findByIdAndDelete(id);
  console.log("Post deleted:", id);
  res.redirect("/");
});

// Subscription page
app.get("/subscription", (req, res) => {
  res.render("subscription.ejs");
});

// RASP Logs Dashboard (Admin view)
app.get("/admin/rasp-logs", async (req, res) => {
  try {
    const Log = require("./models/log");
    const logs = await Log.find().sort({ createdAt: -1 }).limit(20); // latest 20 logs
    res.render("raspLogs.ejs", { logs });
  } catch (err) {
    console.error("[RASP Logs Error]", err);
    res.status(500).send("Error fetching RASP logs");
  }
});

// index.js (add near other routes, requires body parser)
app.post("/report-incident", async (req, res) => {
  try {
    const { incidentId } = req.body;
    if (!incidentId) return res.redirect("/");

    const Log = require("./models/log");
    await Log.findByIdAndUpdate(incidentId, { reported: true, reportedAt: new Date() });

    // optional: notify admin (email/slack) — implement later
    res.render("raspBlocked", { 
      incidentId,
      rule: "Reported",
      message: "Thank you. Admin will review this incident.",
      time: new Date(),
      ip: req.ip,
      payloadSnippet: "(hidden)"
    });
  } catch (err) {
    console.error("report-incident error:", err);
    res.redirect("/");
  }
});

//-------------just for testing---------------------//
// Helper: seed test data (call once before demo)
app.get("/demo/seed-testusers", async (req, res) => {
  try {
    // Remove existing demo docs to start fresh
    await TestUser.deleteMany({});
    await TestUser.create([
      { name: "Demo One", email: "demo1@example.com" },
      { name: "Demo Two", email: "demo2@example.com" }
    ]);
    res.send({ ok: true, message: "Test users seeded" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Seeding failed");
  }
});

// View current test users (safe)
app.get("/demo/list-testusers", async (req, res) => {
  const users = await TestUser.find();
  res.json({ users });
});

// Vulnerable demo endpoint - simulates backend modification
// WARNING: Only for controlled demo on your local environment.
app.post("/demo/delete-testuser", async (req, res) => {
  const payload = req.body.input || "";

  // simulate check that an attacker might send
  // if payload contains suspicious pattern -> perform deletion (simulated "attack success")
  if (payload.includes("' OR 1=1 --") || /<script/i.test(payload)) {
    // perform a destructive action on the test collection only
    try {
      // delete one test user to show effect
      const deleted = await TestUser.findOneAndDelete({});
      return res.json({
        message: "Demo: attack executed, test user deleted",
        deleted: deleted ? { id: deleted._id, name: deleted.name } : null
      });
    } catch (e) {
      return res.status(500).json({ error: "Deletion failed", detail: e.message });
    }
  } else {
    return res.json({ message: "Demo: payload not considered malicious" });
  }
});

app.post("/demo/vulnerable-delete", async (req, res) => {
  const query = req.body.query;     // attacker input
  const result = await TestUser.deleteMany(query); // Mongo interprets it
  res.json({ deleted: result.deletedCount });
});


//path traversal testing
app.get("/demo/file", (req, res) => {
  const file = req.query.name;
  res.sendFile(path.join(__dirname, file));
});


// -------------------- SERVER -------------------- //
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
