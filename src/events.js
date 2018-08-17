const _ = require('co-lodash');
const cs = require('co-stream');
const { Web3EventStream } = require('web3-stream');
const { web3, contracts } = require('./eth');
const db = require('./db');

(async () => {
  await db.init();

  const updateBlockNumber = _.throttle(async (blockNumber) => {
    await db.models.config.upsert({
      key: 'block_number',
      value: blockNumber.toString()
    });
  }, 2000);

  const blockNumberRes = await db.models.config.findOne({ where: { key: 'block_number' } });
  const fromBlock = process.env.FROM || (blockNumberRes && blockNumberRes.value * 1) || 0;

  function evtStream(evt) {
    return new Web3EventStream(web3, evt, {}, { fromBlock, to: 'latest' });
  }

  evtStream(contracts.userInfo.Registered)
    .pipe(cs.object.each(async evt => {
      const { blockNumber, args } = evt;
      const { user, name, avatarUrl } = args;

      updateBlockNumber(blockNumber);

      await db.models.userInfo.upsert({
        address: user,
        name: web3.toUtf8(name),
        nameHex: name,
        avatar: avatarUrl
      });
    }));

  evtStream(contracts.farm.Created)
    .pipe(cs.object.each(async evt => {
      const { blockNumber, args } = evt;
      const { owner, farmId, name } = args;

      updateBlockNumber(blockNumber);

      await db.models.farm.upsert({
        id: farmId.toNumber(),
        name: web3.toUtf8(name),
        nameHex: name,
        owner
      });

      await db.models.userFarm.upsert({
        userAddress: owner,
        farmId: farmId.toNumber()
      });
    }));

  evtStream(contracts.farm.Joined)
    .pipe(cs.object.each(async evt => {
      const { blockNumber, args } = evt;
      const { user, farmId } = args;

      updateBlockNumber(blockNumber);

      await db.models.userFarm.upsert({
        userAddress: user,
        farmId: farmId.toNumber()
      });
    }));

})().catch(console.error);