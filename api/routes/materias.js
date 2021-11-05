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
  //console.log(token);
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

router.get("/", verificacion, (req, res,next) => {
  const numPagina = Number.parseInt(req.query.pagina);
  const numLimite = Number.parseInt(req.query.limite);
  models.materia.findAll({attributes: ["id","nombre","id_carrera"],
        offset: numPagina * numLimite ,
        limit: numLimite,
        include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["id","nombre"]}]
      }).then(materias => res.send(materias)).catch(error => { return next(error)});
  });


router.post("/", (req, res) => {
    models.materia
      .create({ nombre: req.body.nombre, id_carrera: req.body.id_carrera })
      .then(materia => res.status(201).send({ id: materia.id }))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar insertar en la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
});

const findMateria = (id, { onSuccess, onNotFound, onError }) => {
    models.materia
      .findOne({
        attributes: ["id", "nombre", "id_carrera"],
        include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["id","nombre"]}],
        where: { id }
      })
      .then(materia => (materia ? onSuccess(materia) : onNotFound()))
      .catch(() => onError());
  };

router.get("/:id", (req, res) => {
    findMateria(req.params.id, {
      onSuccess: materia => res.send(materia),
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
});

router.put("/:id", (req, res) => {
    const onSuccess = materia =>
      materia
        .update({ nombre: req.body.nombre, id_carrera: req.body.id_carrera }, { fields: ["nombre","id_carrera"] })
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
      findMateria(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  });

router.delete("/:id", (req, res) => {
    const onSuccess = materia =>
      materia
        .destroy()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
    findMateria(req.params.id, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
});
  
  module.exports = router;
  