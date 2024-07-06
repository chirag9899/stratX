import { useState, FC } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import SideBar from "../components/SideBar";
import Popular from "./Popular";
import Dashboard from "./Dashboard";
import Create from "./Create";
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";
import image from "../../public/Wireframe - 1.png"
// import customFraxtal from "../customFraxtal";
// import { LegacyChain } from "thirdweb/dist/types/chains/types";

const chain = defineChain({
  id: 9018,
  name: "Virtual Fraxtal",
  rpc: "https://virtual.fraxtal.rpc.tenderly.co/7c8a4a67-11d3-4223-82cf-2a6c2cf0e1c7",

  // testnet: true,
  nativeCurrency: {
    name: "VFRAX",
    symbol: "vFRAX",
    decimals: 18,
  },
});

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
];

const Home: FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>("popular");

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "create":
        return <Create />;
      case "popular":
      default:
        return <Popular />;
    }
  };

  return (
    <>
      <div className="flex flex-col relative h-screen overflow-y-auto bg-[url('../../public/back2.png')] text-white font-raleway">
        <div className="absolute w-[10%] right-0 top-0 mr-14 mt-5">
          <ConnectButton
            client={client}
            chains={[chain]}
            wallets={wallets}
            theme={darkTheme({})}
          />
        </div>
        <div className="flex h-full">
          <SideBar
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
          {renderComponent()}
        </div>
      </div>
    </>
  );
};

export default Home;
