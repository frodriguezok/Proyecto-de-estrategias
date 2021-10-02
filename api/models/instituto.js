'use strict';
module.exports = (sequelize, DataTypes) => {
  const instituto = sequelize.define('instituto', {
    nombre: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  instituto.associate = function(models) {
    // associations can be defined here
  };
  return instituto;
};