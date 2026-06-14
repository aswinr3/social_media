import joi from "joi";

const createUserSchema = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().allow('', null).optional(),
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const validateCreateUser = (req, res, next) => {
  const { error } = createUserSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({
        message: "Validation failed",
      });
  }
  next();
};
