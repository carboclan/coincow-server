const _ = require('co-lodash');
const fs = require('fs');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('cache', null, null, {
  dialect: 'sqlite',
  storage: __dirname + '/../../data/cache.sqlite'
});

const models = fs.readdirSync(__dirname + '/models').map(f => {
  const def = require('./models/' + f);
  return [f.replace('.js', ''), def(sequelize, Sequelize)];
});

let ready = false;

module.exports = {
  sequelize,
  models: _.fromPairs(models),
  async init() {
    if (!ready) {
      const { cow, userInfo, farm, userFarm } = this.models;

      await sequelize.authenticate();
      await sequelize.sync();

      userInfo.hasOne(userFarm, { foreignKey: 'user_address' });
      cow.belongsTo(userInfo, { foreignKey: 'owner' });
      farm.belongsTo(userInfo, { foreignKey: 'owner' });
      farm.hasMany(userFarm, { foreignKey: 'farm_id' });
      ready = true;

      const { web3, contracts } = require('../eth');
      await userInfo.upsert({
        address: contracts.auctionHouse.address,
        name: 'auction house',
        nameHex: web3.fromUtf8('auction house')
      });
    }
  }
};