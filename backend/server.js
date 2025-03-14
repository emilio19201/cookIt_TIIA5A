require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());


// Conexion a MongoDB 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//Schemas
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true },
  password: String,
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
  autor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  fechaCreacion: { type: Date, default: Date.now },
  likes: [String],
  compartidoPor: [String],
  estado: { type: String, default: "Publicado" },
  ediciones: [String],
});
const Receta = mongoose.model("Receta", recetaSchema);

const comentarioSchema = new mongoose.Schema({
  idReceta: { type: mongoose.Schema.Types.ObjectId, ref: 'Receta' },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // Referencia al usuario que comenta
  comentario: String,
  valoracion: { type: Number, min: 1, max: 5, required: true },
  fecha: { type: Date, default: Date.now },
  respuestas: [String],
  reportado: { type: Boolean, default: false },
});

const Comentario = mongoose.model("Comentario", comentarioSchema);

const notificacionSchema = new mongoose.Schema({
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  tipo: { 
    type: String, 
    enum: ['like', 'comentario', 'seguidor'], 
    required: true 
  },
  detalles: String,
  fecha: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false },
});
const Notificacion = mongoose.model("Notificacion", notificacionSchema);

// Rutas////
app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = new Usuario({ nombre, email, password: hashedPassword });
    const resultado = await usuario.save();
    res.status(201).json({ id: resultado._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/recetas", async (req, res) => {
  try {
    const receta = new Receta(req.body);
    const resultado = await receta.save();
    res.status(201).json({ id: resultado._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/recetas/:receta_id/like", async (req, res) => {
  try {
    console.log("Receta ID:", req.params.receta_id); // Log para depurar
    console.log("Usuario ID:", req.body.usuario_id); // Log para depurar

    const { usuario_id } = req.body;
    const resultado = await Receta.findByIdAndUpdate(req.params.receta_id, {
      $addToSet: { likes: usuario_id },
    }, { new: true });
    if (!resultado) throw new Error("Receta no encontrada");

    res.status(200).json({ message: "Like agregado", receta: resultado });
  } catch (error) {
    console.error("Error:", error.message); // Log para depurar
    res.status(404).json({ error: error.message });
  }
});


app.post("/recetas/:receta_id/comentarios", async (req, res) => {
  try {
    const receta = await Receta.findById(req.params.receta_id);
    if (!receta) return res.status(404).json({ error: "Receta no encontrada" });

    const comentario = new Comentario({ ...req.body, idReceta: req.params.receta_id });
    const resultado = await comentario.save();
    
    res.status(201).json({ id: resultado._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/usuarios/:usuario_id/seguir", async (req, res) => {
  try {
    const { seguir_id } = req.body;
    const usuario = await Usuario.findById(req.params.usuario_id);
    const seguir = await Usuario.findById(seguir_id);
    if (!usuario || !seguir) throw new Error("Usuario no encontrado");

    await Usuario.findByIdAndUpdate(req.params.usuario_id, { $addToSet: { siguiendo: seguir_id } });
    await Usuario.findByIdAndUpdate(seguir_id, { $addToSet: { seguidores: req.params.usuario_id } });
    res.status(200).json({ message: "Ahora sigues a este usuario" });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post("/notificaciones", async (req, res) => {
  try {
    const notificacion = new Notificacion(req.body);
    const resultado = await notificacion.save();
    res.status(201).json({ id: resultado._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/recetas", async (req, res) => {
  try {
    const recetas = await Receta.find().populate("autor", "nombre email");
    res.status(200).json(recetas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Resource not found: ${req.url}` });
});

//login 
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
