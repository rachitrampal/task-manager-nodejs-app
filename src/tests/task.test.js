const request = require('supertest')
const app = require('../app')
const Task = require('../models/tasks')
const {setDatabase, userOneId, taskThree, userOneToken} = require('./fixtures/db')

beforeEach(setDatabase)

test('Create a new task', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            "description": "This is the first test"
        })
        .expect(201)
})

test('Get specific user tasks', async () => {
    const response = await request(app)
        .get('/tasks/me')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send()
        .expect(200)
    const tasks = response.body
    expect(tasks.length).toBe(2)
    expect(tasks[0].description).toBe('First Task')
    expect(tasks[1].description).toBe('Second Task')
})

test('Should error when one user tries to delete another user task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOneToken}`)
        .send()
        .expect(404)
    const task = Task.findById(taskThree._id)
    expect(task).not.toBeNull()
})