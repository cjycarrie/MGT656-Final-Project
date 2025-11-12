import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx"; // ⬅️ this is the import I mentioned

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* add more routes here if you have other pages */}
      </Routes>
    </BrowserRouter>
  );
}

