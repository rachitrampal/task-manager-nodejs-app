const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const nconf = require('nconf')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')

nconf.use('file', {file: './config/dev.json'})

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        default: 18,
        min: 18,
        validate(value) {
            if (value < 0){
                throw new Error('Age should be positive number')
            }
        },
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error ('Invalid Email')
            }
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if (validator.contains(value, 'password')) {
                throw new Error('Password should not contain term "password" ')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: Buffer,
}, {
    timestamps: true,
})

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner',
})

//remove tokens and password properties from the user response
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject() 
    delete userObject.password
    delete userObject.tokens
    delete user.avatar
    
    return userObject
}
//Add custon instance function in the user instance
userSchema.methods.generateToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, nconf.get('jwtTokenSecret'), {expiresIn: '7 days'})
    user.tokens = user.tokens.concat({token})

    await user.save()
    return token
}

//Add custom model function in the User model

userSchema.statics.findUserByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if (!user) {
        throw new Error ('User login Failed')
    }

    const isMatch = await bcryptjs.compare(password, user.password)

    if (!isMatch) {
        throw new Error ('User login Failed')
    }

    return user
}

//adding middleware to hash the password
userSchema.pre('save', async function(next) {
    const user = this
    
    if(user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8)
    }

    next()
})

//adding middleware to remove all tasks before removing the user
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User