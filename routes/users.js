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
        ctx.flash.set(`User ${form.firstName} has been created`);
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('edit', '/users/edit', async (ctx) => {
      const id = ctx.session.userId;
      const currentUser = await User.findOne({
        where: {
          id,
        },
      });
      ctx.render('users/edit', { currentUser, f: buildFormObj(currentUser) });
    })
    .post('edit', '/users/edit', async (ctx) => {
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
        ctx.flash.set(`User ${firstName} has been updated`);
        ctx.redirect(router.url('root'));
      }
      const e = 'Wrong password';
      ctx.render('users/edit', { f: buildFormObj(currentUser, e) });
    });
};
