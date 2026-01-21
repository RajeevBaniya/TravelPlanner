import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { FaUser } from "react-icons/fa";

function AuthSection({
  user,
  isUserMenuOpen,
  onToggleUserMenu,
  onLogout,
  onOpenSignIn,
}) {
  if (!user) {
    return (
      <Button
        className="bg-black text-white hover:bg-gray-800 rounded"
        size="sm"
        onClick={onOpenSignIn}
      >
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link to="/create-trip">
        <Button variant="outline" className="rounded-full">
          + Create Trip
        </Button>
      </Link>
      <Link to="/my-trips">
        <Button variant="outline" className="rounded-full">
          My Trips
        </Button>
      </Link>

      <div className="relative">
        <button
          onClick={onToggleUserMenu}
          className="flex items-center justify-center h-[35px] w-[35px] rounded-full bg-orange-500 text-white"
          aria-label="User menu"
        >
          <FaUser />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              {user?.name || user?.email || "User"}
            </div>
            <button
              onClick={onLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthSection;
