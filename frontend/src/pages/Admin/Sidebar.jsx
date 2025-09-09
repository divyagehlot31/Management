import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Employee", path: "/admin-dashboard/employee" },
    { name: "Department", path: "/admin-dashboard/department" },
    { name: "Leaves", path: "/admin-dashboard/leaves" },
        { name: "Task", path: "/admin-dashboard/task" },

    { name: "Salary History", path: "/admin-dashboard/salary" },
    { name: "Pay Employee", path: "/admin-dashboard/pay" },
    { name: "Settings", path: "/admin-dashboard/settings" },
  ];

  return (
    <>
      {/* Toggle button (mobile only) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-teal-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full bg-gray-900 text-white flex flex-col transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0"}`}
      >
        <h2 className="text-2xl font-bold p-6 border-b border-gray-700">
          Admin Panel
        </h2>
        <ul className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={toggleSidebar} // close after navigation (mobile)
                className={`block px-4 py-2 rounded-lg transition ${
                  location.pathname === item.path
                    ? "bg-teal-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
