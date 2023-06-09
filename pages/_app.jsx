import { Provider } from "react-redux";
import store from "../store";

import {
  WagmiConfig,
  createClient,
  configureChains,
  mainnet,
  sepolia,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/themes/light.css";
import "react-svg-map/lib/index.css";
import "leaflet/dist/leaflet.css";
import "./scss/app.scss";

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;
const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, sepolia],
  [publicProvider()]
); // convert to infura later

const client = createClient({
  autoConnect: true,
  provider,
  connectors: [
    new InjectedConnector({ chains }),
    // new WalletConnectConnector({
    //     chains,
    //     options: {
    //         projectId: '...',
    //     },
    // }),
  ],
});

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ToastContainer />
      <WagmiConfig client={client}>
        <Component {...pageProps} />
      </WagmiConfig>
    </Provider>
  );
}
