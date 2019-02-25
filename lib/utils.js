const getUsersForSelectInput = async (user, defaultValue = '', defaultName = '') => {
  const allUsers = await user.findAll()
    .map(el => ({ value: el.get('id'), name: el.get('fullName') }));
  return [{ value: defaultValue, name: defaultName }, ...allUsers];
};

const getStatusesForSelectInput = async (status) => {
  const result = await status.findAll()
    .map(el => ({ value: el.get('id'), name: el.get('name') }));
  return result;
};

// findOrCreate works only with Postgres
const getTags = async (tagModel, tags) => {
  const tagsInstances = await Promise.all(tags
    .map(name => tagModel.findCreateFind({ where: { name } })));
  return tagsInstances.map(([tag]) => tag.id);
};

const parseTags = str => str.replace(/,/g, ' ').split(' ').filter(t => t);

export {
  getUsersForSelectInput, getStatusesForSelectInput, getTags, parseTags,
};
