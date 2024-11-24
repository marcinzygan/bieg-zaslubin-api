const AppError = require("../utils/AppError");
const Runner = require("../models/runnersModel");

exports.createRunner = async (req, res, next) => {
  try {
    // Create new product
    console.log(req.body);

    const newRunner = await Runner.create(req.body);
    console.log(newRunner);

    res.status(200).json({
      status: "success",
      data: {
        runner: newRunner,
      },
    });
  } catch (err) {
    console.log(err);

    next();
  }
};

exports.getAllRunners = async (req, res, next) => {
  try {
    // BUILD QUERY
    const runners = await Runner.find(req.query);
    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      numberOfUsers: runners.length,
      data: {
        runners: runners,
      },
    });
    // ERROR HANDLING
  } catch (err) {
    console.log(err);

    next();
  }
};

exports.updateRunner = async (req, res, next) => {
  try {
    // Find runner by id and update
    const foundRunner = await Runner.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        // options to return new updated runner
        new: true,
        // run validators again to validate the incoming data
        runValidators: true,
      }
    );
    // If there is no runner show error , always return , to not show two responses.
    if (!foundRunner) {
      return next(new AppError(`could not find the id: ${req.params.id}`, 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        product: foundRunner,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
