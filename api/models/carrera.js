'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING
  }, {});
  
carrera.associate = function(models) {
  	carrera.hasMany(models.materia, 
    {
      as: 'materias-de-la-carrera',                 
      foreignKey: 'id_carrera'       
    })
};

  return carrera;
};