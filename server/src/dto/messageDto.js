export const messageDto = (message) => {
    return {
        id: message._id,
        text: message.text,
        user: message.user,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    };
};

export const messagesDto = (messages) => {
    return messages.map((message) => messageDto(message));
};
