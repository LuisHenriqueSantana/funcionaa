import { useState, useCallback } from "react";
import { debounce } from "lodash";

export function useDeleteProduto(setProdutos) {
  const [deletingId, setDeletingId] = useState(null);

  const deleteProduct = async (id) => {
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
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  const debouncedDelete = useCallback(
    debounce((id) => {
      if (window.confirm("Tem certeza que deseja excluir este produto?")) {
        deleteProduct(id).catch((error) => {
          alert(error.message);
        });
      }
    }, 300),
    []
  );

  return {
    deletingId,
    handleDelete: debouncedDelete,
  };
}
