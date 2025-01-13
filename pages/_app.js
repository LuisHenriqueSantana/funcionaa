import { CarrinhoProvider } from "../contexts/CarrinhoContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <CarrinhoProvider>
      <Component {...pageProps} />
    </CarrinhoProvider>
  );
}

export default MyApp;
