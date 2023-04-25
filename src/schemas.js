import Joi from "joi"

export const userSignUpPageSchema = Joi.object({
    nome: Joi.string().min(1).required(),
    email: Joi.string().email().min(1).required(),
    senha: Joi.string().min(3).required(),
    confirmSenha: Joi.any().valid(Joi.ref('senha')).required()
})