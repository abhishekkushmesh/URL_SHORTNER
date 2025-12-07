const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
const { checkForAuthentication,restrictTo } = require("./middlewares/auth");
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB(process.env.MONGODB ?? "mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongodb connected")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url", restrictTo(["NORMAL"]), urlRoute);
app.use("/user", userRoute);
app.use("/", staticRoute);



app.get("/url/:shortId", async (req, res) => {
  try {
    const shortId = req.params.shortId;
    console.log("📍 Redirect request for shortId:", shortId);

    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } // ← ADD THIS! Returns updated document
    );

    if (!entry) {
      console.warn("❌ Short ID not found:", shortId);
      return res.status(404).send("Short URL not found");
    }

    console.log("✅ Click recorded!");
    console.log("   Total clicks now:", entry.visitHistory.length);
    console.log("   Redirecting to:", entry.redirectURL);

    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error("❌ Error during redirect:", err.message);
    return res.status(500).send("Internal Server Error");
  }
});
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
