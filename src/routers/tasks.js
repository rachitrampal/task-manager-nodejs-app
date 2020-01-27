const express = require('express')
const router = new express.Router()
const auth = require('../middlewares/auth')
const Task = require('../models/tasks')

// Create Tasks
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    })

    try {
       await task.save()
       res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

//delete task by Id
router.delete('/tasks/:taskId', auth, async (req, res) => {
    const taskId = req.params.taskId
    try {
        const task = await Task.findOneAndRemove({_id: taskId, owner: req.user._id})
        if (!task) {
            return res.send(404)
        }
        res.status(204).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Update task by Id
router.patch('/tasks/:taskId', auth, async (req, res) => {
    const taskId = req.params.taskId
    const validOperators = ['description', 'completed']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every(update => validOperators.includes(update))

    try {
        if (!isValidOperation) {
            return res.status(400).send("Invalid Operation")
        }

        //findByIdAndUpdate() bypasses the middleware changes as it runs direcctly on the database.
        //therefore we will explicitly save this user to make it accessible to the middleware

        //const task = await Task.findByIdAndUpdate(taskId, req.body, {new: true, runValidators: true})

        const task = await Task.findOne({_id: taskId, owner: req.user._id})
        updates.forEach( update => task[updates] = req.body[update])
        await task.save()

        if (!task) {
            return res.send(404)
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//get all tasks 
router.get('/tasks/me', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.sortBy) {
        const sortBy = req.query.sortBy.split('~')
        sort[sortBy[0]] = sortBy[1] === 'desc' ? -1 : 1
    }

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    try {
        //const tasks = await Task.find({})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(e)
    }
})

//get task by Id
router.get('/tasks/:taskId', auth, async (req, res) => {
    const taskId = req.params.taskId
    try {
        const task = await Task.findOne({_id: taskId, owner: req.user._id})
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router