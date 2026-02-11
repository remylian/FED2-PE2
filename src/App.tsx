import AppRoutes from "./app/routes/AppRoutes";
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col text-slate-900">
      <Header />
      <div className="flex-1">
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
}
