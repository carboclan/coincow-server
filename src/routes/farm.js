const db = require('../db');

module.exports = {
  get: {
    async list(ctx) {
      const result = await db.models.farm.count({
        attributes: ['id', 'name', 'owner'],
        include: [db.models.userFarm],
        group: ['id']
      });

      ctx.body = { result };
    },

    async query(ctx) {
      const { farmId } = ctx.query;
      const result = await db.models.userInfo.findAll({
        attributes: ['address', 'name'],
        include: [{
          model: db.models.userFarm,
          attributes: [],
          where: {
            farmId
          }
        }]
      });

      ctx.body = { result };
    }
  }
};