const request = require('supertest');
const app = require('./server');
describe('Express Server Tests', () => {
  test('should listen on port 8000', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.text).toBe('Hello Phreddit!');
  });
});