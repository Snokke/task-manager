import buildFormObj from '../lib/formObjectBuilder';
import { TaskStatus } from '../models';

export default (router) => {
  router
    .get('taskstatuses', '/taskstatuses', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      ctx.render('taskstatuses', { f: buildFormObj(taskStatuses), taskStatuses });
    })
    .get('newTaskStatus', '/taskstatuses/new', async (ctx) => {
      const taskStatuses = TaskStatus.build();
      ctx.render('taskstatuses/new', { f: buildFormObj(taskStatuses) });
    })
    .post('taskstatuses', '/taskstatuses', async (ctx) => {
      const { form } = ctx.request.body;
      const taskStatus = TaskStatus.build(form);
      try {
        await taskStatus.save();
        ctx.flashMessage.notice = `Status "${taskStatus.name}" has been created`;
        ctx.redirect(router.url('taskstatuses'));
      } catch (e) {
        ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus, e) });
      }
    })
    .patch('editTaskStatus', '/taskstatuses/:id', async (ctx) => {
      const { id } = ctx.params;
      let taskStatuses = await TaskStatus.findAll();
      const taskStatus = await TaskStatus.findOne({
        where: {
          id,
        },
      });
      const data = ctx.request.body.form;
      try {
        taskStatus.update(data);
        taskStatuses = await TaskStatus.findAll();
        ctx.flashMessage.notice = `Status "${taskStatus.name}" has been updated`;
        ctx.render('taskstatuses', { f: buildFormObj(taskStatuses), taskStatuses });
      } catch (e) {
        ctx.flashMessage.warning = `Unable to update status "${taskStatus.id}"`;
        ctx.render('taskstatuses', { f: buildFormObj(taskStatuses, e), taskStatuses });
      }
    })
    .delete('deleteTaskStatus', '/taskstatuses/:id', async (ctx) => {
      const { id } = ctx.params;
      let taskStatuses = await TaskStatus.findAll();
      const taskStatus = await TaskStatus.findOne({
        where: {
          id,
        },
      });
      try {
        ctx.flashMessage.notice = `Status "${taskStatus.name}" has been deleted`;
        await taskStatus.destroy();
        taskStatuses = await TaskStatus.findAll();
        ctx.render('taskstatuses', { f: buildFormObj(taskStatuses), taskStatuses });
      } catch (e) {
        ctx.flashMessage.warning = `Unable to delete status "${taskStatus.name}"`;
        ctx.render('taskstatuses', { f: buildFormObj(taskStatuses), taskStatuses });
      }
    });
};
