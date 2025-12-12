const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { authenticateToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// GET /api/profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: "Failed to fetch profile", 
      error: error.message 
    });
  }
});

// PUT /api/profile
router.put("/", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      dob,
      gender,
      college,
      year,
      department,
      rollNumber,
      phoneNumber,
      socialProfiles,
      codingProfiles,
      skills
    } = req.body;

    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (dob !== undefined) updateFields.dob = dob;
    if (gender !== undefined) updateFields.gender = gender;
    if (college !== undefined) updateFields.college = college;
    if (year !== undefined) updateFields.year = year;
    if (department !== undefined) updateFields.department = department;
    if (rollNumber !== undefined) updateFields.rollNumber = rollNumber;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;

    if (socialProfiles !== undefined)
      updateFields.socialProfiles = socialProfiles;

    if (codingProfiles !== undefined)
      updateFields.codingProfiles = codingProfiles;

    if (skills !== undefined)
      updateFields.skills = skills; // must be array → your frontend already sends array

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: "Failed to update profile", 
      error: error.message 
    });
  }
});


// Profile Pic Upload - POST /api/profile/upload-pic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/profile-pics";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/upload-pic", authenticateToken, upload.single("profilePic"), async (req, res) => {
  const filePath = `/uploads/profile-pics/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profilePic: filePath },
    { new: true }
  );
  res.json({ message: "Image uploaded", url: filePath });
});

module.exports = router;
