import { supabase } from "../../lib/supabaseClient";

// Criar produto
export async function createProduto(produto, imagem) {
  try {
    // Upload da imagem
    const { data: imageData, error: imageError } = await supabase.storage
      .from("produtos-imagens")
      .upload(`${Date.now()}-${imagem.name}`, imagem);

    if (imageError) throw imageError;

    // Criar produto no banco
    const { data, error } = await supabase
      .from("produtos")
      .insert([
        {
          nome: produto.nome,
          peso: produto.peso,
          preco: produto.preco,
          preco_promocional: produto.precoPromocional,
          descricao: produto.descricao,
          imagem_url: imageData.path,
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
}

// Listar produtos
export async function getProdutos() {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    throw error;
  }
}

// Buscar produto por ID
export async function getProdutoById(id) {
  try {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw error;
  }
}

// Atualizar produto
export async function updateProduto(id, produto, novaImagem = null) {
  try {
    let imagemPath = produto.imagem_url;

    // Se houver uma nova imagem, fazer upload
    if (novaImagem) {
      const { data: imageData, error: imageError } = await supabase.storage
        .from("produtos-imagens")
        .upload(`${Date.now()}-${novaImagem.name}`, novaImagem);

      if (imageError) throw imageError;
      imagemPath = imageData.path;
    }

    // Atualizar produto
    const { data, error } = await supabase
      .from("produtos")
      .update({
        nome: produto.nome,
        peso: produto.peso,
        preco: produto.preco,
        preco_promocional: produto.precoPromocional,
        descricao: produto.descricao,
        imagem_url: imagemPath,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}

// Deletar produto
export async function deleteProduto(id) {
  try {
    // Primeiro, buscar o produto para obter a URL da imagem
    const produto = await getProdutoById(id);

    // Deletar a imagem do storage
    if (produto.imagem_url) {
      const { error: storageError } = await supabase.storage
        .from("produtos-imagens")
        .remove([produto.imagem_url]);

      if (storageError) throw storageError;
    }

    // Deletar o produto
    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
}
