const getObjectForSelectInput = async (object, property, defaultSelectedValue = 0, defaultName = '', defaultValue) => {
  const allObjects = await object.findAll()
    .map(el => ({ value: el.get('id'), name: el.get(property) }));
  if (defaultSelectedValue) {
    return [{ value: defaultValue, name: defaultName }, ...allObjects];
  }
  return allObjects;
};

// findOrCreate works only with Postgres
const getTags = async (tagModel, tags) => {
  const tagsInstances = await Promise.all(tags
    .map(name => tagModel.findCreateFind({ where: { name } })));
  return tagsInstances.map(([tag]) => tag.id);
};

const parseTags = (str) => {
  if (str) {
    return str.replace(/,/g, ' ').split(' ').filter(t => t);
  }
  return [];
};

const getScopesForFilter = (filterQuery, creatorId) => {
  const scopes = ['allAssociations'];
  const filterMapping = {
    taskStatusId: {
      condition: filterQuery.taskStatusId && filterQuery.taskStatusId !== 'All',
      value: { method: ['filterByTaskStatusId', filterQuery.taskStatusId] },
    },
    assignedToId: {
      condition: filterQuery.assignedToId && filterQuery.assignedToId !== 'All',
      value: { method: ['filterByAssignedToId', filterQuery.assignedToId] },
    },
    myTasks: {
      condition: filterQuery.myTasks && creatorId && Number(filterQuery.myTasks) === 1,
      value: { method: ['filterByMyTasks', creatorId] },
    },
    tags: {
      condition: filterQuery.tags && filterQuery.tags.length > 0,
      value: { method: ['filterByTags', filterQuery.tags] },
    },
  };
  Object.keys(filterQuery).forEach((item) => {
    if (filterMapping[item].condition) {
      scopes.push(filterMapping[item].value);
    }
  });
  return scopes;
};

const deleteUnnecessaryTags = async (Tag, Task) => {
  const tagsInstances = await Tag.findAll();
  const tasksInstances = await Task.scope('allAssociations').findAll();

  tagsInstances.map(async (currentTag) => {
    const allTasksHasCurrentTag = await Promise.all(tasksInstances
      .map(currentTask => currentTask.hasTags(currentTag)));
    const tasksHasTag = allTasksHasCurrentTag.reduce((acc, item) => item || acc, false);
    if (!tasksHasTag) {
      await currentTag.destroy();
    }
  });
};

export {
  getObjectForSelectInput, getTags, parseTags, getScopesForFilter, deleteUnnecessaryTags,
};
