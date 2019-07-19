import buildFormObj from '../lib/formObjectBuilder';
import requiredAuth from '../lib/middlewares';
import { encrypt } from '../lib/secure';
import { paginate } from '../lib/utils';
import { User } from '../models';

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const usersPageSize = 10;
      const { query } = ctx.request;
      const currentPage = query.page || 1;
      const { count: numOfAllUsers } = await User.findAndCountAll();
      const numOfPages = Math.ceil(numOfAllUsers / usersPageSize);
      const pages = { currentPage, numOfPages };
      const users = await User.findAll(paginate(currentPage, usersPageSize));
      ctx.render('users', { users, pages });
    })
    .get('newUser', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users', '/users', async (ctx) => {
      const { form } = ctx.request.body;
      const user = User.build(form);
      try {
        await user.save();
        ctx.flashMessage.notice = `User ${form.email} has been created`;
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('editUser', '/users/:id/edit', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      if (ctx.session.userId === Number(id)) {
        const user = await User.findByPk(id);
        ctx.render('users/edit', { user, f: buildFormObj(user) });
        return;
      }
      ctx.flashMessage.warning = 'You can edit only your account';
      ctx.redirect(router.url('root'));
    })
    .patch('editUser', '/users/:id/edit', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findByPk(id);
      const {
        email, firstName, lastName, password,
      } = ctx.request.body.form;
      if (user.passwordDigest === encrypt(password)) {
        await user.update({ email, firstName, lastName });
        ctx.flashMessage.notice = `User ${email} has been updated`;
        ctx.redirect(router.url('root'));
        return;
      }
      ctx.flashMessage.warning = 'Wrong password';
      ctx.render('users/edit', { f: buildFormObj(user), user });
    })
    .delete('deleteUser', '/users/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findByPk(id);
      try {
        await user.destroy();
        ctx.flashMessage.notice = 'User has been deleted';
        ctx.session = {};
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.flashMessage.warning = `Unable to delete user ${user.email}`;
        ctx.render('users/edit', { f: buildFormObj(user), user });
      }
    })
    .get('showUser', '/user/:id', async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findByPk(id);
      ctx.render('users/show', { user });
    });
};
