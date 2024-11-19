const mongoose = require('mongoose');
const request = require('supertest');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../index');
const QRCode = require('../../models/qrcode');
const { connectDB, disconnectDB } = require('../../config/db');

let mongoServer;

describe('QR Code Management', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectDB(mongoServer.getUri());
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await QRCode.deleteMany({});
  });

  describe('POST /api/qrcodes/generate', () => {
    it('should generate a single QR code', async () => {
      const response = await request(app)
        .post('/api/qrcodes/generate')
        .send({ count: 1 });

      expect(response.status).toBe(201);
      expect(response.body.codes).toHaveLength(1);
      expect(response.body.codes[0]).toMatch(/^[0-9a-fA-F]{64}$/);
      
      const savedQR = await QRCode.findOne({ code: response.body.codes[0] });
      expect(savedQR).toBeTruthy();
      expect(savedQR.isUsed).toBe(false);
    });

    it('should generate multiple QR codes', async () => {
      const response = await request(app)
        .post('/api/qrcodes/generate')
        .send({ count: 5 });

      expect(response.status).toBe(201);
      expect(response.body.codes).toHaveLength(5);
      
      const uniqueCodes = new Set(response.body.codes);
      expect(uniqueCodes.size).toBe(5);

      for (const code of response.body.codes) {
        expect(code).toMatch(/^[0-9a-fA-F]{64}$/);
        const savedQR = await QRCode.findOne({ code });
        expect(savedQR).toBeTruthy();
      }
    });

    it('should validate count parameter', async () => {
      const invalidCounts = [-1, 0, 1001, 'abc'];
      
      for (const count of invalidCounts) {
        const response = await request(app)
          .post('/api/qrcodes/generate')
          .send({ count });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/invalid count/i);
      }
    });

    // it('should require authentication', async () => {
    //   const response = await request(app)
    //     .post('/api/qrcodes/generate')
    //     .send({ count: 1 });

    //   expect(response.status).toBe(401);
    // });
  });
});
