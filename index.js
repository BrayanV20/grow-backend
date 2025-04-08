const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

// ✅ CORS para permitir llamadas desde el frontend de Vercel
app.use(cors({
  origin: "https://firmas-six.vercel.app",
  methods: ["POST", "GET"],
  credentials: true
}));

app.use(express.json());

const uri = "mongodb+srv://auxiliaradmongrow:Brayan20@cluster0.c5sb6sy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

app.post("/formulario", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("formulario_db");
    const collection = database.collection("respuestas");

    const datos = req.body;
    const resultado = await collection.insertOne(datos);

    res.status(200).json({ mensaje: "Datos guardados", id: resultado.insertedId });
  } catch (error) {
    console.error("❌ Error al guardar en la base de datos:", error);
    res.status(500).json({ error: "Error al guardar los datos" });
  } finally {
    await client.close();
  }
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente ✅");
});

app.listen(PORT, () => {
  console.log(`🟢 Servidor escuchando en el puerto ${PORT}`);
});


