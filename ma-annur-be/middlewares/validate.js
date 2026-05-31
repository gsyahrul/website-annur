const { validationResult } = require('express-validator');

/**
 * Middleware: Handle express-validator validation results.
 * Returns a 422 response with detailed error messages if validation fails.
 * Place this AFTER validator chains in the route middleware stack.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validasi gagal.',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = validate;
