// scripts/hash-passwords.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const MONGODB = process.env.MONGODB || "mongodb://localhost:27017/short-url";
const SALT_ROUNDS = 10;

async function run() {
  await mongoose.connect(MONGODB);
  console.log("Connected to MongoDB for migration");

  const users = await User.find({});
  console.log("Users fetched:", users.length);

  let updated = 0;
  for (const user of users) {
    const pwd = user.password || "";
    // skip if already hashed (bcrypt hashes start with $2a$ / $2b$ / $2y$ typically)
    if (pwd.startsWith("$2a$") || pwd.startsWith("$2b$") || pwd.startsWith("$2y$")) {
      continue;
    }
    const hashed = await bcrypt.hash(pwd, SALT_ROUNDS);
    user.password = hashed;
    await user.save();
    updated++;
    console.log(`Hashed password for user ${user.email}`);
  }

  console.log(`Migration complete. Updated ${updated} users.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});