const _ = require('co-lodash');
const cs = require('co-stream');
const { Web3EventStream } = require('web3-stream');
const { web3, contracts } = require('./eth');
const db = require('./db');
const { Op } = db.sequelize;

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

  evtStream(contracts.coinCowCore.Birth)
    .pipe(cs.object.each(async evt => {
      const { blockNumber, args } = evt;
      const { owner, tokenId } = args;

      updateBlockNumber(blockNumber);

      await db.models.cow.update(
        { owner },
        {
          where: {
            id: tokenId.toNumber(),
            owner: { [Op.eq]: null }
          }
        }
      );
    }));

  evtStream(contracts.coinCowCore.Transfer)
    .pipe(cs.object.each(async evt => {
      const { blockNumber, args } = evt;
      const { to, tokenId } = args;

      updateBlockNumber(blockNumber);

      //if (to !== contracts.auctionHouse.address)
      await db.models.cow.upsert({ id: tokenId.toNumber(), owner: to });
    }));

  evtStream(contracts.auctionHouse.AuctionCreated)
    .pipe(cs.object.each(async evt => {
      const { blockNumber, args } = evt;
      const { tokenId, price, ts } = args;

      updateBlockNumber(blockNumber);

      const auctionTs = new Date(ts.toNumber() * 1000);
      await db.models.cow.update(
        { price: web3.fromWei(price), auctionTs },
        {
          where: {
            id: tokenId.toNumber(),
            auctionTs: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.lt]: auctionTs
              }
            }
          }
        });
    }));

  for (const event of [contracts.auctionHouse.AuctionSuccessful, contracts.auctionHouse.AuctionCancelled]) {
    evtStream(event)
      .pipe(cs.object.each(async evt => {
        const { blockNumber, args } = evt;
        const { tokenId, ts } = args;

        updateBlockNumber(blockNumber);

        const auctionTs = new Date(ts.toNumber() * 1000);
        await db.models.cow.update(
          { price: null, auctionTs },
          {
            where: {
              id: tokenId.toNumber(),
              auctionTs: {
                [Op.or]: {
                  [Op.eq]: null,
                  [Op.lt]: auctionTs
                }
              }
            }
          });
      }));
  }

  for (const cowContract of [contracts.ethSwapCow, contracts.btcSwapCow]) {
    const contractUnit = await cowContract.contractUnit();
    const profitUnit = await cowContract.profitUnit();

    evtStream(cowContract.CowCreated)
      .pipe(cs.object.each(async evt => {
        const { blockNumber, args } = evt;
        const { tokenId } = args;

        updateBlockNumber(blockNumber);

        const [contractSize, , , startTime, endTime] = await cowContract.getCowInfo(tokenId);
        await db.models.cow.upsert({
          id: tokenId.toNumber(),
          contract: cowContract.address,
          contractSize: contractSize.toNumber(),
          contractUnit,
          profitUnit,
          startTime: new Date(startTime.toNumber() * 1000),
          endTime: new Date(endTime.toNumber() * 1000)
        });
      }));
  }
})().catch(console.error);