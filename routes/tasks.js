import buildFormObj from '../lib/formObjectBuilder';
import { User, Task } from '../models';

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const tasks = await Task.findAll({
        include: [
          { model: User, as: 'creator' },
        ],
      });
      ctx.render('tasks', { tasks });
    })
    .get('newTask', '/tasks/new', (ctx) => {
      // const taskStatuses = TaskStatus.rawAttributes.name.values;
      const user = Task.build();
      ctx.render('tasks/new', { f: buildFormObj(user) });
    })
    .post('tasks', '/tasks', async (ctx) => {
      const { userId } = ctx.session;
      const { form } = ctx.request.body;
      form.creatorId = userId;
      const task = Task.build(form);
      try {
        await task.save();
        ctx.flashMessage.notice = 'Task has been created';
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.render('tasks/new', { f: buildFormObj(task, e) });
      }
    })
    .get('viewTask', '/tasks/view/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
        include: [
          { model: User, as: 'creator' },
        ],
      });
      ctx.render('tasks/view', { task });
    })
    .get('editTask', '/tasks/edit/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
        include: [
          { model: User, as: 'creator' },
        ],
      });
      const status = ['New', 'In work', 'On testing', 'Done'];
      ctx.render('tasks/edit', { f: buildFormObj(task), task, status });
    })
    .patch('editTask', '/tasks/edit/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
        include: [
          { model: User, as: 'creator' },
        ],
      });
      const data = ctx.request.body.form;
      try {
        task.update(data);
        ctx.flashMessage.notice = `Task #${task.id} has been updated`;
        ctx.render('tasks/view', { task });
      } catch (e) {
        ctx.flashMessage.warning = `Unable to update task #${task.id}`;
        ctx.render('tasks/edit', { f: buildFormObj(task, e) });
      }
    })
    .delete('deleteTask', '/tasks/edit/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
      });
      try {
        await task.destroy();
        ctx.flashMessage.notice = `Task #${task.id} has been deleted`;
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.flashMessage.warning = `Unable to delete task #${task.id}`;
      }
    });
};
