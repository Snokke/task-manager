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

export { getUsersForSelectInput, getStatusesForSelectInput };
