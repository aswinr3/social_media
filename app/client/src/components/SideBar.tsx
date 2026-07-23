import React from "react";
import { nav } from "../data/dashboard";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { useConfirm } from "./ConfirmDialog";

// Sidebar navigation panel with logout action
const SideBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const confirm = useConfirm();

  // Log out user by clearing stored auth data and redirecting to login
  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: "Log out of ConnectHub?",
      message: "You'll need to sign in again to access your account.",
      confirmLabel: "Log out",
      variant: "danger",
    });

    if (isConfirmed) {
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/login");
    }
  };
  return (
    <div className="flex flex-col gap-6 glass-panel w-full p-6 rounded-[32px] shadow-2xl h-[calc(100vh-140px)] animate-fade-in relative z-10">
      <div className="flex flex-col gap-2 flex-1">
        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-theme-text-muted mb-2">Main Menu</p>
        {nav.map((x, i) => (
          <Link to={x.path} key={i}>
            <div className="flex gap-4 h-[60px] items-center px-5 rounded-[20px] cursor-pointer group hover:bg-theme-accent bg-theme-card nm-pressable">
              <span className="text-theme-accent group-hover:text-white transition-colors duration-100">
                {<x.name size={22} />}
              </span>
              <h3 className="font-bold text-sm text-theme-text group-hover:text-white transition-colors duration-100">
                {x.label}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t border-theme-divider">
        <div
          onClick={handleLogout}
          className="flex gap-4 h-[60px] items-center px-5 rounded-[20px] bg-theme-card nm-pressable cursor-pointer group hover:bg-rose-500"
        >
          <span className="text-rose-500 group-hover:text-white transition-colors duration-100">
            <LogOut size={22} />
          </span>
          <h3 className="font-bold text-sm text-rose-500 group-hover:text-white transition-colors duration-100">
            Logout
          </h3>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
