var express = require("express");
var router = express.Router();
var models = require("../models");

//El problema es que en el get hay que aclarar si o si una pagina y un limite, sino tira error.
//Si la tabla esta vacia no hay problemas.

router.get("/", (req, res) => {
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

/*router.get("/", (req, res) => {
  const page = Number.parseInt(req.query.page);
  const size = Number.parseInt(req.query.size);
  models.carrera
  .findAndCountAll({
    attributes: ["id","nombre"],
    offset: page * size,
    limit: size
  })
  .then(carreras => res.send(carreras))
  .catch(() => res.sendStatus(500));
});*/


router.post("/", (req, res) => {
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

router.get("/:id", (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
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

router.delete("/:id", (req, res) => {
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
