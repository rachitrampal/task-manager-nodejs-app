const request = require('supertest')
const User = require('../models/user')
const app = require('../app')

beforeEach(async () => {
    await User.deleteMany()
})

test('should signup new user', async () => {
    await request(app).post('/users').send({
        "name": "test user",
        "email": "test@example.com",
        "password": "test@123"
    }).expect(201); 
})