const getUsersForSelectInput = async (user, defaultValue = '', defaultName = '') => {
  const allUsers = await user.findAll()
    .map(el => ({ value: el.get('id'), name: el.get('fullName') }));
  return [{ value: defaultValue, name: defaultName }, ...allUsers];
};

export default getUsersForSelectInput;
