import { supabase } from "../../../lib/supabaseClient";
import { deleteImage } from "../../../lib/imageProcessor";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      // Primeiro, buscar o produto para obter a URL da imagem
      const { data: produto } = await supabase
        .from("produtos")
        .select("imagem")
        .eq("id", id)
        .single();

      if (produto?.imagem) {
        // Deletar a imagem do Storage
        await deleteImage(produto.imagem);
      }

      // Deletar o produto do banco
      const { error } = await supabase.from("produtos").delete().eq("id", id);

      if (error) throw error;

      return res.status(200).json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      return res.status(500).json({ error: "Erro ao deletar produto" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
