export const userDto = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const usersDto = (users) => {
  return users.map(user => userDto(user));
};
