const Joi = require('joi');

const userValidate = data => {
    const userSchema = Joi.object({
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(4).max(32).required()
    })
    return userSchema.validate(data)
}

const passwordValidate = data => {
    const schema = Joi.object({
        currentPassword: Joi.string().min(4).max(32).required().label('current password'),
        confirmPassword: Joi.any().equal(Joi.ref('currentPassword')).required()
        .label('confirm password').options({ messages: { 'any.only': '{{#label}} does not match'} }),
        newPassword: Joi.string().min(4).max(32).required().label('new password')
    })
    return schema.validate(data)
}

module.exports = {
    userValidate, passwordValidate
}