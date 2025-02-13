import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRouteV1 } from '../src/common';
import { AuthController } from '../src/auth/auth.controller';
import { TodoController } from '../src/todo/todo.controller';
import { User } from '../src/user/user.entity';
import { addAppFixtures } from './setup';

const TASK_URL = getRouteV1('task');
describe('TaskRouter (e2e) - api/v1/task', () => {
  let app: INestApplication;
  let token: string | undefined;
  let taskId: string | undefined;
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

    // create todo
    const todoResponse = await app
      .get<TodoController>(TodoController)
      .create({ name: faker.word.noun(5) }, userResponse.user as User);

    token = userResponse.token;
    todoId = todoResponse.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`(POST) ${TASK_URL} - Create Task`, () => {
    it('should throw an authentication error if user attempts to create task without first logging in', async () => {
      await request(app.getHttpServer()).post(TASK_URL).send({}).expect(401);
    });

    it("should throw a validation error if task's dueDate, description or todoId  is not provided", async () => {
      await request(app.getHttpServer())
        .post(TASK_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({
          todoId,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post(TASK_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: faker.word.noun(100),
        })
        .expect(400);

      await request(app.getHttpServer())
        .post(TASK_URL)
        .set('Authorization', `Bearer ${token}`)
        .send({
          dueDate: faker.date.soon(),
        })
        .expect(400);
    });

    it('should successfully create a task', async () => {
      const payload = {
        description: faker.word.noun(100),
        dueDate: faker.date.soon().toISOString(),
        todoId,
      };

      const response = await request(app.getHttpServer())
        .post(TASK_URL)
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);

      taskId = response.body.id;
    });
  });

  describe(`(GET) ${TASK_URL}/:taskId - Get Task`, () => {
    it('should return a specific task', async () => {
      const response = await request(app.getHttpServer())
        .get(`${TASK_URL}/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', taskId);
    });

    it('should return 404 if task is not found', async () => {
      await request(app.getHttpServer())
        .get(`${TASK_URL}/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe(`(PUT) ${TASK_URL}/:taskId - Update Task`, () => {
    const description = faker.word.noun(100);
    it('should update a specific task', async () => {
      const response = await request(app.getHttpServer())
        .put(`${TASK_URL}/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description })
        .expect(200);

      expect(response.body.description).toBe(description);
    });

    it('should return 404 if task is not found', async () => {
      await request(app.getHttpServer())
        .put(`${TASK_URL}/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: description })
        .expect(404);
    });
  });

  describe(`(PATCH) ${TASK_URL}/:taskId - Mark Task as Completed`, () => {
    it('should mark a specific task as completed', async () => {
      await request(app.getHttpServer())
        .patch(`${TASK_URL}/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe(`(DELETE) ${TASK_URL}/:taskId - Delete Task`, () => {
    it('should delete a specific task', async () => {
      await request(app.getHttpServer())
        .delete(`${TASK_URL}/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('should return 404 if task is not found', async () => {
      await request(app.getHttpServer())
        .delete(`${TASK_URL}/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
