import { useState, useEffect } from "react";
import styles from "../styles/produtos.module.css";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaSubcategoria, setNovaSubcategoria] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    carregarCategorias();
    carregarSubcategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
      if (!response.ok) throw new Error("Erro ao carregar categorias");
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      alert("Erro ao carregar categorias: " + error.message);
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
      alert("Erro ao carregar subcategorias: " + error.message);
    }
  };

  const handleAddCategoria = async (e) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novaCategoria }),
      });

      if (!response.ok) throw new Error("Erro ao criar categoria");

      setNovaCategoria("");
      await carregarCategorias();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      alert("Erro ao criar categoria: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubcategoria = async (e) => {
    e.preventDefault();
    if (!novaSubcategoria.trim() || !categoriaSelecionada) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/subcategorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novaSubcategoria,
          categoria_id: categoriaSelecionada,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar subcategoria");

      setNovaSubcategoria("");
      await carregarSubcategorias();
    } catch (error) {
      console.error("Erro ao criar subcategoria:", error);
      alert("Erro ao criar subcategoria: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (
      !confirm(
        "Tem certeza? Isso também excluirá todas as subcategorias relacionadas."
      )
    )
      return;

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir categoria");

      await carregarCategorias();
      await carregarSubcategorias();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Erro ao excluir categoria: " + error.message);
    }
  };

  const handleDeleteSubcategoria = async (id) => {
    if (!confirm("Tem certeza?")) return;

    try {
      const response = await fetch(`/api/subcategorias/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir subcategoria");

      await carregarSubcategorias();
    } catch (error) {
      console.error("Erro ao excluir subcategoria:", error);
      alert("Erro ao excluir subcategoria: " + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Gerenciar Categorias</h1>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h2>Categorias</h2>
          <form onSubmit={handleAddCategoria} className={styles.form}>
            <div className={styles.campo}>
              <input
                type="text"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Nova categoria"
                required
              />
              <button
                type="submit"
                className={styles.botao}
                disabled={isLoading}
              >
                Adicionar
              </button>
            </div>
          </form>

          <div className={styles.lista}>
            {categorias.map((categoria) => (
              <div key={categoria.id} className={styles.item}>
                <span>{categoria.nome}</span>
                <button
                  onClick={() => handleDeleteCategoria(categoria.id)}
                  className={`${styles.botao} ${styles.botaoExcluir}`}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Subcategorias</h2>
          <form onSubmit={handleAddSubcategoria} className={styles.form}>
            <div className={styles.campo}>
              <select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={novaSubcategoria}
                onChange={(e) => setNovaSubcategoria(e.target.value)}
                placeholder="Nova subcategoria"
                required
              />
              <button
                type="submit"
                className={styles.botao}
                disabled={isLoading}
              >
                Adicionar
              </button>
            </div>
          </form>

          <div className={styles.lista}>
            {subcategorias.map((subcategoria) => (
              <div key={subcategoria.id} className={styles.item}>
                <span>
                  {subcategoria.nome}
                  <small>
                    (
                    {
                      categorias.find((c) => c.id === subcategoria.categoria_id)
                        ?.nome
                    }
                    )
                  </small>
                </span>
                <button
                  onClick={() => handleDeleteSubcategoria(subcategoria.id)}
                  className={`${styles.botao} ${styles.botaoExcluir}`}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
