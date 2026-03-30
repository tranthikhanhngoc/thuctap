import { useNavigate, useLocation } from "react-router-dom";

const BacSiLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const menu = [
    { name: "Dashboard", path: "/bacsi", icon: "🏠" },
    { name: "Lịch khám", path: "/bacsi/lich-kham", icon: "📅" },
    { name: "Lịch học", path: "/bacsi/lich-hoc", icon: "📖" },
    { name: "Bệnh nhân", path: "/bacsi/benh-nhan", icon: "👨‍⚕️" }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-pink-50 via-white to-pink-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-pink-100 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-pink-100">
          <h1 className="text-2xl font-bold text-pink-500">
            BeHealthy Doctor
          </h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">

          {menu.map((item) => {

            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition
                ${
                  active
                    ? "bg-pink-500 text-white shadow"
                    : "hover:bg-pink-50 text-gray-700"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            );
          })}

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-pink-100">
          <button
            onClick={handleLogout}
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition"
          >
            Đăng xuất
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-10 py-4 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700">
            Hệ thống quản lý bác sĩ
          </h2>
        </header>

        {/* Page Content */}
        <main className="p-10">
          {children}
        </main>

      </div>

    </div>
  );
};

export default BacSiLayout;