export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className=" bg-gradient-to-t from-orange-200/60 via-orange-100 to-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-4 text-center ">
        <p className="text-xs text-slate-600">© {year} Holidaze. All rights reserved.</p>
      </div>
    </footer>
  );
}
