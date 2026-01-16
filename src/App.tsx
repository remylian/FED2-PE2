import { Routes, Route } from "react-router-dom";

function HomePage() {
  return <h1 className="text-2xl font-bold">Home</h1>;
}

function VenuesPage() {
  return <h1 className="text-2xl font-bold">Venues</h1>;
}

function VenuePage() {
  return <h1 className="text-2xl font-bold">Venue Details</h1>;
}

function LoginPage() {
  return <h1 className="text-2xl font-bold">Login</h1>;
}

function NotFoundPage() {
  return <h1 className="text-2xl font-bold">404 – Not Found</h1>;
}

// route placeholders for different pages.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/venue" element={<VenuePage />} />
    </Routes>
  );
}
