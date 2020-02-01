const request = require('supertest')
const app = require('../app')
const User = require('../models/user')
const {setDatabase, userOneId, userOne, userOneToken} = require('./fixtures/db')

beforeEach(setDatabase)

// afterEach(async() => {
    
// })

test('should signup new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            "name": "test user",
            "email": "test1@example.com",
            "password": "test@123"
        });
    const user = await User.findById(response.body.user._id)

    expect(user).not.toBeNull();
})

test('should should login user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            "email": "unique@example.com",
            "password": "test@123"
        })
        .expect(200); 
})

test('should return 400 when login user does not exist', async () => {
    await request(app)
        .post('/users/login')
        .send({
            "email": "testabc@example.com",
            "password": "test@123"
        })
        .expect(400); 
})

test('should get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOneToken}`)
        .expect(200); 
})

test('should return 400 if authorization fails', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer xjddjfo2uoupfjjeo`)
        .expect(400); 
})

test('should return 400 if authorization is not passed', async () => {
    await request(app)
        .get('/users/me')
        .expect(400); 
})

test('should delete user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOneToken}`)
    
    const user = await User.findById(userOneId)

    expect(user).toBeNull()
})

test('should not delete user and return 400 as authentication failure', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer xjddjfo2uoupfjjeo`)
        .expect(400); 
})

test('upload user profile pic', async () => {
    const response = await request(app)
                        .post('/users/me/avatar')
                        .set('Authorization', `Bearer ${userOneToken}`)
                        .attach('upload', 'src/tests/fixtures/profile-pic.jpg')
                        .expect(200)
    const user = await User.findById(userOneId)

    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update name of the user', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            "name": "test user"
        })
        .expect(200);
    const user = await User.findById(userOneId)
    expect(user.name).toBe('test user')
})

test('should return error when invalid field is updated', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            "location": "test user"
        })
        .expect(400);
    expect(response.body.error).toEqual("Invalid Operation")

})