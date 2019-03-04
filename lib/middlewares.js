export default async (ctx, next) => {
  if (!ctx.session.userId) {
    ctx.flashMessage.warning = 'You need to log in!';
    ctx.redirect('/');
    return;
  }
  await next();
};
