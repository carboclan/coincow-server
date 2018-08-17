
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userInfo', {
    address: {
      type: DataTypes.STRING(42),
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
    avatar: {
      type: DataTypes.STRING(256),
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'user_info'
    // indexes: [
    //   { fields: ['name'] }
    // ]
  });
};