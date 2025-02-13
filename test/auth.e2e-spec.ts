import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRouteV1 } from '../src/common';
import { addAppFixtures } from './setup';
import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';

const SIGNUP_URL = getRouteV1('auth/signup');
const LOGIN_URL = getRouteV1('auth/login');
const LOGOUT_URL = getRouteV1('auth/logout');

describe('AuthRoute (e2e) - api/v1/auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    addAppFixtures(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`POST ${SIGNUP_URL}`, () => {
    it('should return 400 if fullname, email or password is missing', async () => {
      await request(app.getHttpServer())
        .post(SIGNUP_URL)
        .send({ fullName: faker.person.fullName() })
        .expect(400);

      await request(app.getHttpServer())
        .post(SIGNUP_URL)
        .send({ email: faker.internet.email() })
        .expect(400);

      await request(app.getHttpServer())
        .post(SIGNUP_URL)
        .send({ password: faker.internet.password() })
        .expect(400);
    });

    it('should throw an error if email is invalid', async () => {
      await request(app.getHttpServer())
        .post(SIGNUP_URL)
        .send({
          fullName: faker.person.fullName(),
          email: 'invalid-email',
          password: faker.internet.password(),
        })
        .expect(400);
    });

    it('should throw an error if password is less than 8 characters', async () => {
      await request(app.getHttpServer())
        .post(SIGNUP_URL)
        .send({
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          password: 'short',
        })
        .expect(400);
    });

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post(SIGNUP_URL)
        .send({
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });
  });

  describe(`POST ${LOGIN_URL}`, () => {
    it('should log in an existing user', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      await request(app.getHttpServer())
        .post(SIGNUP_URL)
        .send({
          fullName: faker.person.fullName(),
          email,
          password,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .send({ email, password })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expires');
    });
  });

  describe(`POST ${LOGOUT_URL}`, () => {
    it('should log out an authenticated user', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      const response = await request(app.getHttpServer())
        .post(SIGNUP_URL)
        .send({
          fullName: faker.person.fullName(),
          email,
          password,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(LOGOUT_URL)
        .set('Authorization', `Bearer ${response.body.token}`)
        .expect(204);
    });
  });
});
