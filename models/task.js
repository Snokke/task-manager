export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: "Task name cannot be empty"},
      },
    },
    description: DataTypes.TEXT,
    creatorId: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true,
      },
    },
    taskStatusId: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true,
      },
    },
    assignedToId: {
      type: DataTypes.INTEGER,
    },
  }, {
    scopes: {
      filterByTaskStatusId: id => ({
        where: {
          taskStatusId: id,
        },
      }),
      filterByAssignedToId: id => ({
        where: {
          assignedToId: id,
        },
      }),
      filterByMyTasks: id => ({
        where: {
          creatorId: id,
        },
      }),
    },
  });
  Task.associate = function(models) {
    Task.belongsTo(models.User, { as: 'creator', foreignKey: 'creatorId' });
    Task.belongsTo(models.User, { as: 'assignedTo', foreignKey: 'assignedToId' });
    Task.belongsTo(models.TaskStatus, { as: 'taskStatus', foreignKey: 'taskStatusId' });
    Task.belongsToMany(models.Tag, { as: 'tags', through: 'TaskTags', foreignKey: 'taskId' });
    Task.addScope('allAssociations', {
      include: ['creator', 'assignedTo', 'taskStatus', 'tags'],
    });

    Task.addScope('filterByTags', ids => ({
      include: [{
        model: models.Tag,
        as: 'tags',
        where: {
          id: {
            [sequelize.Op.in]: ids,
          },
        }
      }]
    }));
  };
  return Task;
};