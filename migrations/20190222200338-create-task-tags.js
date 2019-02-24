module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TaskTags', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    taskId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Tasks',
        key: 'id',
      },
    },
    tagId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Tags',
        key: 'id',
      },
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('TaskTags'),
};
