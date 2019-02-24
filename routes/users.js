import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../models';

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
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
    .get('editUser', '/users/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findOne({
        where: {
          id,
        },
      });
      ctx.render('users/edit', { user, f: buildFormObj(user) });
    })
    .patch('editUser', '/users/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findOne({
        where: {
          id,
        },
      });
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
    .delete('deleteUser', '/users/:id', async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findOne({
        where: {
          id,
        },
      });
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
      const user = await User.findOne({
        where: {
          id,
        },
      });
      ctx.render('users/show', { user });
    });
};
