const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://auxiliaradmongrow:Brayan20@cluster0.c5sb6sy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ mensaje: "Método no permitido" });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("formulario_db");
    const collection = database.collection("respuestas");

    const datos = req.body;
    const resultado = await collection.insertOne(datos);

    res.status(200).json({ mensaje: "Datos guardados", id: resultado.insertedId });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al guardar los datos" });
  } finally {
    await client.close();
  }
};


