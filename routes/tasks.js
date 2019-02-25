import buildFormObj from '../lib/formObjectBuilder';
import {
  getUsersForSelectInput, getStatusesForSelectInput, getTags, parseTags,
} from '../lib/utils';
import {
  User, Task, TaskStatus, Tag,
} from '../models';

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const tasks = await Task.findAll({
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
          { model: TaskStatus, as: 'taskStatus' },
          { model: Tag, as: 'tags' },
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
      const tagString = form.tags;
      form.creatorId = userId;
      if (form.assignedToId === '') {
        form.assignedToId = null;
      }
      const tagsNames = parseTags(tagString);
      const task = Task.build(form);
      try {
        await task.save();
        const tags = await getTags(Tag, tagsNames);
        await task.setTags(tags);
        ctx.flashMessage.notice = 'Task has been created';
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.flashMessage.warning = 'Cannot create task';
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
          { model: TaskStatus, as: 'taskStatus' },
          { model: Tag, as: 'tags' },
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
          { model: Tag, as: 'tags' },
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
      const tagString = ctx.request.body.form.tags;
      let task = await Task.findOne({
        where: {
          id,
        },
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
          { model: TaskStatus, as: 'taskStatus' },
          { model: Tag, as: 'tags' },
        ],
      });
      const tagsNames = parseTags(tagString);
      const users = await getUsersForSelectInput(User);
      const taskStatuses = await getStatusesForSelectInput(TaskStatus);
      const data = ctx.request.body.form;
      if (data.assignedToId === '') {
        data.assignedToId = null;
      }
      try {
        await task.update(data);
        const tags = await getTags(Tag, tagsNames);
        await task.setTags(tags);
        task = await Task.findOne({
          where: {
            id,
          },
          include: [
            { model: User, as: 'creator' },
            { model: User, as: 'assignedTo' },
            { model: TaskStatus, as: 'taskStatus' },
            { model: Tag, as: 'tags' },
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
