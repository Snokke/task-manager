import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { User, sequelize } from '../models';
import { getCookie, getFakeUser } from './lib/utils';
import app from '..';

const user = getFakeUser();

describe('user', () => {
  let server;

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

    const cookie = getCookie(server, user);
    const { id } = await User.findOne({ where: { email: user.email } });
    const res = await request.agent(server)
      .patch(`/users/${id}/edit`)
      .set('Cookie', cookie)
      .send({ form: changedUser });

    expect(res).toHaveHTTPStatus(302);
  });

  it('Delete account', async () => {
    const cookie = getCookie(server, user);
    const { id } = await User.findOne({ where: { email: user.email } });
    const res = await request.agent(server)
      .delete(`/users/${id}`)
      .set('Cookie', cookie);

    expect(res).toHaveHTTPStatus(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
