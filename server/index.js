const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
require("./src/models/connection");

const { PORT, MONGODB_URI } = require("./src/config");
const { API_ENDPOINT_NOT_FOUND_ERR, SERVER_ERR } = require("./src/errors");

// routes
const postRoutes = require("./src/routes/post.route");

// init express app
const app = express();
// middlewares
app.use(express.json());

app.use(cors());
// app.use(
//   cors({
//     credentials: true,
//     origin: ORIGIN,
//     optionsSuccessStatus: 200,
//   })
// );

app.get("/", (req, res) => {
  res.status(200).json({
    type: "success",
    message: "server is up and running",
    data: null,
  });
});

// routes middlewares
app.use("/api/post", postRoutes);

// page not found error handling  middleware

app.use("*", (req, res, next) => {
  console.log("index.js-->req", req);
  const error = {
    status: 404,
    message: API_ENDPOINT_NOT_FOUND_ERR,
  };
  next(error);
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || SERVER_ERR;
  const data = err.data || null;
  res.status(status).json({
    type: "error",
    message,
    data,
  });
});

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("database connected");

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();

module.exports = app;
