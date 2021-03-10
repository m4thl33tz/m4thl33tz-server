const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

const justin = {
  given_name: 'Justin',

  family_name: 'Martin',

  nickname: 'justin.martin7x',

  name: 'Justin Martin',

  picture:
    'https://lh3.googleusercontent.com/a-/AOh14Gjihbg07z5ZK6RmDAjlOZAfaK1W4ZZ48cpLdMLRcsw=s96-c',

  locale: 'en',

  updated_at: '2021-03-03T19:43:35.603Z',

  email: 'justin.martin7x@gmail.com',

  email_verified: true,

  sub: 'google-oauth2|116678650705106025315',
};

describe('M4thl33tz server routes for points', () => {
  beforeAll(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('should create a new points table for a new user', async () => {
    User.addNewUser({
      email: justin.email,
      name: justin.given_name + ' ' + justin.family_name,
      nickname: justin.nickname,
    });
    const response = await request(app)
      .post('/points/newPoints')
      .send({ email: justin.email });

    expect(response.body).toEqual({
      id: '1',
      playerId: justin.email,
      points: 0,
    });
  });

  it('should add points to existing points pool', async () => {
    const response = await request(app)
      .put('/points/addPoints')
      .send({ email: justin.email, points: 50 });

    expect(response.body).toEqual({
      id: '1',
      playerId: justin.email,
      points: 50,
    });
  });

  it('should list all points with nicknames and points', async () => {
    const response = await request(app).get('/points/getAll');

    expect(response.body).toEqual([
      {
        name: 'Justin Martin',
        points: 50,
      },
    ]);
  });

  it('should return a players points but providing the uniqueId', async () => {
    const response = await request(app).get(
      `/points/getPlayerPoints/${justin.email}`
    );

    expect(response.body).toEqual({
      name: 'Justin Martin',
      points: 50,
    });
  });
});
