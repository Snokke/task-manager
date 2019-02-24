import buildFormObj from '../lib/formObjectBuilder';
import { getUsersForSelectInput, getStatusesForSelectInput } from '../lib/utils';
import {
  User, Task, TaskStatus, Tag,
} from '../models';

const getTags = async (tags) => {
  const tagsInstances = await Promise.all(tags
    .map(name => Tag.findOrCreate({ where: { name } })));
  return tagsInstances.map(([tag]) => tag.id);
};

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const tasks = await Task.findAll({
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
          { model: TaskStatus, as: 'taskStatus' },
        ],
      });
      ctx.render('tasks', { tasks });
    })
    .get('newTask', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const users = await getUsersForSelectInput(User);
      const taskStatuses = await getStatusesForSelectInput(TaskStatus);
      ctx.render('tasks/new', { f: buildFormObj(task), users, taskStatuses });
    })
    .post('tasks', '/tasks', async (ctx) => {
      const { userId } = ctx.session;
      const { form } = ctx.request.body;
      form.creatorId = userId;
      if (form.assignedToId === '') {
        form.assignedToId = null;
      }
      const tagsNames = form.tags.split(' ').filter(t => t);
      const task = Task.build(form);
      try {
        await task.save();
        const tags = await getTags(tagsNames);
        await task.setTags(tags);
        ctx.flashMessage.notice = 'Task has been created';
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.flashMessage.warning = 'Cannot create task';
        ctx.redirect(router.url('tasks'));
        // ctx.render('tasks/new', { f: buildFormObj(task, e) });
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
          { model: TaskStatus, as: 'taskStatus' },
        ],
      });
      const taskStatuses = await getStatusesForSelectInput(TaskStatus);
      ctx.render('tasks/show', { f: buildFormObj(task), task, taskStatuses });
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
      const taskStatuses = await getStatusesForSelectInput(TaskStatus);
      ctx.render('tasks/edit', {
        f: buildFormObj(task), task, users, taskStatuses,
      });
    })
    .patch('editTask', '/tasks/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      let task = await Task.findOne({
        where: {
          id,
        },
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
          { model: TaskStatus, as: 'taskStatus' },
        ],
      });
      const users = await getUsersForSelectInput(User);
      const taskStatuses = await getStatusesForSelectInput(TaskStatus);
      const data = ctx.request.body.form;
      if (data.assignedToId === '') {
        data.assignedToId = null;
      }
      try {
        task.update(data);
        task = await Task.findOne({
          where: {
            id,
          },
          include: [
            { model: User, as: 'creator' },
            { model: User, as: 'assignedTo' },
            { model: TaskStatus, as: 'taskStatus' },
          ],
        });
        ctx.flashMessage.notice = `Task #${task.id} has been updated`;
        ctx.render('tasks/show', { f: buildFormObj(task), task, taskStatuses });
      } catch (e) {
        ctx.flashMessage.warning = `Unable to update task #${task.id}`;
        ctx.render('tasks/edit', {
          f: buildFormObj(task, e), task, users, taskStatuses,
        });
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
        ctx.render('users/edit', { f: buildFormObj(task, e), task });
      }
    });
};
