const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello, Railway!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Enable CORS for frontend communication
app.use(cors());

// Configure Multer for file uploads (stores in memory)
const upload = multer({ storage: multer.memoryStorage() });

app.post("/submit", upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "signature", maxCount: 1 }
]), async (req, res) => {
    try {
        // Get form fields
        const { name, email, phone, address, college, percentage } = req.body;

        // Get uploaded files
        const resume = req.files["resume"] ? req.files["resume"][0] : null;
        const photo = req.files["photo"] ? req.files["photo"][0] : null;
        const signature = req.files["signature"] ? req.files["signature"][0] : null;

        // Setup Nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL, // Sender email
                pass: process.env.PASSWORD, // App password (not normal password)
            },
        });

        // Email message options
        let mailOptions = {
            from: process.env.EMAIL,
            to: process.env.RECEIVER_EMAIL, // Receiver email from .env
            subject: "New Student Application",
            text: `New student application received.\n\n
            Name: ${name}\n
            Email: ${email}\n
            Phone: ${phone}\n
            Address: ${address}\n
            College: ${college}\n
            Percentage: ${percentage}`,
            attachments: [
                resume && { filename: resume.originalname, content: resume.buffer },
                photo && { filename: photo.originalname, content: photo.buffer },
                signature && { filename: signature.originalname, content: signature.buffer },
            ].filter(Boolean), // Remove null values
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // ✅ Return JSON response
        res.status(200).json({ message: "Application Submitted Successfully!" });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ message: "Failed to submit application", error: error.toString() });
    }
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
