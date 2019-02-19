import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import tasks from './tasks';
import taskstatuses from './taskstatuses';

const controllers = [welcome, users, sessions, tasks, taskstatuses];

export default (router, container) => controllers.forEach(f => f(router, container));
