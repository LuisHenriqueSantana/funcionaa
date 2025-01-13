import { useState } from "react";
import { useCarrinho } from "../contexts/CarrinhoContext";
import styles from "../styles/produtos.module.css";

export default function Checkout() {
  const {
    carrinho,
    total,
    removerDoCarrinho,
    atualizarQuantidade,
    limparCarrinho,
  } = useCarrinho();
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    observacoes: "",
  });

  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (carrinho.length === 0) {
      alert("Adicione produtos ao carrinho antes de finalizar o pedido");
      return;
    }

    const pedido = {
      ...formData,
      itens: carrinho.map((item) => ({
        id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco_promocional || item.preco,
      })),
      total: total,
      data: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedido),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar pedido");
      }

      alert("Pedido enviado com sucesso!");
      limparCarrinho();
      setFormData({
        nome: "",
        telefone: "",
        endereco: "",
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao enviar pedido. Tente novamente.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Checkout</h1>

      <div className={styles.checkoutGrid}>
        <div className={styles.carrinhoResumo}>
          <h2>Seu Carrinho</h2>

          {carrinho.length === 0 ? (
            <p>Seu carrinho está vazio</p>
          ) : (
            <>
              {carrinho.map((item) => (
                <div key={item.id} className={styles.itemCarrinho}>
                  <div className={styles.itemInfo}>
                    <h3>{item.nome}</h3>
                    <p className={styles.itemPreco}>
                      {formatarMoeda(item.preco_promocional || item.preco)} x{" "}
                      {item.quantidade}
                    </p>
                  </div>

                  <div className={styles.itemAcoes}>
                    <div className={styles.quantidadeControle}>
                      <button
                        className={styles.botaoQuantidade}
                        onClick={() =>
                          atualizarQuantidade(item.id, item.quantidade - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantidade}</span>
                      <button
                        className={styles.botaoQuantidade}
                        onClick={() =>
                          atualizarQuantidade(item.id, item.quantidade + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className={styles.botaoRemover}
                      onClick={() => removerDoCarrinho(item.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}

              <div className={styles.totalCarrinho}>
                <h3>Total</h3>
                <p>{formatarMoeda(total)}</p>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.formCheckout}>
          <h2>Dados para Entrega</h2>

          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endereco">Endereço</label>
            <textarea
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className={styles.botaoFinalizar}>
            Finalizar Pedido
          </button>
        </form>
      </div>
    </div>
  );
}
