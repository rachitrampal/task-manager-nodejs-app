const jwt = require('jsonwebtoken')
const nconf = require('nconf')
const User = require('../models/user')

nconf.use('file', {file: './config/dev.json'})

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, nconf.get('jwtTokenSecret'))
        const user = await User.findOne({_id: decode._id, 'tokens.token': token})

        if (!user){
            throw new Error()
        }

        req.token = token
        req.user = user
        next()

    } catch (e){
        res.status(400).send({ error: 'Please Authorize..'})
    }
    
}

module.exports = auth