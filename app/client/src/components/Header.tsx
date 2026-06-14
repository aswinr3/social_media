import React, { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import { API_URL } from "../config/config";

import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { ContactItem, NotificationItem, User } from "../types";

// Header with search, notifications, and profile access
const Header = () => {
  const emptyUser: User = {};
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ContactItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user) ?? emptyUser;

  useEffect(() => {
    const socket = io(API_URL);
    if (user._id) {
      socket.emit("join", user._id);

      // Initial fetch
      const fetchUnread = async () => {
        try {
          const response = await api.get(`/notification/user/${user._id}`);
          const notifications: NotificationItem[] =
            response.data.notification || [];
          const unread = notifications.filter(
            (n: NotificationItem) => !n.isRead,
          ).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error(err);
        }
      };
      fetchUnread();
    }

    socket.on("receive_notification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user._id]);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchTerm.trim().length > 1) {
        try {
          const response = await api.get(
            `/register?search=${searchTerm}&exclude=${user.email}`,
          );
          const users: ContactItem[] = response.data.users || [];
          setResults(users);
          setShowResults(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <header className="flex fixed top-2 left-4 right-4 z-50 justify-between h-[90px] items-center glass-panel shadow-lg px-8 border-none rounded-3xl">
      <div className="flex gap-16 items-center">
        <h1
          onClick={() => navigate("/dashboard")}
          className="text-4xl font-extrabold bg-gradient-to-r from-theme-accent via-theme-accent-hover to-theme-accent bg-clip-text text-transparent cursor-pointer tracking-tighter hover:scale-105 transition-transform duration-300"
        >
          ConnectHub
        </h1>
        <div className="relative hidden lg:block group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 1 && setShowResults(true)}
            placeholder="Search connections..."
            className="w-[350px] bg-theme-input/40 backdrop-blur-sm border border-theme-border p-3 rounded-2xl pl-12 placeholder:text-theme-text-muted text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:w-[400px] transition-all duration-500 ease-out"
          />
          <Search
            className="absolute top-3.5 left-4 text-theme-text-muted group-focus-within:text-theme-accent transition-colors duration-300"
            size={20}
          />

          {/* Search Results Dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 w-full glass-panel mt-4 rounded-3xl shadow-2xl overflow-hidden z-[100] max-h-[450px] overflow-y-auto animate-fade-in border-theme-accent/20">
              {results.map((res) => (
                <div
                  key={res._id}
                  onClick={() => {
                    navigate(`/profile/${res._id}`);
                    setShowResults(false);
                    setSearchTerm("");
                  }}
                  className="flex items-center gap-4 p-4 hover:bg-theme-accent/20 cursor-pointer border-b border-theme-divider transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-theme-accent to-indigo-600 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden shadow-md">
                    {res.avatar ? (
                      <img
                        src={res.avatar}
                        alt={res.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">
                        {res.firstName?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-base font-bold text-theme-text truncate">
                      {res.firstName} {res.lastName}
                    </p>
                    <p className="text-xs text-theme-text-muted truncate">
                      {res.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8 items-center">
        <Link
          to="/notification"
          className="flex relative cursor-pointer group p-3 rounded-2xl bg-theme-input/40 hover:bg-theme-accent/20 hover:scale-110 transition-all duration-300"
        >
          <Bell
            size={24}
            className="text-theme-text-muted group-hover:text-theme-accent transition-colors"
          />
          {unreadCount > 0 && (
            <div className="h-[20px] min-w-[20px] px-1.5 bg-rose-500 rounded-full absolute -top-1 -right-1 border-2 border-theme-bg flex items-center justify-center text-[10px] text-white font-extrabold shadow-lg animate-bounce">
              {unreadCount}
            </div>
          )}
        </Link>

        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-4 cursor-pointer group hover-lift bg-theme-input/40 p-1.5 pr-4 rounded-2xl"
        >
          <div className="w-12 h-12 flex justify-center items-center overflow-hidden relative rounded-xl bg-gradient-to-br from-theme-accent to-indigo-600 font-bold text-white shadow-lg group-hover:ring-2 group-hover:ring-theme-accent transition-all duration-300">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl">
                {user.firstName ? user.firstName.charAt(0) : "U"}
              </span>
            )}
            <div className="bg-emerald-500 h-3.5 w-3.5 rounded-full absolute bottom-0 right-0 border-2 border-[#1e1b4b] shadow-sm"></div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold leading-tight group-hover:text-theme-accent transition-colors">
              {user.firstName || "User"} {user.lastName || ""}
            </p>
            <p className="text-[10px] text-theme-text-muted uppercase font-bold tracking-widest opacity-70">
              Personal Space
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
