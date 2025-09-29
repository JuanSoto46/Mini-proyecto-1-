const mongoose = require("mongoose");

// Connect to MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the app if connection fails
  }
};

// Disconnect from MongoDB database
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error.message);
  }
};

// Synchronize indexes for all registered mongoose models
async function syncAllIndexes() {
  const { models } = mongoose;
  for (const name of Object.keys(models)) {
    if (typeof models[name].syncIndexes === "function") {
      await models[name].syncIndexes();
    }
  }
}

// Export functions for use in other parts of the project
module.exports = { connectDB, disconnectDB, syncAllIndexes };
