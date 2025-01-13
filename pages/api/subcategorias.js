import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("subcategorias")
        .select(
          `
          *,
          categoria:categorias(nome)
        `
        )
        .order("nome");

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar subcategorias:", error);
      return res.status(500).json({ error: "Erro ao buscar subcategorias" });
    }
  }

  if (req.method === "POST") {
    try {
      const { nome, categoria_id } = req.body;

      if (!nome || !categoria_id) {
        return res.status(400).json({
          error: "Nome e categoria são obrigatórios",
        });
      }

      const { data, error } = await supabase
        .from("subcategorias")
        .insert([{ nome, categoria_id }])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (error) {
      console.error("Erro ao criar subcategoria:", error);
      return res.status(500).json({ error: "Erro ao criar subcategoria" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      const { error } = await supabase
        .from("subcategorias")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return res
        .status(200)
        .json({ message: "Subcategoria excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir subcategoria:", error);
      return res.status(500).json({ error: "Erro ao excluir subcategoria" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
