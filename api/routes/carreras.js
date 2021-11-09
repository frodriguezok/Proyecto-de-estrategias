var express = require("express");
var router = express.Router();
var models = require("../models");
const jwt = require('jsonwebtoken');
const key = "clavesecreta2021";

router.post("/login", (req, res) => {
  if(req.body.usuario == "admin" && req.body.pass == "12345"){
    const payload = {
      check:true
    };
    const token = jwt.sign(payload, key,{
      expiresIn: "7d"
    });
    res.json({
      message: "¡Autenticacion exitosa",
      token: token
    });
  }
  else{
    res.json({
      message: "Usuario y/o contraseña incorrecta."
    })
  };
});

const verificacion = express.Router();

verificacion.use((req, res, next)=>{
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if(!token){
    res.status(401).send({
      error: 'Es necesario el token'
    })
    return
  }
  if(token.startsWith('Bearer ')){
    token = token.slice(7, token.length);
    console.log(token);
  }
  if(token){
    jwt.verify(token, key, (error, decoded)=>{
      if(error){
        return res.json({
          message: 'Token no valido'
        });
      }
      else{
        req.decoded = decoded;
        next();
      }
    })
  }
});

router.get("/", verificacion, (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  const numPagina = Number.parseInt(req.query.pagina);
  const numLimite = Number.parseInt(req.query.limite);

  models.carrera
    .findAll({
      attributes: ["id", "nombre"],
      include:[{as:'materias-de-la-carrera', model:models.materia, attributes: ["id","nombre"]}],
      offset: numPagina * numLimite,
      limit: numLimite
    })    
    .then(carreras => res.send(carreras))
    .catch(() => res.sendStatus(500));
});

router.post("/",verificacion, (req, res) => {
  models.carrera
    .create({ nombre: req.body.nombre })
    .then(carrera => res.status(201).send({ id: carrera.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre"],
      include:[{as:'materias-de-la-carrera', model:models.materia, attributes: ["id","nombre"]}],
      where: { id }
    })
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id",verificacion, (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id",verificacion, (req, res) => {
  const onSuccess = carrera =>
    carrera
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id",verificacion, (req, res) => {
  const onSuccess = carrera =>
    carrera
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
