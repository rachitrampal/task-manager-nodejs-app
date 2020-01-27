const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, 
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// const task1 = new Tasks ({
//     description: 'desc of task 1',
//     completed: true
// })

// task1.save().then(() => {
//     console.log(task1)
// }).catch( (error) => {
//     console.log('Error: ', error)
// })
