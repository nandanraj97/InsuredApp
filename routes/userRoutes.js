
const express = require("express");
const { Worker } = require("worker_threads");
const path = require("path");
const multer = require("multer");
const { User, Policy } = require("../models/models");

const router = express.Router();
const upload = multer({ dest: "uploads/" });


router.post("/users", async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
router.get("/users", async (req, res) => {
try {
    const users = await User.find();
    res.json(users);
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

router.post("/upload", upload.single("file"), (req, res) => {
    const filePath = req.file.path;
    const worker = new Worker(path.resolve(__dirname, "../worker.js"), { workerData: filePath });

    worker.on("message", (msg) => res.json({ message: "Upload successful", details: msg }));
    worker.on("error", (err) => res.status(500).json({ error: err.message }));
});

router.get("/search/:username", async (req, res) => {
    try {
        const user = await User.findOne({ firstName: req.params.username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const policies = await Policy.find({ userId: user._id }).populate("categoryId carrierId");
        res.json({ user, policies });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/aggregate", async (req, res) => {
    try {
        const result = await Policy.aggregate([
            { $group: { _id: "$userId", policyCount: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
            { $unwind: "$userDetails" }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
