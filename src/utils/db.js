import mongoose from "mongoose";

const connect = async () => {
  if (mongoose.connections[0].readyState) return;

  try {
    console.log(process.env.MONGO_URL)
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("Mongo Connection successfully established.");
  } catch (error) {
    console.log(error)
    throw new Error("Error connecting to Mongoose");
  }
};

export default connect;