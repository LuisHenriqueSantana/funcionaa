import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function uploadImage(file) {
  try {
    // Converter o File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Processar a imagem com sharp
    const processedImage = await sharp(buffer)
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Gerar nome único para o arquivo
    const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`;

    // Fazer upload para o Supabase
    const { data, error } = await supabase.storage
      .from("produtos-imagens") // substitua pelo nome do seu bucket
      .upload(fileName, processedImage, {
        contentType: "image/webp",
      });

    if (error) throw error;

    // Obter a URL pública da imagem
    const {
      data: { publicUrl },
    } = supabase.storage.from("produtos-imagens").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
}
