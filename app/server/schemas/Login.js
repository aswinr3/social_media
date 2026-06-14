import Joi from "joi";

const loginSchema = Joi.object({
    email: Joi.string().required(),
    password:Joi.string().required()
})


export const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body)
    if (error) {
        return res.status(400).json({message:"unprocessable content"})
    }
    next();
}