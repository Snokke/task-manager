import buildFormObj from '../lib/formObjectBuilder';
import requiredAuth from '../lib/middlewares';
import { TaskStatus } from '../models';

export default (router) => {
  router
    .get('taskstatuses', '/taskstatuses', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      const minTaskStatusId = await TaskStatus.min('id');
      ctx.render('taskstatuses', { f: buildFormObj(taskStatuses), taskStatuses, minTaskStatusId });
    })
    .get('newTaskStatus', '/taskstatuses/new', requiredAuth, async (ctx) => {
      const taskStatuses = TaskStatus.build();
      ctx.render('taskstatuses/new', { f: buildFormObj(taskStatuses) });
    })
    .post('taskstatuses', '/taskstatuses', requiredAuth, async (ctx) => {
      const { form } = ctx.request.body;
      const taskStatus = TaskStatus.build(form);
      try {
        await taskStatus.save();
        ctx.flashMessage.notice = `Status "${taskStatus.name}" has been created`;
        ctx.redirect(router.url('taskstatuses'));
      } catch (e) {
        ctx.flashMessage.warning = 'Cannot create status';
        ctx.render('taskstatuses/new', { f: buildFormObj(taskStatus, e) });
      }
    })
    .patch('editTaskStatus', '/taskstatuses/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findByPk(id);
      const minTaskStatusId = await TaskStatus.min('id');
      const data = ctx.request.body.form;
      try {
        await taskStatus.update(data);
        const taskStatuses = await TaskStatus.findAll();
        ctx.flashMessage.notice = `Status "${taskStatus.name}" has been updated`;
        ctx.render('taskstatuses', { f: buildFormObj(taskStatuses), taskStatuses, minTaskStatusId });
      } catch (e) {
        const taskStatuses = await TaskStatus.findAll();
        ctx.flashMessage.warning = `Unable to update status #${taskStatus.id}`;
        ctx.render('taskstatuses', { f: buildFormObj(taskStatuses, e), taskStatuses, minTaskStatusId });
      }
    })
    .delete('deleteTaskStatus', '/taskstatuses/:id', requiredAuth, async (ctx) => {
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findByPk(id);
      const minTaskStatusId = await TaskStatus.min('id');
      try {
        await taskStatus.destroy();
        ctx.flashMessage.notice = `Status "${taskStatus.name}" has been deleted`;
        const taskStatuses = await TaskStatus.findAll();
        ctx.render('taskstatuses', { f: buildFormObj(taskStatuses), taskStatuses, minTaskStatusId });
      } catch (e) {
        ctx.flashMessage.warning = `Unable to delete status "${taskStatus.name}"`;
        const taskStatuses = await TaskStatus.findAll();
        ctx.render('taskstatuses', { f: buildFormObj(taskStatuses), taskStatuses, minTaskStatusId });
      }
    });
};
