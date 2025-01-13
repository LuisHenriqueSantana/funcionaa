import { supabase } from "../../lib/supabaseClient";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  // Garantir que o Content-Type da resposta seja sempre application/json
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { image, fileName } = req.body;

    if (!image || !fileName) {
      return res.status(400).json({
        error: "Imagem ou nome do arquivo não fornecidos",
      });
    }

    // Remove o prefixo "data:image/..." da string base64
    const base64FileData = image.replace(/^data:image\/\w+;base64,/, "");

    // Converte base64 para buffer
    let fileData;
    try {
      fileData = Buffer.from(base64FileData, "base64");
    } catch (error) {
      return res.status(400).json({
        error: "Formato de imagem inválido",
        details: error.message,
      });
    }

    // Processa a imagem com sharp
    let processedBuffer;
    try {
      processedBuffer = await sharp(fileData)
        .resize(300, 300, {
          fit: "cover",
          position: "center",
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao processar imagem",
        details: error.message,
      });
    }

    // Gera um nome único para o arquivo
    const uniqueFileName = `${Date.now()}-${fileName.split(".")[0]}.webp`;

    // Faz upload para o Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("produtos-imagens")
      .upload(uniqueFileName, processedBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      return res.status(500).json({
        error: "Erro ao fazer upload da imagem",
        details: uploadError.message,
      });
    }

    // Gera a URL pública da imagem
    const {
      data: { publicUrl },
    } = supabase.storage.from("produtos-imagens").getPublicUrl(uniqueFileName);

    return res.status(200).json({
      imagePath: publicUrl,
      success: true,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return res.status(500).json({
      error: "Erro ao fazer upload da imagem",
      details: error.message,
      success: false,
    });
  }
}
