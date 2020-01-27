const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const auth = require('../middlewares/auth')
const User = require('../models/user')
const {sendWelcomeEmail, cancellationEmail} = require('../emails/account')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            return  cb(new Error('File type not supported'))
        }

        return cb(undefined, true)
    }
})

// Create Users
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const tokens = await user.generateToken()
        res.status(201).send({user, tokens})    
    } catch (error) {
        res.status(400).send(error)
    }
})

// Users Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findUserByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.send({user, token})

    } catch (e) {
        res.status(400).send(e)
    }
})

//User Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token 
        })

        await req.user.save()
        res.send('Logged Out Successfully..!!')
    } catch (e) {
        res.status(400).send(e)
    }
})

//User Logout from all platforms
router.post('/users/logout/all', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Logged Out  from all platforms Successfully..!!')
    } catch (e) {
        res.status(400).send(e)
    }
})

//Get all user
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//Get single users
router.get('/users/:userId', async (req, res) => {
    const userId = req.params.userId
    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.send(404)
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Update my user
router.patch('/users/me', auth, async (req, res) => {
    const validOperators = ['name', 'age', 'email', 'password']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every(update => validOperators.includes(update))

    try {
        if (!isValidOperation) {
            return res.status(400).send({error: "Invalid Operation"})
         }
        
        //findByIdAndUpdate() bypasses the middleware changes as it runs directly on the database.
        //therefore we will explicitly save this user to make it accessible to the middleware
        
        //const user = await User.findByIdAndUpdate(userId, req.body, {new: true, runValidators: true})

        updates.forEach( update => { req.user[update] = req.body[update] })
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete user by Id
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndRemove(userId)
        // if (!user) {
        //     return res.send(404)
        // }
        const user = req.user
        await req.user.remove()
        cancellationEmail(user.email, user.name)
        res.status(204).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

//upload user profile image
router.post('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {
    //for editing the image e.g croping or converting it to differnt types we can use
    // npm module 'sharp'. The below statement is a small example for converting the 
    //image as we want and update the buffer
    req.user.avatar = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    //req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//delete user profile image
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//get image of the user 
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error ('No profile image')
        }
        res.set('Content-Type', 'image/jpeg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router