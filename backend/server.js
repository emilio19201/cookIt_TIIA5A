const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conectar a MongoDB
mongoose.connect("mongodb://localhost/RecipiesSNT", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  fotoPerfil: String,
  recetasFavoritas: [String],
  seguidores: [String],
  siguiendo: [String],
  publicaciones: [String],
});
const Usuario = mongoose.model("Usuario", usuarioSchema);

const recetaSchema = new mongoose.Schema({
  titulo: String,
  ingredientes: [String],
  pasos: [String],
  tiempoPreparacion: String,
  dificultad: String,
  etiquetas: [String],
  imagenUrl: String,
  autor: String,
  fechaCreacion: { type: Date, default: Date.now },
  likes: [String],
  compartidoPor: [String],
  estado: { type: String, default: "Publicado" },
  ediciones: [String],
});
const Receta = mongoose.model("Receta", recetaSchema);

const comentarioSchema = new mongoose.Schema({
  idReceta: String,
  autor: String,
  comentario: String,
  valoracion: Number,
  fecha: { type: Date, default: Date.now },
  respuestas: [String],
  reportado: { type: Boolean, default: false },
});
const Comentario = mongoose.model("Comentario", comentarioSchema);

const notificacionSchema = new mongoose.Schema({
  idUsuario: String,
  tipo: String,
  detalles: String,
  fecha: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false },
});
const Notificacion = mongoose.model("Notificacion", notificacionSchema);

// Rutas
app.post("/usuarios", async (req, res) => {
  const usuario = new Usuario(req.body);
  const resultado = await usuario.save();
  res.json({ id: resultado._id });
});

app.post("/recetas", async (req, res) => {
  const receta = new Receta(req.body);
  const resultado = await receta.save();
  res.json({ id: resultado._id });
});

app.post("/recetas/:receta_id/like", async (req, res) => {
  const { usuario_id } = req.body;
  const resultado = await Receta.findByIdAndUpdate(req.params.receta_id, {
    $addToSet: { likes: usuario_id },
  });
  res.json({ message: resultado ? "Like agregado" : "No se pudo dar like" });
});

app.post("/recetas/:receta_id/comentarios", async (req, res) => {
  const comentario = new Comentario({ ...req.body, idReceta: req.params.receta_id });
  const resultado = await comentario.save();
  res.json({ id: resultado._id });
});

app.post("/usuarios/:usuario_id/seguir", async (req, res) => {
  const { seguir_id } = req.body;
  await Usuario.findByIdAndUpdate(req.params.usuario_id, { $addToSet: { siguiendo: seguir_id } });
  await Usuario.findByIdAndUpdate(seguir_id, { $addToSet: { seguidores: req.params.usuario_id } });
  res.json({ message: "Ahora sigues a este usuario" });
});

app.post("/notificaciones", async (req, res) => {
  const notificacion = new Notificacion(req.body);
  const resultado = await notificacion.save();
  res.json({ id: resultado._id });
});

app.get("/recetas", async (req, res) => {
  const recetas = await Receta.find();
  res.json(recetas);
});

app.get("/usuarios", async (req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
});

app.use((req, res) => {
  res.status(404).json({ message: `Resource not found: ${req.url}` });
});

app.listen(3000, () => console.log("Servidor corriendo en el puerto 3000"));
