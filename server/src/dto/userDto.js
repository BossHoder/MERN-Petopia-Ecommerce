export const userDto = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        addresses: user.addresses,
        wishlist: user.wishlist,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

// Public DTO (for other users to see)
export const publicUserDto = (user) => {
    return {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
    };
};

// Profile DTO (for user's own profile)
export const profileDto = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        addresses: user.addresses,
        preferences: user.preferences,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

export const usersDto = (users) => {
    return users.map((user) => userDto(user));
};
