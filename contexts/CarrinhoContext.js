import { createContext, useContext, useState, useEffect } from "react";

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem("carrinho");
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    calcularTotal();
  }, [carrinho]);

  const calcularTotal = () => {
    const novoTotal = carrinho.reduce((acc, item) => {
      const preco = item.preco_promocional || item.preco;
      return acc + preco * item.quantidade;
    }, 0);
    setTotal(novoTotal);
  };

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((carrinhoAtual) => {
      const itemExistente = carrinhoAtual.find(
        (item) => item.id === produto.id
      );

      if (itemExistente) {
        return carrinhoAtual.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...carrinhoAtual, { ...produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho((carrinhoAtual) =>
      carrinhoAtual.filter((item) => item.id !== produtoId)
    );
  };

  const atualizarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade < 1) return;

    setCarrinho((carrinhoAtual) =>
      carrinhoAtual.map((item) =>
        item.id === produtoId ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  const limparCarrinho = () => {
    setCarrinho([]);
  };

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        total,
        adicionarAoCarrinho,
        removerDoCarrinho,
        atualizarQuantidade,
        limparCarrinho,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error("useCarrinho deve ser usado dentro de um CarrinhoProvider");
  }
  return context;
}
