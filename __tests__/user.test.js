import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { User, sequelize } from '../models';
import { getCookie, getFakeUser } from './lib/utils';
import app from '..';

const fakeUser = getFakeUser();

describe('user', () => {
  let server;
  let cookie;
  let user;

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: true });
    user = await User.create(fakeUser);
  });

  beforeEach(async () => {
    server = app().listen();
    cookie = await getCookie(server, user);
  });

  it('Create user', async () => {
    const newUser = getFakeUser();
    const res = await request.agent(server)
      .post('/users')
      .send({ form: newUser });

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

    const res = await request.agent(server)
      .patch(`/users/${user.id}/edit`)
      .set('Cookie', cookie)
      .send({ form: changedUser });

    expect(res).toHaveHTTPStatus(302);
  });

  it('Delete account', async () => {
    const res = await request.agent(server)
      .delete(`/users/${user.id}`)
      .set('Cookie', cookie);

    expect(res).toHaveHTTPStatus(302);
  });

  it('Get /session/new', async () => {
    const res = await request.agent(server)
      .get('/session/new');

    expect(res).toHaveHTTPStatus(200);
  });

  it('Get /users/new', async () => {
    const res = await request.agent(server)
      .get('/users/new');

    expect(res).toHaveHTTPStatus(200);
  });

  it('Get /users', async () => {
    const res = await request.agent(server)
      .get('/users');

    expect(res).toHaveHTTPStatus(200);
  });

  it('Get wrong /users/:id/edit', async () => {
    const res = await request.agent(server)
      .get(`/users/${user.id}/edit`)
      .set('Cookie', cookie);

    expect(res).toHaveHTTPStatus(302);
  });

  it('Get /user/:id', async () => {
    const newUser = await User.create(getFakeUser());
    const res = await request.agent(server)
      .get(`/user/${newUser.id}`);

    expect(res).toHaveHTTPStatus(200);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
