import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select(
          `
          *,
          subcategoria:subcategorias (
            id,
            nome,
            categoria:categorias (
              id,
              nome
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        nome,
        peso,
        descricao,
        preco,
        precoPromocional,
        imagem_url,
        subcategoria_id,
      } = req.body;

      if (!nome || !peso || !preco || !descricao || !subcategoria_id) {
        return res.status(400).json({
          error: "Nome, peso, preço, descrição e subcategoria são obrigatórios",
        });
      }

      const { data, error } = await supabase.from("produtos").insert([
        {
          nome,
          peso,
          descricao,
          preco,
          preco_promocional: precoPromocional,
          imagem_url,
          subcategoria_id,
        },
      ]).select(`
          *,
          subcategoria:subcategorias (
            id,
            nome,
            categoria:categorias (
              id,
              nome
            )
          )
        `);

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      return res.status(500).json({ error: "Erro ao criar produto" });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        id,
        nome,
        peso,
        descricao,
        preco,
        precoPromocional,
        imagem_url,
        subcategoria_id,
      } = req.body;

      if (!id || !nome || !peso || !preco || !descricao || !subcategoria_id) {
        return res.status(400).json({
          error:
            "ID, nome, peso, preço, descrição e subcategoria são obrigatórios",
        });
      }

      const { data, error } = await supabase
        .from("produtos")
        .update({
          nome,
          peso,
          descricao,
          preco,
          preco_promocional: precoPromocional,
          imagem_url,
          subcategoria_id,
        })
        .eq("id", id).select(`
          *,
          subcategoria:subcategorias (
            id,
            nome,
            categoria:categorias (
              id,
              nome
            )
          )
        `);

      if (error) throw error;
      return res.status(200).json(data[0]);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      return res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      const { error } = await supabase.from("produtos").delete().eq("id", id);

      if (error) throw error;
      return res.status(200).json({ message: "Produto excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      return res.status(500).json({ error: "Erro ao excluir produto" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
