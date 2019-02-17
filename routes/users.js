import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../models';

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const id = ctx.session.userId;
      const currentUser = await User.findOne({
        where: {
          id,
        },
      });
      const users = await User.findAll();
      ctx.render('users', { users, currentUser });
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
    .get('editAccount', '/users/edit', async (ctx) => {
      const id = ctx.session.userId;
      const currentUser = await User.findOne({
        where: {
          id,
        },
      });
      ctx.render('users/edit', { currentUser, f: buildFormObj(currentUser) });
    })
    .patch('editAccount', '/users/edit', async (ctx) => {
      const id = ctx.session.userId;
      const currentUser = await User.findOne({
        where: {
          id,
        },
      });
      const {
        email, firstName, lastName, password,
      } = ctx.request.body.form;
      if (currentUser.passwordDigest === encrypt(password)) {
        currentUser.update({ email, firstName, lastName });
        ctx.flashMessage.notice = `User ${email} has been updated`;
        ctx.redirect(router.url('root'));
        return;
      }
      ctx.flashMessage.warning = 'Wrong password';
      ctx.render('users/edit', { f: buildFormObj(currentUser) });
    })
    .delete('deleteUser', '/users/edit', async (ctx) => {
      const id = ctx.session.userId;
      const currentUser = await User.findOne({
        where: {
          id,
        },
      });
      try {
        await currentUser.destroy();
        ctx.session = {};
        ctx.flashMessage.notice = 'User has been deleted';
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.flashMessage.warning = 'Unable to delete user';
      }
    })
    .get('viewUser', '/user/view/:id', async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findOne({
        where: {
          id,
        },
      });
      ctx.render('users/view', { user });
    });
};
