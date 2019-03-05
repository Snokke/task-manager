export default (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define('TaskStatus', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: "Status name cannot be empty"},
      },
    }
  }, {});
  TaskStatus.associate = function(models) {
    TaskStatus.hasOne(models.Task, { as: 'taskStatus', foreignKey: 'taskStatusId' });
  };
  return TaskStatus;
};