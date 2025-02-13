import request from 'supertest';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { getRouteV1 } from '../src/common';
import { AuthController } from '../src/auth/auth.controller';
import constants from '../src/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { addAppFixtures } from './setup';

const TODO_URL = getRouteV1('todo');
describe('TodoRouter (e2e) - api/v1/todo', () => {
  let app: INestApplication;
  let token: string | undefined;
  let todoId: string | undefined;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    addAppFixtures(app);

    await app.init();

    // create new user
    const userResponse = await app.get<AuthController>(AuthController).signup({
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    token = userResponse.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`(POST) ${TODO_URL} - Create Todo`, () => {
    const name = faker.word.noun(5);
    it('should throw an authentication error if user attempts to create todo without first logging in', async () => {
      await request(app.getHttpServer()).post(TODO_URL).send({}).expect(401);
    });

    it('should throw a validation error if todo name is not provided', async () => {
      await request(app.getHttpServer())
        .post(TODO_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });

    it('should successfully create a todo', async () => {
      const response = await request(app.getHttpServer())
        .post(TODO_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({ name })
        .expect(201);

      expect(response.body.name).toBe(name);
      todoId = response.body.id;
    });

    it('should return a duplicate error (409) if a todo exists with the same name', async () => {
      const response = await request(app.getHttpServer())
        .post(TODO_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({ name })
        .expect(409);
      expect(response.body.error).toBe(constants.CONFLICT);
    });
  });

  describe(`(GET) ${TODO_URL} - List Todos`, () => {
    it('should throw an authentication error if user attempts to fetch a list of todos without first logging in', async () => {
      await request(app.getHttpServer()).get(TODO_URL).expect(401);
    });

    it('should return all todos', async () => {
      const response = await request(app.getHttpServer())
        .get(TODO_URL)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(response.body.data?.length).toBe(1);
      expect(response.body.data[0].id).toBe(todoId);
      expect(response.body.pagination).toHaveProperty('pageNumber', 1);
    });
  });

  describe(`(GET) ${TODO_URL}/:todoId - Get Todo`, () => {
    it('should return a specific todo', async () => {
      const response = await request(app.getHttpServer())
        .get(`${TODO_URL}/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', todoId);
    });

    it('should return 404 if todo is not found', async () => {
      await request(app.getHttpServer())
        .get(`${TODO_URL}/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe(`(PATCH) ${TODO_URL}/:todoId - Update Todo`, () => {
    const updatedName = faker.word.noun(5);
    it('should update a specific todo', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${TODO_URL}/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: updatedName })
        .expect(200);

      expect(response.body.name).toBe(updatedName);
    });

    it('should return 404 if todo is not found', async () => {
      await request(app.getHttpServer())
        .patch(`${TODO_URL}/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: updatedName })
        .expect(404);
    });
  });

  describe(`(DELETE) ${TODO_URL}/:todoId - Delete Todo`, () => {
    it('should delete a specific todo', async () => {
      await request(app.getHttpServer())
        .delete(`${TODO_URL}/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('should return 404 if todo is not found', async () => {
      await request(app.getHttpServer())
        .delete(`${TODO_URL}/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe(`(GET) ${TODO_URL}/:todoId/tasks - Get Todo Tasks`, () => {
    it('should return all tasks for a specific todo', async () => {
      const todoResponse = await request(app.getHttpServer())
        .post(TODO_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: faker.word.noun(5) })
        .expect(201);

      await request(app.getHttpServer())
        .get(`${TODO_URL}/${todoResponse.body.id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 if todo is not found', async () => {
      await request(app.getHttpServer())
        .get(`${TODO_URL}/${faker.string.uuid()}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
