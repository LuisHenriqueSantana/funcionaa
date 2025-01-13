let sharp;

if (typeof window === "undefined") {
  sharp = require("sharp");
}

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function processImage(buffer) {
  if (typeof window !== "undefined") {
    throw new Error("Esta função só pode ser executada no servidor");
  }

  try {
    const fileName = `${Date.now()}.webp`;

    // Processa a imagem com sharp
    const processedImageBuffer = await sharp(buffer)
      .resize(300, 300, {
        fit: "cover",
        position: "center",
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
        lossless: false,
        effort: 4,
      })
      .toBuffer();

    // Upload para o Supabase
    const { data, error } = await supabase.storage
      .from("produtos-imagens")
      .upload(fileName, processedImageBuffer, {
        contentType: "image/webp",
      });

    if (error) throw error;

    // Obter a URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("produtos-imagens").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Erro no processamento da imagem:", error);
    throw error;
  }
}

export async function deleteImage(imagePath) {
  if (typeof window !== "undefined") {
    throw new Error("Esta função só pode ser executada no servidor");
  }

  try {
    const fileName = imagePath.split("/").pop();
    await supabase.storage.from("produtos-imagens").remove([fileName]);
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    throw error;
  }
}
