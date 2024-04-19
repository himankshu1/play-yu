// creating a higher order function to handle any asynchronous function (takes a callback function as an argument)

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req,res,next)).catch((error) => next(error));
  };
};

export default asyncHandler;
