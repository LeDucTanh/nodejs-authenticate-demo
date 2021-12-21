const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt')

const UserSchema = new schema({
    username: {
        type: String,
        lowercase: true,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    }
})

UserSchema.pre('save', async function(next) {
    try {
        console.log(this.username + this.password)
        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(this.password, salt)
        this.password = hashPass
        next()
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.isCheckPassword = async function(password) {
    // try {
    //     return await bcrypt.compare(password, this.password)
    // } catch (error) {
    // }
    return new Promise( (resolve, reject) => {
        bcrypt.compare(password, this.password, (err, success) => {
            if (err) reject(err)
            resolve(success)
        })
    })
}

module.exports = mongoose.model('users', UserSchema)