export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  }, {});
  Tag.associate = function(models) {
    Tag.belongsToMany(models.Task, { through: 'TaskTags', foreignKey: 'tagId' });
  };
  return Tag;
};