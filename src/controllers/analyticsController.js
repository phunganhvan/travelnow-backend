const UserAction = require('../models/UserAction');

async function trackAction(req, res, next) {
  try {
    const { actionType, metadata } = req.body || {};

    if (!actionType) {
      return res.status(400).json({ message: 'Thiếu actionType' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Cần đăng nhập để ghi nhận hành vi' });
    }

    const allowed = ['login', 'view_hotel', 'book_trip'];
    if (!allowed.includes(actionType)) {
      return res.status(400).json({ message: 'actionType không hợp lệ' });
    }

    const action = await UserAction.create({
      userId: req.user.id,
      actionType,
      metadata: metadata || {}
    });

    res.status(201).json({ id: action._id });
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const { from, to } = req.query;

    const match = {};
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 }
        }
      }
    ];

    const aggregated = await UserAction.aggregate(pipeline);

    const summary = aggregated.reduce(
      (acc, item) => ({
        ...acc,
        [item._id]: item.count
      }),
      { login: 0, view_hotel: 0, book_trip: 0 }
    );

    const latestActions = await UserAction.find(match)
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'fullName email role');

    res.json({
      summary,
      recent: latestActions.map((a) => ({
        id: a._id,
        user: a.userId
          ? {
              id: a.userId._id,
              fullName: a.userId.fullName,
              email: a.userId.email,
              role: a.userId.role
            }
          : null,
        actionType: a.actionType,
        metadata: a.metadata || {},
        timestamp: a.timestamp
      }))
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  trackAction,
  getStats
};
