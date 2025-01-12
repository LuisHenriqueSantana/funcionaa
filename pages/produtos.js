import { useState, useEffect } from "react";
import {
  createProduto,
  getProdutos,
  updateProduto,
  deleteProduto,
} from "./api/produtos";
import styles from "../styles/produtos.module.css";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    peso: "",
    preco: "",
    precoPromocional: "",
    descricao: "",
  });
  const [imagem, setImagem] = useState(null);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert("Erro ao carregar produtos");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editando) {
        await updateProduto(editando.id, formData, imagem);
      } else {
        await createProduto(formData, imagem);
      }
      carregarProdutos();
      limparFormulario();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto");
    }
  }

  async function handleDelete(id) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduto(id);
        carregarProdutos();
      } catch (error) {
        console.error("Erro ao deletar produto:", error);
        alert("Erro ao deletar produto");
      }
    }
  }

  function handleEdit(produto) {
    setEditando(produto);
    setFormData({
      nome: produto.nome,
      peso: produto.peso,
      preco: produto.preco,
      precoPromocional: produto.preco_promocional,
      descricao: produto.descricao,
    });
  }

  function limparFormulario() {
    setFormData({
      nome: "",
      peso: "",
      preco: "",
      precoPromocional: "",
      descricao: "",
    });
    setImagem(null);
    setEditando(null);
  }

  return (
    <div className={styles.container}>
      <h1 className="titulo">Gerenciar Produtos</h1>

      <form onSubmit={handleSubmit} className="formulario">
        <div className="campo">
          <label>Nome:</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        <div className="campo">
          <label>Peso:</label>
          <input
            type="text"
            value={formData.peso}
            onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
            required
          />
        </div>

        <div className="campo">
          <label>Preço:</label>
          <input
            type="number"
            value={formData.preco}
            onChange={(e) =>
              setFormData({ ...formData, preco: e.target.value })
            }
            required
          />
        </div>

        <div className="campo">
          <label>Preço Promocional:</label>
          <input
            type="number"
            value={formData.precoPromocional}
            onChange={(e) =>
              setFormData({ ...formData, precoPromocional: e.target.value })
            }
          />
        </div>

        <div className="campo">
          <label>Descrição:</label>
          <textarea
            value={formData.descricao}
            onChange={(e) =>
              setFormData({ ...formData, descricao: e.target.value })
            }
            required
          />
        </div>

        <div className="campo">
          <label>Imagem:</label>
          <input
            type="file"
            onChange={(e) => setImagem(e.target.files[0])}
            accept="image/*"
            required={!editando}
          />
        </div>

        <div className="botoes">
          <button type="submit" className="botao botao-primario">
            {editando ? "Atualizar" : "Criar"} Produto
          </button>
          {editando && (
            <button
              type="button"
              onClick={limparFormulario}
              className="botao botao-secundario"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="grid-produtos">
        {produtos.map((produto) => (
          <div key={produto.id} className="card-produto">
            {produto.imagem_url && (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos-imagens/${produto.imagem_url}`}
                alt={produto.nome}
                className="imagem-produto"
              />
            )}
            <h3 className="nome-produto">{produto.nome}</h3>
            <p className="info-produto">Peso: {produto.peso}</p>
            <p className="info-produto">Preço: R$ {produto.preco}</p>
            {produto.preco_promocional && (
              <p className="info-produto">
                Preço Promocional: R$ {produto.preco_promocional}
              </p>
            )}
            <p className="descricao-produto">{produto.descricao}</p>
            <div className="acoes-produto">
              <button
                onClick={() => handleEdit(produto)}
                className="botao botao-editar"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(produto.id)}
                className="botao botao-excluir"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
