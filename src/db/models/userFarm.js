
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userFarm', {
    userAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
      primaryKey: true,
      field: 'user_address'
    },
    farmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'farm_id'
    }
  }, {
    timestamps: false,
    tableName: 'user_farm',
    indexes: [
      { fields: ['farm_id'] }
    ]
  });
};