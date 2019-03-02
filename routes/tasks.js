import buildFormObj from '../lib/formObjectBuilder';
import {
  getObjectForSelectInput, getTags, parseTags, getScopesForFilter,
} from '../lib/utils';
import {
  User, Task, TaskStatus, Tag,
} from '../models';

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const filterQuery = ctx.request.query;
      const creatorId = ctx.session.userId;
      const scopes = getScopesForFilter(filterQuery, creatorId);
      const { rows: tasks, count: countTasks } = await Task.scope(scopes).findAndCountAll();
      const users = await getObjectForSelectInput(User, 'fullName', 1, 'All');
      const tags = await getObjectForSelectInput(Tag, 'name');
      const taskStatuses = await getObjectForSelectInput(TaskStatus, 'name', 1, 'All');
      const myTasks = [
        { value: 'All', name: 'All' },
        { value: 1, name: 'My tasks' },
      ];
      ctx.render('tasks', {
        f: buildFormObj(tasks), filterQuery, tasks, users, taskStatuses, tags, countTasks, myTasks,
      });
    })
    .get('newTask', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const users = await getObjectForSelectInput(User, 'fullName', 1);
      const taskStatuses = await getObjectForSelectInput(TaskStatus, 'name');
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
      const task = await Task.scope('allAssociations').findById(id);
      const taskStatuses = await getObjectForSelectInput(TaskStatus, 'name');
      ctx.render('tasks/show', { f: buildFormObj(task), task, taskStatuses });
    })
    .get('editTask', '/tasks/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.scope('allAssociations').findById(id);
      const users = await getObjectForSelectInput(User, 'fullName', 1);
      const taskStatuses = await getObjectForSelectInput(TaskStatus, 'name');
      ctx.render('tasks/edit', {
        f: buildFormObj(task), task, users, taskStatuses,
      });
    })
    .patch('editTask', '/tasks/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const tagString = ctx.request.body.form.tags;
      let task = await Task.scope('allAssociations').findById(id);
      const tagsNames = parseTags(tagString);
      const users = await getObjectForSelectInput(User, 'fullName', 1);
      const taskStatuses = await getObjectForSelectInput(TaskStatus, 'name');
      const data = ctx.request.body.form;
      if (data.assignedToId === '') {
        data.assignedToId = null;
      }
      try {
        await task.update(data);
        const tags = await getTags(Tag, tagsNames);
        await task.setTags(tags);
        task = await Task.scope('allAssociations').findById(id);
        ctx.flashMessage.notice = `Task #${task.id} has been updated`;
        ctx.render('tasks/show', { f: buildFormObj(task), task, taskStatuses });
      } catch (e) {
        ctx.flashMessage.warning = `Unable to update task #${task.id}`;
        ctx.render('tasks/edit', {
          f: buildFormObj(task, e), task, users, taskStatuses,
        });
      }
    })
    .patch('updateTaskStatus', '/tasks/:id/editstatus', async (ctx) => {
      const { id } = ctx.params;
      let task = await Task.scope('allAssociations').findById(id);
      const taskStatuses = await getObjectForSelectInput(TaskStatus, 'name');
      const newStatus = ctx.request.body.form;
      try {
        await task.update(newStatus);
        task = await Task.scope('allAssociations').findById(id);
        ctx.flashMessage.notice = `Status has been updated to "${task.taskStatus.name}"`;
        ctx.render('tasks/show', { f: buildFormObj(task), task, taskStatuses });
      } catch (e) {
        ctx.flashMessage.warning = `Unable to update status #${task.id}`;
        ctx.render('tasks/show', { f: buildFormObj(task, e), task, taskStatuses });
      }
    })
    .delete('deleteTask', '/tasks/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id);
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
