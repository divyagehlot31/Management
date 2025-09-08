import React from "react";
import { useAuth } from "../context/authContext";

const Header = () => {
  const { user, logout } = useAuth(); // ✅ logout bhi destructure karo

  return (
    <header className="bg-white shadow flex justify-between items-center px-6 py-3">
      <h1 className="text-lg font-semibold text-gray-700">
        Welcome, <span className="text-teal-600">{user?.name || "Admin"}</span>
      </h1>
      <button
        onClick={logout} // ✅ yaha call karo
        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
