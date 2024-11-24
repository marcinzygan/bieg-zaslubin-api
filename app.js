const express = require("express");
const AppError = require("./utils/AppError");
const runnersRouter = require("./routes/runnersRouter");

const app = express();
// READ DATA FROM BODY
app.use(express.json({ limit: "10kb" }));
// ROUTES
app.use("/api/v1/runners", runnersRouter);

//// UNHANDLED ROUTES
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server. Please check documentation for available routes.`,
      404
    )
  );
});

//// ERROR HANDLING MIDDLEWARE
// app.use(errorController);

module.exports = app;
