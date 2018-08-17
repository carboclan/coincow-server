
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('farm', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    nameHex: {
      type: DataTypes.STRING(66),
      allowNull: false,
      field: 'name_hex'
    },
    owner: {
      type: DataTypes.STRING(42),
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'farm'
  });
};