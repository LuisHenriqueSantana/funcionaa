import { useState, useEffect } from "react";
import { processImageClient } from "../utils/clientImageProcessor";
import { ImagePreview } from "../components/ImagePreview";
import styles from "../styles/produtos.module.css";

export default function Produtos() {
  // Estados do formulário
  const [nome, setNome] = useState("");
  const [peso, setPeso] = useState("");
  const [preco, setPreco] = useState("");
  const [precoPromocional, setPrecoPromocional] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);
  const [formCategoriaSelecionada, setFormCategoriaSelecionada] = useState("");
  const [formSubcategoriaSelecionada, setFormSubcategoriaSelecionada] =
    useState("");
  const [formSubcategoriasFiltradas, setFormSubcategoriasFiltradas] = useState(
    []
  );

  // Estados da listagem e filtros
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [editando, setEditando] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedImage, setProcessedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todos");
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState("");
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([]);

  // Effect para carregar dados iniciais
  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
    carregarSubcategorias();
  }, []);

  // Effect para filtrar produtos
  useEffect(() => {
    filtrarProdutos();
  }, [produtos, termoPesquisa, categoriaSelecionada, subcategoriaSelecionada]);

  // Effect para filtrar subcategorias do formulário
  useEffect(() => {
    if (formCategoriaSelecionada) {
      setFormSubcategoriasFiltradas(
        subcategorias.filter(
          (sub) => sub.categoria_id === Number(formCategoriaSelecionada)
        )
      );
    } else {
      setFormSubcategoriasFiltradas([]);
    }
  }, [formCategoriaSelecionada, subcategorias]);

  // Effect para filtrar subcategorias da listagem
  useEffect(() => {
    if (categoriaSelecionada && categoriaSelecionada !== "todos") {
      setSubcategoriasFiltradas(
        subcategorias.filter(
          (sub) => sub.categoria_id === Number(categoriaSelecionada)
        )
      );
      setSubcategoriaSelecionada("");
    } else {
      setSubcategoriasFiltradas([]);
    }
  }, [categoriaSelecionada, subcategorias]);

  const filtrarProdutos = () => {
    let produtosFiltrados = [...produtos];

    // Filtrar por termo de pesquisa
    if (termoPesquisa.trim()) {
      const termo = termoPesquisa.toLowerCase().trim();
      produtosFiltrados = produtosFiltrados.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(termo) ||
          produto.descricao.toLowerCase().includes(termo) ||
          produto.subcategoria?.nome.toLowerCase().includes(termo) ||
          produto.subcategoria?.categoria?.nome.toLowerCase().includes(termo)
      );
    }

    // Filtrar por categoria
    if (categoriaSelecionada !== "todos") {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) =>
          produto.subcategoria?.categoria?.id === Number(categoriaSelecionada)
      );
    }

    // Filtrar por subcategoria
    if (subcategoriaSelecionada) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) =>
          produto.subcategoria?.id === Number(subcategoriaSelecionada)
      );
    }

    setProdutosFiltrados(produtosFiltrados);
  };

  const handlePesquisa = (e) => {
    setTermoPesquisa(e.target.value);
  };

  const handleSubmitPesquisa = (e) => {
    e.preventDefault();
    e.target.querySelector("input").blur();
  };

  const carregarProdutos = async () => {
    try {
      const response = await fetch("/api/produtos");
      if (!response.ok) throw new Error("Erro ao carregar produtos");
      const data = await response.json();
      setProdutos(data);
      setProdutosFiltrados(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert("Erro ao carregar produtos: " + error.message);
    }
  };

  const carregarCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
      if (!response.ok) throw new Error("Erro ao carregar categorias");
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const carregarSubcategorias = async () => {
    try {
      const response = await fetch("/api/subcategorias");
      if (!response.ok) throw new Error("Erro ao carregar subcategorias");
      const data = await response.json();
      setSubcategorias(data);
    } catch (error) {
      console.error("Erro ao carregar subcategorias:", error);
    }
  };

  // Função para converter string formatada em número
  const converterPrecoParaNumero = (valor) => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, "");
    // Converte para número e divide por 100
    return Number(apenasNumeros) / 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!imagem) {
        alert("Por favor, selecione uma imagem");
        return;
      }

      setUploadProgress(1);

      // Converter imagem para base64
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imagem);
      });

      setUploadProgress(50);

      // Upload da imagem
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          fileName: imagem.name,
        }),
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(
          `Erro no upload: ${errorData.error || "Erro desconhecido"}`
        );
      }

      setUploadProgress(75);

      const { imagePath } = await uploadRes.json();

      const produtoData = {
        nome,
        peso,
        descricao,
        preco: converterPrecoParaNumero(preco),
        precoPromocional: precoPromocional
          ? converterPrecoParaNumero(precoPromocional)
          : null,
        imagem_url: imagePath,
        subcategoria_id: formSubcategoriaSelecionada
          ? Number(formSubcategoriaSelecionada)
          : null,
      };

      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produtoData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao criar produto");
      }

      setUploadProgress(100);
      alert("Produto criado com sucesso!");

      // Limpar formulário
      setNome("");
      setPeso("");
      setDescricao("");
      setPreco("0,00");
      setPrecoPromocional("0,00");
      setImagem(null);
      setProcessedImage(null);

      // Resetar input de arquivo
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      // Recarregar lista de produtos
      await carregarProdutos();
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(
          "Arquivo muito grande. Por favor, selecione uma imagem menor que 5MB"
        );
        e.target.value = "";
        return;
      }
      setImagem(file);
      setProcessedImage(null);
      console.log(
        "Tamanho do arquivo selecionado:",
        (file.size / 1024 / 1024).toFixed(2) + "MB"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir produto");
      }

      setProdutos((prev) => prev.filter((produto) => produto.id !== id));
      alert("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (produto) => {
    setEditando(produto);
    setNome(produto.nome);
    setPeso(produto.peso || "");
    setDescricao(produto.descricao || "");
    setPreco(formatarInputPreco(String(produto.preco * 100)));
    setPrecoPromocional(
      produto.preco_promocional
        ? formatarInputPreco(String(produto.preco_promocional * 100))
        : "0,00"
    );

    // Define a categoria e subcategoria do produto no formulário
    const categoriaId = produto.subcategoria?.categoria?.id;
    if (categoriaId) {
      setFormCategoriaSelecionada(categoriaId.toString());
      if (produto.subcategoria_id) {
        setFormSubcategoriaSelecionada(produto.subcategoria_id.toString());
      }
    }

    setImagem(null);
    setProcessedImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imagePath = editando.imagem_url;

      if (imagem) {
        setUploadProgress(1);

        // Converter imagem para base64
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imagem);
        });

        setUploadProgress(50);

        // Upload da imagem
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            fileName: imagem.name,
          }),
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(
            `Erro no upload: ${errorData.error || "Erro desconhecido"}`
          );
        }

        const { imagePath: newImagePath } = await uploadRes.json();
        imagePath = newImagePath;
        setUploadProgress(75);
      }

      const produtoData = {
        nome,
        peso,
        descricao,
        preco: converterPrecoParaNumero(preco),
        precoPromocional: precoPromocional
          ? converterPrecoParaNumero(precoPromocional)
          : null,
        imagem_url: imagePath,
        subcategoria_id: formSubcategoriaSelecionada
          ? Number(formSubcategoriaSelecionada)
          : null,
      };

      // Corrigindo a chamada da API para atualização
      const res = await fetch("/api/produtos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editando.id,
          ...produtoData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao atualizar produto");
      }

      setUploadProgress(100);
      alert("Produto atualizado com sucesso!");

      // Limpar formulário
      setNome("");
      setPeso("");
      setDescricao("");
      setPreco("0,00");
      setPrecoPromocional("0,00");
      setImagem(null);
      setProcessedImage(null);
      setEditando(null);
      setFormCategoriaSelecionada("");
      setFormSubcategoriaSelecionada("");
      setFormSubcategoriasFiltradas([]);

      // Resetar input de arquivo
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      // Recarregar lista de produtos
      await carregarProdutos();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const getSubcategoriasPorCategoria = (categoriaId) => {
    return subcategorias.filter(
      (sub) => sub.categoria_id === Number(categoriaId)
    );
  };

  // Função para formatar moeda
  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Função para formatar input de preço
  const formatarInputPreco = (valor) => {
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, "");

    // Converte para número e divide por 100 para considerar os centavos
    const numero = Number(valor) / 100;

    // Formata com duas casas decimais
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePrecoChange = (e, setPreco) => {
    const valorFormatado = formatarInputPreco(e.target.value);
    setPreco(valorFormatado);
  };

  useEffect(() => {
    // Inicializa os campos de preço com 0,00
    if (!editando) {
      setPreco("0,00");
      setPrecoPromocional("0,00");
    }
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Gerenciar Produtos</h1>

      <form onSubmit={handleSubmitPesquisa} className={styles.formPesquisa}>
        <input
          type="text"
          placeholder="Pesquisar produtos por nome, descrição ou categoria..."
          className={styles.searchInput}
          value={termoPesquisa}
          onChange={handlePesquisa}
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

      <form
        onSubmit={editando ? handleUpdate : handleSubmit}
        className={styles.formulario}
      >
        <div className={styles.campo}>
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="peso">Peso:</label>
          <input
            type="text"
            id="peso"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="Ex: 500g, 1kg"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="preco">Preço:</label>
          <input
            type="text"
            id="preco"
            value={preco}
            onChange={(e) => handlePrecoChange(e, setPreco)}
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="precoPromocional">Preço Promocional:</label>
          <input
            type="text"
            id="precoPromocional"
            value={precoPromocional}
            onChange={(e) => handlePrecoChange(e, setPrecoPromocional)}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="categoria">Categoria:</label>
          <select
            id="categoria"
            value={formCategoriaSelecionada}
            onChange={(e) => setFormCategoriaSelecionada(e.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="subcategoria">Subcategoria:</label>
          <select
            id="subcategoria"
            value={formSubcategoriaSelecionada}
            onChange={(e) => setFormSubcategoriaSelecionada(e.target.value)}
            required
            disabled={!formCategoriaSelecionada}
          >
            <option value="">Selecione uma subcategoria</option>
            {formSubcategoriasFiltradas.map((subcategoria) => (
              <option key={subcategoria.id} value={subcategoria.id}>
                {subcategoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="imagem">Imagem:</label>
          <input
            type="file"
            id="imagem"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
          />
        </div>

        {uploadProgress > 0 && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${uploadProgress}%` }}
            />
            <span>{uploadProgress}%</span>
          </div>
        )}

        {imagem && (
          <ImagePreview file={imagem} processedFile={processedImage} />
        )}

        <div className={styles.botoes}>
          <button
            type="submit"
            className={`${styles.botao} ${styles.botaoPrimario}`}
            disabled={isLoading}
          >
            {isLoading
              ? "Salvando..."
              : editando
              ? "Atualizar Produto"
              : "Criar Produto"}
          </button>

          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(null);
                setNome("");
                setPeso("");
                setDescricao("");
                setPreco("");
                setPrecoPromocional("");
                setImagem(null);
                setProcessedImage(null);
                setFormCategoriaSelecionada("");
                setFormSubcategoriaSelecionada("");
                setFormSubcategoriasFiltradas([]);
              }}
              className={`${styles.botao} ${styles.botaoSecundario}`}
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className={styles.gridProdutos}>
        {produtosFiltrados.length === 0 ? (
          <p className={styles.mensagemVazia}>Nenhum produto encontrado</p>
        ) : (
          produtosFiltrados.map((produto) => (
            <div key={produto.id} className={styles.cardProduto}>
              <button
                onClick={() => toggleDescricao(produto)}
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
                <h3 className={styles.nomeProduto}>{produto.nome}</h3>
                <p className={styles.infoProduto}>Peso: {produto.peso}</p>

                <div className={styles.precoContainer}>
                  <p className={styles.preco}>
                    R$ {formatarMoeda(produto.preco)}
                  </p>
                  {produto.preco_promocional && (
                    <p className={styles.precoPromocional}>
                      R$ {formatarMoeda(produto.preco_promocional)}
                    </p>
                  )}
                </div>

                <p className={styles.descricaoProduto}>{produto.descricao}</p>

                <div className={styles.categoriasInfo}>
                  <p className={styles.infoProduto}>
                    <strong>Categoria:</strong>{" "}
                    {produto.subcategoria?.categoria?.nome || "Sem categoria"}
                  </p>
                  <p className={styles.infoProduto}>
                    <strong>Subcategoria:</strong>{" "}
                    {produto.subcategoria?.nome || "Sem subcategoria"}
                  </p>
                </div>

                <div className={styles.acoesProduto}>
                  <button
                    onClick={() => handleEdit(produto)}
                    className={`${styles.botao} ${styles.botaoEditar}`}
                    disabled={isLoading || deletingId === produto.id}
                  >
                    {isLoading && editando?.id === produto.id ? (
                      <span className={styles.loadingText}>Editando...</span>
                    ) : (
                      "Editar"
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(produto.id)}
                    className={`${styles.botao} ${styles.botaoExcluir}`}
                    disabled={isLoading || deletingId === produto.id}
                  >
                    {deletingId === produto.id ? (
                      <span className={styles.loadingText}>Excluindo...</span>
                    ) : (
                      "Excluir"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
