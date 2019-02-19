import buildFormObj from '../lib/formObjectBuilder';
import getUsersForSelectInput from '../lib/utils';
import { User, Task } from '../models';

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const tasks = await Task.findAll({
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
        ],
      });
      ctx.render('tasks', { tasks });
    })
    .get('newTask', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const users = await getUsersForSelectInput(User);
      ctx.render('tasks/new', { f: buildFormObj(task), users });
    })
    .post('tasks', '/tasks', async (ctx) => {
      const { userId } = ctx.session;
      const { form } = ctx.request.body;
      form.creatorId = userId;
      if (form.assignedToId === '') {
        form.assignedToId = null;
      }
      const task = Task.build(form);
      try {
        await task.save();
        ctx.flashMessage.notice = 'Task has been created';
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.render('tasks/new', { f: buildFormObj(task, e) });
      }
    })
    .get('showTask', '/tasks/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
        ],
      });
      ctx.render('tasks/show', { task });
    })
    .get('editTask', '/tasks/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
        include: [
          { model: User, as: 'creator' },
        ],
      });
      const users = await getUsersForSelectInput(User);
      ctx.render('tasks/edit', { f: buildFormObj(task), task, users });
    })
    .patch('editTask', '/tasks/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
        ],
      });
      const users = await getUsersForSelectInput(User);
      const data = ctx.request.body.form;
      if (data.assignedToId === '') {
        data.assignedToId = null;
      }
      try {
        task.update(data);
        ctx.flashMessage.notice = `Task #${task.id} has been updated`;
        ctx.render('tasks/show', { task });
      } catch (e) {
        ctx.flashMessage.warning = `Unable to update task #${task.id}`;
        ctx.render('tasks/edit', { f: buildFormObj(task, e), task, users });
      }
    })
    .delete('deleteTask', '/tasks/:id', async (ctx) => {
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
        ctx.render('users/edit', { f: buildFormObj(task), task });
      }
    });
};
