import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const pedido = req.body;

      const { data, error } = await supabase
        .from("pedidos")
        .insert([pedido])
        .select();

      if (error) throw error;

      res.status(200).json(data[0]);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      res.status(500).json({ error: "Erro ao criar pedido" });
    }
  } else if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
