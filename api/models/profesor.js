'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define('profesor', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    id_materia: DataTypes.INTEGER
  }, {});
  profesor.associate = function(models) {
    profesor.belongsTo(models.materia
      ,{
        as : 'materia-relacionada', 
        foreignKey: 'id_materia'     
      })
  };
  return profesor;
};