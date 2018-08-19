const db = require('../db');
const { Op } = db.sequelize;

module.exports = {
  get: {
    async list(ctx) {
      const { offset, limit, farmId, onAuction } = ctx.query;

      const query = {
        where: {},
        include: [{
          model: db.models.userInfo,
          attributes: ['address', 'name'],
          where: {
            'address': { [Op.ne]: null }
          }
        }],
        limit: Math.min(100, limit || 10),
        offset
      };

      if (onAuction === 'true') query.where.price = { [Op.gt]: 0 };
      if (farmId) query.include[0].include = [{
        model: db.models.userFarm,
        attributes: [],
        where: { farmId }
      }];

      const total = await db.models.cow.count(query);
      const result = await db.models.cow.findAll(query);

      ctx.body = { total, result };
    }
  }
};