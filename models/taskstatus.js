export default (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define('TaskStatus', {
    name: {
      type: DataTypes.ENUM,
      values: ['new', 'inWork', 'onTesting', 'done'],
      validate: {
        notEmpty: true,
      },
    }
  }, {});
  TaskStatus.associate = function(models) {
    // associations can be defined here
  };
  return TaskStatus;
};