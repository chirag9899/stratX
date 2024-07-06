import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
// import { useConnectionStatus } from "@thirdweb-dev/react";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import Login from "./pages/Login.tsx";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home.tsx";

function App() {
  // const connectionStatus = useConnectionStatus();
  const connectionStatus = useActiveWalletConnectionStatus();
  return (
    <>
      <div className="bg-page min-h-full">
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                // connectionStatus == "connecting" ? <>loading...</> : <Login />
                // connectionStatus="connected" ? <Home /> :
                (connectionStatus == "connected" && <Home />) ||
                (connectionStatus == "connecting" && <>loading...</>) ||
                (connectionStatus == "disconnected" && <Login />)
              }
            />
            <Route
              path="/home"
              element={
                connectionStatus == "connected" ? <Home /> : <Navigate to="/" />
              }
            />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
