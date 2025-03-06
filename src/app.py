from flask import Flask, request, jsonify, Response
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import json_util, ObjectId
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Configuración de MongoDB
app.config['MONGO_URI'] = 'mongodb://localhost/RecipiesSNT'
mongo = PyMongo(app)

# Colecciones
usuarios_coleccion = mongo.db.usuarios
recetas_coleccion = mongo.db.recetas
comentarios_coleccion = mongo.db.comentarios
notificaciones_coleccion = mongo.db.notificaciones
categorias_coleccion = mongo.db.get("categorias", None)  # Colección opcional de categorías

# Crear usuario
@app.route('/usuarios', methods=['POST'])
def crear_usuario():
    data = request.json
    nombre = data.get('nombre')
    email = data.get('email')
    foto_perfil = data.get('fotoPerfil')

    usuario = {
        "nombre": nombre,
        "email": email,
        "fotoPerfil": foto_perfil,
        "recetasFavoritas": [],
        "seguidores": [],
        "siguiendo": [],
        "publicaciones": []
    }
    resultado = usuarios_coleccion.insert_one(usuario)
    return jsonify({"id": str(resultado.inserted_id)})

# Crear receta
@app.route('/recetas', methods=['POST'])
def crear_receta():
    data = request.json
    receta = {
        "titulo": data.get('titulo'),
        "ingredientes": data.get('ingredientes'),
        "pasos": data.get('pasos'),
        "tiempoPreparacion": data.get('tiempoPreparacion'),
        "dificultad": data.get('dificultad'),
        "etiquetas": data.get('etiquetas'),
        "imagenUrl": data.get('imagenUrl'),
        "autor": data.get('autor'),
        "fechaCreacion": datetime.datetime.now(),
        "likes": [],
        "compartidoPor": [],
        "estado": "Publicado",
        "ediciones": []
    }
    resultado = recetas_coleccion.insert_one(receta)
    return jsonify({"id": str(resultado.inserted_id)})

# Dar Like a receta
@app.route('/recetas/<receta_id>/like', methods=['POST'])
def dar_like(receta_id):
    usuario_id = request.json.get('usuario_id')
    resultado = recetas_coleccion.update_one(
        {"_id": ObjectId(receta_id)},
        {"$addToSet": {"likes": usuario_id}}
    )
    if resultado.modified_count > 0:
        return jsonify({"message": "Like agregado"})
    return jsonify({"message": "No se pudo dar like"}), 400

# Agregar comentario a receta
@app.route('/recetas/<receta_id>/comentarios', methods=['POST'])
def agregar_comentario(receta_id):
    data = request.json
    comentario = {
        "idReceta": receta_id,
        "autor": data.get('autor'),
        "comentario": data.get('comentario'),
        "valoracion": data.get('valoracion'),
        "fecha": datetime.datetime.now(),
        "respuestas": [],
        "reportado": False
    }
    resultado = comentarios_coleccion.insert_one(comentario)
    return jsonify({"id": str(resultado.inserted_id)})

# Seguir usuario
@app.route('/usuarios/<usuario_id>/seguir', methods=['POST'])
def seguir_usuario(usuario_id):
    seguir_id = request.json.get('seguir_id')
    resultado = usuarios_coleccion.update_one(
        {"_id": ObjectId(usuario_id)},
        {"$addToSet": {"siguiendo": seguir_id}}
    )
    if resultado.modified_count > 0:
        usuarios_coleccion.update_one(
            {"_id": ObjectId(seguir_id)},
            {"$addToSet": {"seguidores": usuario_id}}
        )
        return jsonify({"message": "Ahora sigues a este usuario"})
    return jsonify({"message": "No se pudo seguir al usuario"}), 400

# Enviar notificación
@app.route('/notificaciones', methods=['POST'])
def enviar_notificacion():
    data = request.json
    notificacion = {
        "idUsuario": data.get('idUsuario'),
        "tipo": data.get('tipo'),
        "detalles": data.get('detalles'),
        "fecha": datetime.datetime.now(),
        "leido": False
    }
    resultado = notificaciones_coleccion.insert_one(notificacion)
    return jsonify({"id": str(resultado.inserted_id)})

# Obtener recetas
@app.route('/recetas', methods=['GET'])
def obtener_recetas():
    recetas = recetas_coleccion.find()
    response = json_util.dumps(recetas)
    return Response(response, mimetype='application/json')

# Crear categoría
@app.route('/categorias', methods=['POST'])
def crear_categoria():
    data = request.json
    categoria = {
        "nombre": data.get('nombre'),
        "descripcion": data.get('descripcion', "")
    }
    resultado = categorias_coleccion.insert_one(categoria)
    return jsonify({"id": str(resultado.inserted_id)})

# Obtener un usuario
@app.route('/usuarios', methods=['GET'])
def obtener_usuario():
    usuarios = usuarios_coleccion.find()
    response = json_util.dumps(usuarios)
    return Response(response, mimetype='application/json')

# Manejo de errores 404
@app.errorhandler(404)
def not_found(error=None):
    response = jsonify({
        'message': 'Resource not found: ' + request.url,
        'status': 404
    })
    response.status_code = 404
    return response

if __name__ == "__main__":
    app.run(debug=True)

