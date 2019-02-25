export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
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
  }, {});
  Task.associate = function(models) {
    Task.belongsTo(models.User, { as: 'creator', foreignKey: 'creatorId' });
    Task.belongsTo(models.User, { as: 'assignedTo', foreignKey: 'assignedToId' });
    Task.belongsTo(models.TaskStatus, { as: 'taskStatus', foreignKey: 'taskStatusId' });
    Task.belongsToMany(models.Tag, { as: 'tags', through: 'TaskTags', foreignKey: 'taskId' });
  };
  return Task;
};