import { User } from '../models';

export default (router) => {
  router.get('root', '/', async (ctx) => {
    const id = ctx.session.userId;
    const currentUser = await User.findOne({
      where: {
        id,
      },
    });
    ctx.render('welcome/index', { currentUser });
  });
};
