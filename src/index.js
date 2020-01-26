const express = require('express')
const nconf = require('nconf')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')

const app = express()

nconf.use('file', {file: './config/dev.json'})

const port = nconf.get('port')

app.use(express.json())

app.use('/', [userRouter, taskRouter])

 app.listen(port, () => {
     console.log(`App is listening on the: ${port}`)
    })

// const Task = require('./models/tasks')
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('5e2a4a97cd9f419aa836c15a')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     const user = await User.findById('5e2a4a7fcd9f419aa836c157')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()