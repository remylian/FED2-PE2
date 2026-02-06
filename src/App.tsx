import AppRoutes from "./app/routes/AppRoutes";
import Header from "./layouts/Header";

export default function App() {
  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <Header />
      <AppRoutes />
    </div>
  );
}
