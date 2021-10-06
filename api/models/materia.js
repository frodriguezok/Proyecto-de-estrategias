'use strict';
module.exports = (sequelize, DataTypes) => {
  const materia = sequelize.define('materia', {
    nombre: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  materia.associate = function(models) {
    // associations can be defined here
    materia.belongsTo(models.carrera// modelo al que pertenece
      ,{
        as : 'Carrera-Relacionada',  // nombre de mi relacion
        foreignKey: 'id_carrera'     // campo con el que voy a igualar
      })
  };

  materia.associate = function(models) {
  	materia.hasMany(models.profesor,  // Modelo al que pertenece
    {
      as: 'profesor',                 // nombre de mi relacion
      foreignKey: 'id_materia'      // campo con el que voy a igualar 
    })
};
  return materia;
};