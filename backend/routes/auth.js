import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already exists" });

  // Password hash
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash });

  try {
    await user.save();
    res.json({ message: "Register done" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// Login Route (already provided before, but for completeness)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Please enter correct details or register yourself first." });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Please enter correct details or register yourself first." });

  // Login Success
  const token = jwt.sign(
    { userId: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || "SECRET"
  );
  res.json({ token, name: user.name, email: user.email, role: user.role });
});

// Admin Login Route
router.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;

  // Check for specific admin credentials
  if (username !== "Admin" || password !== "admin@1234") {
    return res.status(400).json({ message: "Invalid admin credentials" });
  }

  // Create or find admin user
  let adminUser = await User.findOne({ email: "admin@system.com" });
  if (!adminUser) {
    const hashPassword = await bcrypt.hash("admin@1234", 10);
    adminUser = new User({
      name: "Admin",
      email: "admin@system.com",
      password: hashPassword,
      role: "admin"
    });
    await adminUser.save();
  }

  const token = jwt.sign(
    { userId: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
    process.env.JWT_SECRET || "SECRET"
  );
  res.json({ token, name: adminUser.name, email: adminUser.email, role: adminUser.role });
});

// Get all users (Admin only)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const users = await User.find({ 
      $and: [
        { role: { $ne: 'admin' } }, // Exclude admin users
        {
          $or: [
            { role: 'user' },
            { role: { $exists: false } }, // Include users without role field (legacy users)
            { role: null }
          ]
        }
      ]
    }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// Update user (Admin only)
router.put("/users/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Delete user (Admin only)
router.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

// Create demo users for testing (Admin only)
router.post("/create-demo-users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const demoUsers = [
      { name: "John Doe", email: "john@example.com", password: "password123" },
      { name: "Jane Smith", email: "jane@example.com", password: "password123" },
      { name: "Bob Johnson", email: "bob@example.com", password: "password123" }
    ];

    const createdUsers = [];
    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const hash = await bcrypt.hash(userData.password, 10);
        const user = new User({ 
          name: userData.name, 
          email: userData.email, 
          password: hash,
          role: "user"
        });
        await user.save();
        createdUsers.push({ name: user.name, email: user.email });
      }
    }

    res.json({ 
      message: "Demo users created successfully", 
      created: createdUsers,
      count: createdUsers.length 
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating demo users", error: error.message });
  }
});

export default router;