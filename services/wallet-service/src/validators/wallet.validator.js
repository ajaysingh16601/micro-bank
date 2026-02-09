const Joi = require('joi');

const creditSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required',
  }),
  description: Joi.string().max(200).optional(),
});

const debitSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required',
  }),
  description: Joi.string().max(200).optional(),
});

module.exports = {
  creditSchema,
  debitSchema,
};
