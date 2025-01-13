import { useState, useEffect } from "react";
import { useCarrinho } from "../contexts/CarrinhoContext";
import Link from "next/link";
import styles from "../styles/produtos.module.css";
import Image from "next/image";

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [produtoDescricao, setProdutoDescricao] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todos");
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState("");
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [descricaoVisivel, setDescricaoVisivel] = useState({});
  const { adicionarAoCarrinho, carrinho } = useCarrinho();

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarProdutos();
  }, [produtos, categoriaSelecionada, subcategoriaSelecionada, termoPesquisa]);

  const carregarDados = async () => {
    try {
      const [resProdutos, resCategorias, resSubcategorias] = await Promise.all([
        fetch("/api/produtos"),
        fetch("/api/categorias"),
        fetch("/api/subcategorias"),
      ]);

      const [dataProdutos, dataCategorias, dataSubcategorias] =
        await Promise.all([
          resProdutos.json(),
          resCategorias.json(),
          resSubcategorias.json(),
        ]);

      setProdutos(dataProdutos);
      setCategorias(dataCategorias);
      setSubcategorias(dataSubcategorias);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const filtrarProdutos = () => {
    let produtosFiltrados = produtos;

    if (termoPesquisa) {
      const termo = termoPesquisa.toLowerCase();
      produtosFiltrados = produtos.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(termo) ||
          produto.descricao.toLowerCase().includes(termo)
      );
    } else {
      if (categoriaSelecionada !== "todos") {
        produtosFiltrados = produtos.filter(
          (produto) => produto.categoria_id === Number(categoriaSelecionada)
        );
      }

      if (subcategoriaSelecionada) {
        produtosFiltrados = produtosFiltrados.filter(
          (produto) =>
            produto.subcategoria_id === Number(subcategoriaSelecionada)
        );
      }
    }

    setProdutosFiltrados(produtosFiltrados);
  };

  const toggleDescricao = (produtoId) => {
    setDescricaoVisivel((prev) => ({
      ...prev,
      [produtoId]: !prev[produtoId],
    }));
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getSubcategoriasPorCategoria = (categoriaId) => {
    return subcategorias.filter(
      (sub) => sub.categoria_id === Number(categoriaId)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.querySelector("input").blur();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Cardápio do Restaurante</h1>
        <Link href="/checkout" className={styles.botaoCarrinho}>
          Carrinho ({carrinho.length})
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.formPesquisa}>
        <input
          type="text"
          placeholder="Pesquisar produtos"
          className={styles.searchInput}
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
        />
      </form>

      <div className={styles.categorias}>
        <button
          className={`${styles.categoriaButton} ${
            categoriaSelecionada === "todos" ? styles.categoriaAtiva : ""
          }`}
          onClick={() => {
            setCategoriaSelecionada("todos");
            setSubcategoriaSelecionada("");
          }}
        >
          Todos
        </button>

        {categorias.map((categoria) => (
          <div key={categoria.id} className={styles.categoriaContainer}>
            <button
              className={`${styles.categoriaButton} ${
                categoriaSelecionada === categoria.id
                  ? styles.categoriaAtiva
                  : ""
              }`}
              onClick={() => setCategoriaSelecionada(categoria.id)}
            >
              {categoria.nome}
            </button>

            {categoriaSelecionada === categoria.id && (
              <select
                className={styles.subcategoriaSelect}
                value={subcategoriaSelecionada}
                onChange={(e) => setSubcategoriaSelecionada(e.target.value)}
              >
                <option value="">Todas as subcategorias</option>
                {getSubcategoriasPorCategoria(categoria.id).map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div className={styles.gridProdutos}>
        {produtosFiltrados.length === 0 ? (
          <p className={styles.mensagemVazia}>Nenhum produto encontrado</p>
        ) : (
          produtosFiltrados.map((produto) => (
            <div key={produto.id} className={styles.cardProduto}>
              <button
                onClick={() => toggleDescricao(produto.id)}
                className={styles.infoButton}
                title="Ver descrição"
              >
                i
              </button>

              {produto.imagem_url && (
                <div className={styles.imagemContainer}>
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className={styles.imagemProduto}
                  />
                </div>
              )}

              <div className={styles.produtoContent}>
                {produto.peso && (
                  <p className={styles.pesoProduto}>{produto.peso}</p>
                )}
                <h3 className={styles.nomeProduto}>{produto.nome}</h3>

                {descricaoVisivel[produto.id] && (
                  <p className={styles.descricaoAtiva}>{produto.descricao}</p>
                )}

                <div className={styles.precoContainer}>
                  {produto.preco_promocional &&
                  produto.preco_promocional >= 0.01 ? (
                    <>
                      <p className={styles.precoRiscado}>
                        {formatarMoeda(produto.preco)}
                      </p>
                      <p className={styles.precoPromocional}>
                        {formatarMoeda(produto.preco_promocional)}
                      </p>
                    </>
                  ) : (
                    <p className={styles.preco}>
                      {formatarMoeda(produto.preco)}
                    </p>
                  )}
                </div>

                <button
                  className={styles.botaoCarrinho}
                  onClick={() => adicionarAoCarrinho(produto)}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
