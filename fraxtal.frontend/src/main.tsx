import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// import { ThirdwebProvider } from 'thirdweb/react'
// import {
//   ThirdwebProvider,
//   coinbaseWallet,
//   metamaskWallet,
//   walletConnect,
// } from "@thirdweb-dev/react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { ContractProvider } from "./providers/thirdwebHook.tsx";
import { ThirdwebProvider } from "thirdweb/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <ThirdwebProvider>
      <ContractProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
          className={"z-50"}
        />
      </ContractProvider>
    </ThirdwebProvider>
  </>
);
