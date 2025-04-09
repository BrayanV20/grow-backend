const { Document, Packer, Paragraph, TextRun } = require("docx");
const fs = require("fs");
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  // ✅ Habilitar CORS
  res.setHeader("Access-Control-Allow-Origin", "https://firmas-six.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Manejar preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  let body = "";
  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const { tipo, propiedad, direccion, nit, representante, firma } = JSON.parse(body);

      // 📝 Crear documento Word
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun(`Tipo de contrato: ${tipo}`),
                  new TextRun(`\nPropiedad: ${propiedad}`),
                  new TextRun(`\nDirección: ${direccion}`),
                  new TextRun(`\nNIT: ${nit}`),
                  new TextRun(`\nRepresentante legal: ${representante}`),
                ],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = `Contrato_${tipo}_${propiedad}.docx`;
      const filepath = `/tmp/${filename}`;
      fs.writeFileSync(filepath, buffer);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "auxiliaradmongrow@gmail.com",
          pass: "xbbdfjqczgitznyy"
        }
      });

      await transporter.sendMail({
        from: '"Grow Solutions" <auxiliaradmongrow@gmail.com>',
        to: "auxiliaradmongrow@gmail.com",
        subject: `Nuevo contrato - ${propiedad}`,
        text: "Se ha enviado un nuevo contrato.",
        attachments: [
          {
            filename,
            path: filepath
          }
        ]
      });

      res.status(200).json({ mensaje: "Contrato enviado correctamente ✅" });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ error: "Error al procesar o enviar el contrato" });
    }
  });
};
