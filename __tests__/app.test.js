const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');

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

describe('m4thl33tz-server routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it.skip('should create a new user using the information from AUTH0 using post route', async () => {
    const response = await request(app)
      .post('/user/newUser')
      .send({
        email: justin.email,
        name: justin.given_name + ' ' + justin.family_name,
        nickname: justin.nickname,
      });

    expect(response.body).toEqual({
      id: '1',
      email: 'justin.martin7x@gmail.com',
      name: 'Justin Martin',
      nickname: 'justin.martin7x',
    });
  });
});
