const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  console.log(req.body, errors)
  if (!errors.isEmpty()) {
    throw new ValidationError(
      Object.values(errors.mapped())
        .map(err => err.msg)
        .join(', ')
    );
  }
  next();
};

module.exports = validate;