const mongoose = require("mongoose");
const { MONGODB_URI } = require("../config");

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;

conn.on("error", () => console.error.bind(console, "connection error"));

conn.once("open", () => console.info("Connection Done"));

module.exports = conn;
