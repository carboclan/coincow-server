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

  (new Web3EventStream(
      web3,
      contracts.userInfo.Registered,
      {}, { fromBlock, to: 'latest' })
  ).pipe(cs.object.each(async evt => {
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
})().catch(console.error);