import request from 'supertest';
import faker from 'faker';
import { TaskStatus } from '../../models';

const getCookie = async (server, user) => {
  const resAuth = await request.agent(server)
    .post('/session')
    .send({ form: { email: user.email, password: user.password } });
  const cookie = resAuth.headers['set-cookie'];
  return cookie;
};

const getFakeTask = async (user, taskStatusData) => {
  const taskStatus = await TaskStatus.create(taskStatusData);
  const fakeTask = {
    name: faker.lorem.words(),
    description: faker.lorem.paragraph(),
    taskStatusId: taskStatus.id,
    creatorId: user.id,
  };
  return fakeTask;
};

const getFakeUser = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

const getFakeTaskStatus = () => ({
  name: faker.lorem.word(),
});

export {
  getCookie, getFakeTask, getFakeUser, getFakeTaskStatus,
};
