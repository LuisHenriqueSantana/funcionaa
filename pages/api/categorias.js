import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nome");

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return res.status(500).json({ error: "Erro ao buscar categorias" });
    }
  }

  if (req.method === "POST") {
    try {
      const { nome } = req.body;

      if (!nome) {
        return res.status(400).json({
          error: "Nome é obrigatório",
        });
      }

      const { data, error } = await supabase
        .from("categorias")
        .insert([{ nome }])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      return res.status(500).json({ error: "Erro ao criar categoria" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      const { error } = await supabase.from("categorias").delete().eq("id", id);

      if (error) throw error;
      return res
        .status(200)
        .json({ message: "Categoria excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      return res.status(500).json({ error: "Erro ao excluir categoria" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
