import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import {
  User, TaskStatus, Task, sequelize,
} from '../models';
import { getCookie, getFakeTask } from './lib/utils';
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
  let fakeTask;

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: true });
    user = await User.create(fakeUser);
    const fakeTaskData = await getFakeTask(user, fakeTaskStatus);
    fakeTask = await Task.create(fakeTaskData);
  });

  beforeEach(async () => {
    server = app().listen();
    cookie = await getCookie(server, user);
  });

  it('Get /tasks', async () => {
    const res = await request.agent(server)
      .get('/tasks');

    expect(res).toHaveHTTPStatus(200);
  });

  it('Create task', async () => {
    const task = await getFakeTask(user);
    const res = await request.agent(server)
      .post('/tasks')
      .set('Cookie', cookie)
      .send({ form: task });

    expect(res).toHaveHTTPStatus(302);

    const createdTask = await Task.findOne({
      where: {
        name: task.name,
        description: task.description,
      },
    });

    expect(createdTask.name).toBe(task.name);
    expect(createdTask.description).toBe(task.description);
  });

  it('Get /tasks/:id', async () => {
    const res = await request.agent(server)
      .get(`/tasks/${fakeTask.id}`);

    expect(res).toHaveHTTPStatus(200);
  });

  it('Get /tasks/:id/edit', async () => {
    const res = await request.agent(server)
      .set('Cookie', cookie)
      .get(`/tasks/${fakeTask.id}/edit`);

    expect(res).toHaveHTTPStatus(200);
  });

  it('Patch /tasks/:id/edit', async () => {
    const taskData = await getFakeTask(user, fakeTaskStatus);
    const taskBeforeEdit = await Task.create(taskData);
    const taskAfterEditData = await getFakeTask(user, fakeTaskStatus);

    const res = await request.agent(server)
      .patch(`/tasks/${taskBeforeEdit.id}/edit`)
      .set('Cookie', cookie)
      .send({ form: taskAfterEditData });

    expect(res).toHaveHTTPStatus(200);

    const taskAfterEdit = await Task.findById(taskBeforeEdit.id);

    expect(taskAfterEdit.name).toBe(taskAfterEditData.name);
    expect(taskAfterEdit.description).toBe(taskAfterEditData.description);
  });

  it('Patch /tasks/:id/editstatus', async () => {
    const taskData = await getFakeTask(user);
    const taskBeforeEdit = await Task.create(taskData);
    const newTaskStatus = await TaskStatus.create(fakeTaskStatus);

    const res = await request.agent(server)
      .patch(`/tasks/${taskBeforeEdit.id}/editstatus`)
      .set('Cookie', cookie)
      .send({ form: { taskStatusId: newTaskStatus.id } });

    expect(res).toHaveHTTPStatus(200);

    const taskAfterEdit = await Task.findById(taskBeforeEdit.id);

    expect(newTaskStatus.id).toBe(taskAfterEdit.taskStatusId);
  });

  it('Delete /tasks/:id', async () => {
    const taskData = await getFakeTask(user, fakeTaskStatus);
    const task = await Task.create(taskData);

    const res = await request.agent(server)
      .delete(`/tasks/${task.id}`)
      .set('Cookie', cookie)
      .send({ form: taskData });

    expect(res).toHaveHTTPStatus(302);

    const deletedTask = await Task.findById(task.id);

    expect(deletedTask).toBeNull();
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
