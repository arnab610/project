const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    Name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address')
            }
        }
    },
    Phone_No: {
        type: Number,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (value.length <= 0 || value.length > 10) {
                throw new Error('Invalid Phone number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

// hiding private data of user such as password and auth-tokens
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.Phone_No
    delete userObject._id
    delete userObject.__v

    return userObject
}

// generating auth token for user after signup and each signin
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// logging in user by email and password
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// hash the password before saving the user
userSchema.pre('save', async function(next) {
    const currentUser = this

    if (currentUser.isModified('password')) {
        currentUser.password = await bcrypt.hash(currentUser.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User