// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const userRoutes = require("./routes/userRoutes");
// const body_parser = require("body-parser");



// const app = express();
// app.use(express.json()); 
// app.use(body_parser.json())

// app.use("/api", userRoutes);


// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.error("MongoDB Connection Error:", err));

// app.get("/", (req, res) => {
//   res.send("Welcome to the API");
// });


// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const body_parser = require("body-parser");
const os = require("os");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(body_parser.json());

// Routes
app.use("/api", userRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// ==========================
// 🚀 Task 2: Monitor CPU Usage & Restart Server
// ==========================
async function getCPUUsage() {
    return new Promise((resolve) => {
        const cpus = os.cpus();
        let totalLoad = 0;
        let totalIdle = 0;

        cpus.forEach((cpu) => {
            const { user, nice, sys, idle } = cpu.times;
            totalLoad += user + nice + sys;
            totalIdle += idle;
        });

        const total = totalLoad + totalIdle;
        const usage = (totalLoad / total) * 100; 
        resolve(usage.toFixed(2)); 
    });
}

async function monitorCPU() {
    const usage = await getCPUUsage();
    console.log(`CPU Usage: ${usage}%`);

    if (usage > 70) {
        console.log("🔥 High CPU Usage Detected! Restarting Server...");
        exec("pm2 restart my-server", (err, stdout, stderr) => {
            if (err) {
                console.error("❌ Restart Error:", err);
            } else {
                console.log("✅ Server Restarted Successfully");
            }
        });
    }
}

setInterval(monitorCPU, 5000);

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
