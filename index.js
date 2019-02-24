import path from 'path';
import Koa from 'koa';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import serve from 'koa-static';
import koaWebpack from 'koa-webpack';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
import flashMessage from 'koa-flash-message';
import _ from 'lodash';
import methodOverride from 'koa-methodoverride';

import { format } from 'date-fns';
import Rollbar from 'rollbar';
import webpackConfig from './webpack.config';
import addRoutes from './routes';
import container from './container';

export default () => {
  const app = new Koa();

  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.log(err);
      rollbar.error(err, ctx.request);
    }
  });

  app.keys = ['some secret hurr'];
  app.use(session(app));
  app.use(flashMessage);
  app.use(async (ctx, next) => {
    ctx.state = {
      flashMessage: ctx.flashMessage,
      isSignedIn: () => ctx.session.userId !== undefined,
      checkAccess: id => ctx.session.userId === id,
    };
    await next();
  });
  app.use(bodyParser());
  app.use(methodOverride((req) => {
    // return req?.body?._method;
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));
  app.use(serve(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV === 'development') {
    koaWebpack({
      config: webpackConfig,
    }).then(m => app.use(m));
  }

  app.use(koaLogger());
  const router = new Router();
  addRoutes(router, container);
  app.use(router.routes());
  app.use(router.allowedMethods());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
      { formatDate: format },
    ],
  });
  pug.use(app);
  return app;
};
