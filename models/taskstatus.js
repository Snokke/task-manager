export default (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define('TaskStatus', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    }
  }, {});
  TaskStatus.associate = function(models) {
    TaskStatus.hasOne(models.Task, { as: 'taskStatus', foreignKey: 'taskStatusId' });
  };
  return TaskStatus;
};