const mongoose = require('mongoose')
const nconf = require('nconf')

nconf.use('file', {file: './config/dev.json'})

mongoose.connect(nconf.get('mongodbUrl'), 
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
