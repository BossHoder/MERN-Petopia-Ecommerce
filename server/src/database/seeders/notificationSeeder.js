import Notification from '../../models/Notification.js';
import User from '../../models/User.js';
import sampleNotifications from '../../data/Notifications.js';

const seedNotifications = async () => {
    try {
        console.log('Seeding notifications...');

        // Clear existing notifications
        await Notification.deleteMany({});

        // Get all users for mapping
        const users = await User.find({});
        const userMap = {};
        users.forEach((user) => {
            userMap[user.username] = user._id;
        });

        // Process notifications and populate user ObjectIds
        const notificationsToInsert = sampleNotifications
            .map((notificationData) => {
                const userId = userMap[notificationData.username];

                if (!userId) {
                    console.warn(`User with username ${notificationData.username} not found`);
                    return null;
                }

                return {
                    user: userId,
                    type: notificationData.type,
                    title: notificationData.title,
                    message: notificationData.message,
                    isRead: notificationData.isRead,
                    metadata: notificationData.metadata,
                };
            })
            .filter((notification) => notification !== null); // Remove null entries

        // Insert notifications
        const insertedNotifications = await Notification.insertMany(notificationsToInsert);

        console.log(`✅ ${insertedNotifications.length} notifications seeded successfully!`);
        return insertedNotifications;
    } catch (error) {
        console.error('❌ Error seeding notifications:', error);
        throw error;
    }
};

export default seedNotifications;
