const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../index');
const User = require('../../models/user');
const { connectDB, disconnectDB } = require('../../config/db');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let mongoServer;
const BASE_URL = process.env.BASE_URL;
const PHOTO_PATH = path.resolve('tests/fixtures/image.jpeg'); // Single variable for photo location

describe('User CRUD Operations', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectDB(mongoServer.getUri());
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Create User', () => {
    it('should create a student with valid data', async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      console.log('Photo:', photo);
      const response = await request(app)
        .post('/api/users')
        .send({
          regNo: 12345,
          name: 'Test Student',
          type: 'student',
          photo: `data:image/jpeg;base64,${photo}`
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        regNo: 12345,
        name: 'Test Student',
        type: 'student'
      });
    });

    it('should create a guest with valid data', async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      const response = await request(app)
        .post('/api/users')
        .send({
          nationalId: 98765432,
          name: 'Test Guest',
          type: 'guest',
          photo: `data:image/jpeg;base64,${photo}`
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        nationalId: 98765432,
        name: 'Test Guest',
        type: 'guest'
      });
    });

    it('should not create a student without regNo', async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test Student',
          type: 'student',
          photo: `data:image/jpeg;base64,${photo}`
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Student must have regNo');
    });

    it('should not create a guest without nationalId', async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test Guest',
          type: 'guest',
          photo: `data:image/jpeg;base64,${photo}`
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Guest must have nationalId');
    });

    it('should not create a user with both regNo and nationalId', async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      const response = await request(app)
        .post('/api/users')
        .send({
          regNo: 12345,
          nationalId: 98765432,
          name: 'Test User',
          type: 'student',
          photo: `data:image/jpeg;base64,${photo}`
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User cannot have both regNo and nationalId');
    });

    it('should not create a user with missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          type: 'student'
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/name cannot be empty/i);
      expect(response.body.error).toMatch(/photo cannot be empty/i);
    });

    it('should not create a user with invalid photo format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          regNo: 12345,
          name: 'Test Student',
          type: 'student',
          photo: 'invalid_base64_string'
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid photo format');
    });
  });

  describe('Read User', () => {
    let user;

    beforeEach(async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      user = await User.create({
        regNo: 12345,
        name: 'Test Student',
        photo: `data:image/jpeg;base64,${photo}`,
        type: 'student'
      });
    });

    it('should get a user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${user._id}`);

      console.log('Response:', response.body);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        regNo: 12345,
        name: 'Test Student',
        type: 'student'
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get(`/api/users/${new mongoose.Types.ObjectId()}`);

      console.log('Response:', response.body);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Update User', () => {
    let user;

    beforeEach(async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      user = await User.create({
        regNo: 12345,
        name: 'Test Student',
        photo: `data:image/jpeg;base64,${photo}`,
        type: 'student'
      });
    });

    it('should update a user with valid data', async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send({
          name: 'Updated Student',
          type: 'student',
          photo: `data:image/jpeg;base64,${photo}`
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        regNo: 12345,
        name: 'Updated Student',
        type: 'student'
      });
    });

    it('should return 404 for non-existent user', async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      const response = await request(app)
        .put(`/api/users/${new mongoose.Types.ObjectId()}`)
        .send({
          name: 'Updated Student',
          type: 'student',
          photo: `data:image/jpeg;base64,${photo}`
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should not update a user with both regNo and nationalId', async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send({
          regNo: 12345,
          nationalId: 98765432,
          name: 'Updated User',
          type: 'student',
          photo: `data:image/jpeg;base64,${photo}`
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User cannot have both regNo and nationalId');
    });

    it('should not update a user with invalid photo format', async () => {
      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send({
          name: 'Updated Student',
          type: 'student',
          photo: 'invalid_base64_string'
        });

      console.log('Response:', response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid photo format');
    });
  });

  describe('Delete User', () => {
    let user;

    beforeEach(async () => {
      const photo = fs.readFileSync(PHOTO_PATH, { encoding: 'base64' });
      user = await User.create({
        regNo: 12345,
        name: 'Test Student',
        photo: `data:image/jpeg;base64,${photo}`,
        type: 'student'
      });
    });

    it('should delete a user by ID', async () => {
      const response = await request(app)
        .delete(`/api/users/${user._id}`);

      console.log('Response:', response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deleted successfully');

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete(`/api/users/${new mongoose.Types.ObjectId()}`);

      console.log('Response:', response.body);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });
});