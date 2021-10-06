'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING
  }, {});
  
carrera.associate = function(models) {
  	carrera.hasMany(models.materia, 
    {
      as: 'materia',                 
      foreignKey: 'id_carrera'       
    })
};

  return carrera;
};