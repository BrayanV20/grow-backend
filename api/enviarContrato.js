const nodemailer = require("nodemailer");
const fs = require("fs");

module.exports = async (req, res) => {
  try {
    const { tipo, propiedad, representante } = req.body;
    const filePath = `./contratos/Contrato_${tipo}_${propiedad}.docx`; // Ajusta si la ruta es diferente

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tucorreo@gmail.com", // cambia esto por el tuyo o usa variables de entorno
        pass: "tu_contraseña",      // igual aquí
      },
    });

    await transporter.sendMail({
      from: '"Grow Solutions" <tucorreo@gmail.com>',
      to: "auxiliaradomongrow@gmail.com",
      subject: `Nuevo contrato: ${tipo} - ${propiedad}`,
      text: `Contrato firmado por ${representante}. Ver archivo adjunto.`,
      attachments: [
        {
          filename: `Contrato_${tipo}_${propiedad}.docx`,
          path: filePath,
        },
      ],
    });

    fs.unlinkSync(filePath); // Elimina el archivo temporal

    res.status(200).json({ mensaje: "✅ Contrato enviado correctamente por correo" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al enviar el contrato" });
  }
};
