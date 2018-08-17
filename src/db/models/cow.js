
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cow', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    owner: {
      type: DataTypes.STRING(42),
      allowNull: true
    },
    contract: {
      type: DataTypes.STRING(42),
      allowNull: true
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    auctionTs: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'auction_ts'
    },
    contractSize: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'contract_size'
    },
    contractUnit: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'contract_unit'
    },
    profitUnit: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'profit_unit'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_time'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_time'
    }
  }, {
    timestamps: false,
    tableName: 'cow',
    indexes: [
      { fields: ['owner'] }
    ]
  });
};