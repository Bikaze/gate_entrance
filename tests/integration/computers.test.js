const mongoose = require('mongoose');
const request = require('supertest');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../index');
const Computer = require('../../models/computer');
const User = require('../../models/user');
const QRCode = require('../../models/qrcode');
const { connectDB, disconnectDB } = require('../../config/db');

let mongoServer;
const generateValidQRCode = () => crypto.randomBytes(32).toString('hex');

describe('Computer Registration System', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectDB(mongoServer.getUri());
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      Computer.deleteMany({}),
      User.deleteMany({}),
      QRCode.deleteMany({})
    ]);
  });

  describe('POST /api/computers/:registrationId', () => {
    let validQRCode, testUser, testGuest;

    beforeEach(async () => {
      validQRCode = generateValidQRCode();
      await QRCode.create({ code: validQRCode, isUsed: false });

      [testUser, testGuest] = await Promise.all([
        User.create({
          regNo: 12345,
          name: 'Test Student',
          photo: 'http://example.com/photo.jpg',
          type: 'student'
        }),
        User.create({
          nationalId: 98765432,
          name: 'Test Guest',
          photo: 'http://example.com/guest.jpg',
          type: 'guest'
        })
      ]);
    });

    it('should register computer for student with valid QR code', async () => {
      const response = await request(app)
        .post(`/api/computers/${validQRCode}`)
        .send({
          regNo: testUser.regNo,
          serialNo: 'SN123456',
          brand: 'Dell'
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: 'Computer registered successfully',
        registrationId: validQRCode
      });

      const qrCode = await QRCode.findOne({ code: validQRCode });
      expect(qrCode.isUsed).toBe(true);
    });

    it('should register computer for guest with valid QR code', async () => {
      const response = await request(app)
        .post(`/api/computers/${validQRCode}`)
        .send({
          nationalId: testGuest.nationalId,
          serialNo: 'SN789012',
          brand: 'HP'
        });

      expect(response.status).toBe(201);
    });

    it('should prevent duplicate serial number registration', async () => {
      await Computer.create({
        registrationId: generateValidQRCode(),
        serialNo: 'SN123456',
        brand: 'Dell',
        owner: testUser._id
      });

      const response = await request(app)
        .post(`/api/computers/${validQRCode}`)
        .send({
          regNo: testUser.regNo,
          serialNo: 'SN123456',
          brand: 'Dell'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Serial number already registered');
    });
  });

  describe('GET /api/computers/verify/:registrationId', () => {
    it('should return owner details for valid registration', async () => {
      const user = await User.create({
        regNo: 12345,
        name: 'Test Student',
        photo: 'http://example.com/photo.jpg',
        type: 'student'
      });

      const registrationId = generateValidQRCode();
      await Computer.create({
        registrationId,
        serialNo: 'SN123456',
        brand: 'Dell',
        owner: user._id
      });

      const response = await request(app)
        .get(`/api/computers/verify/${registrationId}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        photoLink: 'http://example.com/photo.jpg',
        regNo: 12345,
        names: 'Test Student',
        serialNo: 'SN123456'
      });
    });
  });

  describe('GET /api/computers/search', () => {
    it('should search computers by student regNo', async () => {
      const user = await User.create({
        regNo: 12345,
        name: 'Test Student',
        photo: 'http://example.com/photo.jpg',
        type: 'student'
      });

      await Computer.create([
        {
          registrationId: generateValidQRCode(),
          serialNo: 'SN123456',
          brand: 'Dell',
          owner: user._id
        },
        {
          registrationId: generateValidQRCode(),
          serialNo: 'SN789012',
          brand: 'HP',
          owner: user._id
        }
      ]);

      const response = await request(app)
        .get('/api/computers/search')
        .query({ 
          regNo: 12345,
          page: 1,
          limit: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.computers).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should search computers by guest nationalId', async () => {
      const guest = await User.create({
        nationalId: 98765432,
        name: 'Test Guest',
        photo: 'http://example.com/guest.jpg',
        type: 'guest'
      });

      await Computer.create({
        registrationId: generateValidQRCode(),
        serialNo: 'SN123456',
        brand: 'Dell',
        owner: guest._id
      });

      const response = await request(app)
        .get('/api/computers/search')
        .query({ nationalId: 98765432 });

      expect(response.status).toBe(200);
      expect(response.body.computers).toHaveLength(1);
    });
  });

  describe('PUT /api/computers/:registrationId', () => {
    let validQRCode, existingUser, existingComputer;

    beforeEach(async () => {
      existingUser = await User.create({
        regNo: 12345,
        name: 'Test Student',
        photo: 'http://example.com/photo.jpg',
        type: 'student'
      });

      const initialQRCode = generateValidQRCode();
      existingComputer = await Computer.create({
        registrationId: initialQRCode,
        serialNo: 'SN123456',
        brand: 'Dell',
        owner: existingUser._id
      });

      validQRCode = generateValidQRCode();
      await QRCode.create({ code: validQRCode, isUsed: false });
    });

    it('should update computer registration with valid data', async () => {
      const response = await request(app)
        .put(`/api/computers/${validQRCode}`)
        .send({
          regNo: existingUser.regNo,
          serialNo: 'SN123456',
          brand: 'Dell'
        });

      expect(response.status).toBe(200);
      expect(response.body.registrationId).toBe(validQRCode);

      const updatedQR = await QRCode.findOne({ code: validQRCode });
      expect(updatedQR.isUsed).toBe(true);
    });

    it('should reject update if computer-user combination not found', async () => {
      const response = await request(app)
        .put(`/api/computers/${validQRCode}`)
        .send({
          regNo: existingUser.regNo,
          serialNo: 'NONEXISTENT',
          brand: 'Dell'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No existing registration found with this combination');
    });

    it('should handle guest computer updates', async () => {
      const guest = await User.create({
        nationalId: 98765432,
        name: 'Test Guest',
        photo: 'http://example.com/guest.jpg',
        type: 'guest'
      });

      const guestComputer = await Computer.create({
        registrationId: generateValidQRCode(),
        serialNo: 'SN789012',
        brand: 'HP',
        owner: guest._id
      });

      const response = await request(app)
        .put(`/api/computers/${validQRCode}`)
        .send({
          nationalId: guest.nationalId,
          serialNo: 'SN789012',
          brand: 'HP'
        });

      expect(response.status).toBe(200);
      expect(response.body.registrationId).toBe(validQRCode);
    });

    it('should prevent concurrent updates of same computer', async () => {
      const newQRCode2 = generateValidQRCode();
      await QRCode.create({ code: newQRCode2, isUsed: false });

      const [response1, response2] = await Promise.all([
        request(app)
          .put(`/api/computers/${validQRCode}`)
          .send({
            regNo: existingUser.regNo,
            serialNo: 'SN123456',
            brand: 'Dell'
          }),
        request(app)
          .put(`/api/computers/${newQRCode2}`)
          .send({
            regNo: existingUser.regNo,
            serialNo: 'SN123456',
            brand: 'Dell'
          })
      ]);

      const successCount = [response1, response2]
        .filter(r => r.status === 200)
        .length;
      expect(successCount).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid QR code formats', async () => {
      const invalidCodes = [
        'not-hex',
        '123abc',
        crypto.randomBytes(16).toString('hex'),
        undefined,
        null
      ];

      for (const code of invalidCodes) {
        const response = await request(app)
          .post(`/api/computers/${code}`)
          .send({
            regNo: 12345,
            serialNo: 'SN123456',
            brand: 'Dell'
          });
        expect(response.status).toBe(400);
      }
    });

    it('should handle concurrent QR code usage', async () => {
      const validQRCode = generateValidQRCode();
      await QRCode.create({ code: validQRCode, isUsed: false });

      const requests = Array(3).fill().map(() => 
        request(app)
          .post(`/api/computers/${validQRCode}`)
          .send({
            regNo: 12345,
            serialNo: `SN${Date.now()}`,
            brand: 'Dell'
          })
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBe(1);
    });
  });
});