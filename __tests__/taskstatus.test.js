import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import {
  User, TaskStatus, sequelize,
} from '../models';
import { getCookie } from './lib/utils';
import app from '..';

const fakeTaskStatus = {
  name: faker.lorem.word(),
};

const fakeUser = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

describe('task', () => {
  let server;
  let user;
  let cookie;

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: true });
    user = await User.create(fakeUser);
  });

  beforeEach(async () => {
    server = app().listen();
    cookie = await getCookie(server, user);
  });

  it('Get /taskstatuses', async () => {
    const res = await request.agent(server)
      .get('/taskstatuses');

    expect(res).toHaveHTTPStatus(200);
  });

  it('Get /taskstatuses/new', async () => {
    const res = await request.agent(server)
      .get('/taskstatuses/new');

    expect(res).toHaveHTTPStatus(200);
  });

  it('Create taskStatus', async () => {
    const res = await request.agent(server)
      .post('/taskstatuses')
      .set('Cookie', cookie)
      .send({ form: fakeTaskStatus });

    expect(res).toHaveHTTPStatus(302);

    const createdTaskStatus = await TaskStatus.findOne({
      where: {
        name: fakeTaskStatus.name,
      },
    });

    expect(createdTaskStatus.name).toBe(fakeTaskStatus.name);
  });

  it('Patch /taskstatuses/:id', async () => {
    const taskStatusBeforeEdit = await TaskStatus.create(fakeTaskStatus);
    const taskStatusAfterEditData = { name: faker.lorem.word() };

    const res = await request.agent(server)
      .patch(`/taskstatuses/${taskStatusBeforeEdit.id}`)
      .set('Cookie', cookie)
      .send({ form: taskStatusAfterEditData });

    expect(res).toHaveHTTPStatus(200);

    const taskStatusAfterEdit = await TaskStatus.findById(taskStatusBeforeEdit.id);

    expect(taskStatusAfterEdit.name).toBe(taskStatusAfterEditData.name);
  });

  it('Delete /taskstatuses/:id', async () => {
    const taskStatus = await TaskStatus.create(fakeTaskStatus);

    const res = await request.agent(server)
      .delete(`/taskstatuses/${taskStatus.id}`)
      .set('Cookie', cookie);

    expect(res).toHaveHTTPStatus(200);

    const deletedTaskStatus = await TaskStatus.findById(taskStatus.id);

    expect(deletedTaskStatus).toBeNull();
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
