import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';

import { sequelize } from '../models';
import app from '..';

describe('user', () => {
  let server;

  const user = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: true });
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('Create user', async () => {
    const res = await request.agent(server)
      .post('/users')
      .send({ form: user });

    expect(res).toHaveHTTPStatus(302);
  });

  it('Sign in', async () => {
    const res = await request.agent(server)
      .post('/session')
      .send({ form: { email: user.email, password: user.password } });

    expect(res).toHaveHTTPStatus(302);
  });

  it('Edit account', async () => {
    const changedUser = {
      firstName: `${user.firstName}_test`,
      lastName: `${user.lastName}_test`,
      email: user.email,
      password: user.password,
    };

    const resAuth = await request.agent(server)
      .post('/session')
      .send({ form: { email: user.email, password: user.password } });
    const cookie = resAuth.headers['set-cookie'];

    const res = await request.agent(server)
      .patch('/users/edit')
      .set('Cookie', cookie)
      .send({ form: changedUser });

    expect(res).toHaveHTTPStatus(302);
  });

  it('Delete account', async () => {
    const resAuth = await request.agent(server)
      .post('/session')
      .send({ form: { email: user.email, password: user.password } });
    const cookie = resAuth.headers['set-cookie'];

    const res = await request.agent(server)
      .delete('/users/edit')
      .set('Cookie', cookie);

    expect(res).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
