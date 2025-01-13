import { supabase } from "./supabaseClient";

export async function uploadFile(file) {
  try {
    // Gerar nome único para o arquivo
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}${getExtension(file.originalname)}`;
    const filePath = `produtos/${fileName}`;

    // Upload direto para o Supabase Storage
    const { data, error } = await supabase.storage
      .from("seu-bucket")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Gerar URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("seu-bucket").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    throw new Error(`Erro no upload: ${error.message}`);
  }
}

function getExtension(filename) {
  return filename.substring(filename.lastIndexOf("."));
}
