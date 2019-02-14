export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    description: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'new',
      validate: {
        notEmpty: true,
      },
    },
    creator: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    assignedTo: DataTypes.STRING,
    tags: DataTypes.STRING,
  }, {});
  Task.associate = function(models) {
    Task.belongsToMany(models.Tag, { through: 'TaskTags', foreignKey: 'taskId' });
  };
  return Task;
};