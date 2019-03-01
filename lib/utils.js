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

const parseTags = str => str.replace(/,/g, ' ').split(' ').filter(t => t);

const getScopesForFilter = (filterQuery, creatorId) => {
  const scopes = ['allAssociations'];
  if (filterQuery.taskStatusId && filterQuery.taskStatusId !== 'All') {
    scopes.push({ method: ['filterByTaskStatusId', filterQuery.taskStatusId] });
  }
  if (filterQuery.assignedToId && filterQuery.assignedToId !== 'All') {
    scopes.push({ method: ['filterByAssignedToId', filterQuery.assignedToId] });
  }
  if (filterQuery.myTasks && creatorId && Number(filterQuery.myTasks) === 1) {
    scopes.push({ method: ['filterByMyTasks', creatorId] });
  }
  const filterTags = Array.isArray(filterQuery.tags) ? filterQuery.tags : [filterQuery.tags];
  if (filterQuery.tags && filterTags.length > 0) {
    scopes.push({ method: ['filterByTags', filterTags] });
  }
  return scopes;
};

export {
  getObjectForSelectInput, getTags, parseTags, getScopesForFilter,
};
