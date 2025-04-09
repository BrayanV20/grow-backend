const { Document, Packer, Paragraph, TextRun, ImageRun } = require("docx");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ mensaje: "Método no permitido" });
  }

  const { tipo, propiedad, direccion, nit, representante, firma } = req.body;

  try {
    // Convertir la imagen base64 (firma) a buffer
    const firmaBase64 = firma.split(",")[1];
    const firmaBuffer = Buffer.from(firmaBase64, "base64");

    // Crear documento Word
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `Contrato: ${tipo}`, heading: "Heading1" }),
          new Paragraph({ text: `Propiedad: ${propiedad}` }),
          new Paragraph({ text: `Dirección: ${direccion}` }),
          new Paragraph({ text: `NIT: ${nit}` }),
          new Paragraph({ text: `Representante Legal: ${representante}` }),
          new Paragraph({ text: " " }),
          new Paragraph({ text: "Firma del cliente:", bold: true }),
          new Paragraph({
            children: [new ImageRun({ data: firmaBuffer, transformation: { width: 200, height: 80 } })]
          }),
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(__dirname, "Contrato.docx");
    fs.writeFileSync(filePath, buffer);

    // Configurar el correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "auxiliaradmongrow@gmail.com",
        pass: "xbbdfjqczgitznyy" // ← tu contraseña de app de Gmail
      }
    });

    await transporter.sendMail({
      from: '"Grow Solutions" <auxiliaradmongrow@gmail.com>',
      to: "auxiliaradmongrow@gmail.com", // ← destinatario final
      subject: `Nuevo contrato: ${tipo} - ${propiedad}`,
      text: `Contrato firmado por ${representante}. Ver archivo adjunto.`,
      attachments: [
        {
          filename: `Contrato_${tipo}_${propiedad}.docx`,
          path: filePath
        }
      ]
    });

    fs.unlinkSync(filePath); // borrar el archivo temporal

    res.status(200).json({ mensaje: "📄 Contrato enviado correctamente por correo" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al enviar el contrato" });
  }
};
