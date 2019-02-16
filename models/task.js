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
    creatorId: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true,
      },
    },
    assignedTo: DataTypes.STRING,
    tags: DataTypes.STRING,
  }, {});
  Task.associate = function(models) {
    Task.belongsTo(models.User, { as: 'creator', foreignKey: 'creatorId' });
    Task.belongsToMany(models.Tag, { through: 'TaskTags', foreignKey: 'taskId' });
  };
  return Task;
};