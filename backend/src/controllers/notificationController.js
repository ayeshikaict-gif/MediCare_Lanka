const db = require('../db/db');

const getNotifications = async (req, res) => {
  try {
    const notifications = await db.allAsync(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await db.runAsync(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
