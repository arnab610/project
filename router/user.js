const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')

const router = express.Router()

// create a new user
router.post('/user/signup', async(req, res) => {
    const currentUser = new User(req.body)

    try {
        await currentUser.save()
        const token = await currentUser.generateAuthToken()
        res.status(201).send({
            result: 'Singed up successfully',
            user: currentUser,
            token
        })
    } catch (error) {
        res.send({
            error
        })
    }
})

// user login
router.post('/user/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({
            result: 'logged in successfully',
            user,
            token
        })
    } catch (error) {
        res.send({
            error
        })
    }
})

// get profile
router.get('/user/detail', auth, async(req, res) => {
    res.send({
        user: req.user
    })
})

module.exports = router