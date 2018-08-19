const db = require('../db');

module.exports = {
  get: {
    async list(ctx) {
      const { offset, limit } = ctx.query;

      const total = await db.models.userInfo.count();
      const result = await db.models.userInfo.findAll({
        attributes: ['address', 'name'],
        limit: Math.min(100, limit || 10),
        offset
      });

      ctx.body = { total, result };
    }
  }
};