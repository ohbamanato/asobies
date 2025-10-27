import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mancala from "./pages/Mancala.tsx";
import Home from "./pages/Home.tsx";
import Page404 from "./pages/Page404.tsx";
import WaitingRoom from "./pages/WaitingRoom.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mancala/:roomID" element={<Mancala />} />
          <Route path="/waiting/:roomID" element={<WaitingRoom />}></Route>
          <Route path="/*" element={<Page404 />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
