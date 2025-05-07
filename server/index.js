const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const userRouter = require("./routes/authRoutes");
const dashboardRouter = require("./routes/userDashboardRoutes");
// const paymentRouter = require("./routes/paymentRoute");
const adminRouter = require("./routes/adminRoutes");
const eventRouter = require("./routes/eventRoutes");
const swaggerSpec = require("./swagger");
const swaggerUi = require("swagger-ui-express")

// const checkInRouter = require("./routes/checkInRoutes");

dotenv.config();

// Connect to MongoDB
console.log("Connecting to MongoDB...");
mongoose
    .connect(process.env.MONGO_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB!");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Load models
require("./models/otpAuth");
require("./models/user");
require("./models/admin");
require("./models/event");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use(cookieParser());
app.use(cors());

// Setup routes
// app.use("/", paymentRouter);
app.use("/user", userRouter);
app.use("/user", dashboardRouter);
app.use("/", adminRouter);
app.use("/", eventRouter);

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {explorer: true}));


// Default route
app.get("/", (req, res) => {
    res.send("Event Management Microservices API.");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on 🚀 port ${PORT}`);
});
