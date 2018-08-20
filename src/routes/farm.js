const db = require('../db');

module.exports = {
  get: {
    async list(ctx) {
      const result = await db.models.farm.findAll({
        attributes: ['id', 'name', 'owner', 'userInfo.name', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
        include: [
          {
            model: db.models.userInfo,
            attributes: ['address', 'name']
          },
          {
            model: db.models.userFarm,
            attributes: []
          }
        ],
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