import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { API_URL } from "../config/config";
import { io } from "socket.io-client";

const socket = io(API_URL);

import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { NotificationItem, User } from "../types";

// Notification center component showing real-time alerts
// Notification center component showing real-time alerts
function Notification() {
  const emptyUser: User = {};
  const [notification, setNotification] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user.user) ?? emptyUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (user._id) {
      socket.emit("join", user._id);
    }

    socket.on("receive_notification", (newNotify: NotificationItem) => {
      setNotification((prev: NotificationItem[]) => [newNotify, ...prev]);
    });

    return () => {
      socket.off("receive_notification");
    };
  }, [user._id]);
  // Load notifications for the current user

  // Load notifications for the current user
  const fetchNotification = async () => {
    if (!user._id) return;
    try {
      const response = await api.get(`/notification/user/${user._id}`);
      const notifications: NotificationItem[] =
        response.data.notification || [];
      setNotification(notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotification();
    // Mark a notification as read on the server and update local state
  }, [user._id]);

  // Mark a notification as read on the server and update local state
  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notification/${id}/read`);
      setNotification(
        notification.map((n: NotificationItem) =>
          n._id === id ? { ...n, isRead: true } : n,
        ),
      );
    } catch (err) {
      console.log(err);
      // Handle navigation and read status when a notification is clicked
    }
  };

  // Handle navigation and read status when a notification is clicked
  const handleNotificationClick = async (notify: NotificationItem) => {
    if (!notify.isRead) {
      await markAsRead(notify._id || "");
    }
    if (notify.type === "message") {
      navigate("/chat");
    }
  };

  return (
    <div className="w-full min-h-screen bg-theme-bg text-theme-text">
      <Header />
      <div className="flex mt-[40px]">
        <aside className="w-[20%] ml-[60px]">
          <SideBar />
        </aside>

        <main className="flex-1 p-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Bell className="text-theme-accent" size={32} />
              <h1 className="text-3xl font-bold">Notifications</h1>
            </div>

            <div className="flex flex-col gap-4">
              {notification.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`bg-theme-input border border-theme-border p-5 rounded-2xl flex items-center gap-4 hover:bg-theme-input transition cursor-pointer ${notif.isRead ? "opacity-60" : "opacity-100"}`}
                >
                  <div className="h-12 w-12 rounded-full bg-theme-bg flex items-center justify-center">
                    <Bell size={20} className="text-theme-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-theme-text">
                      <span className="font-bold text-theme-accent">
                        {notif.senderName}
                      </span>{" "}
                      {notif.content}
                    </p>
                    <p className="text-theme-text-muted text-sm mt-1">
                      {new Date(
                        notif.createdAt || Date.now(),
                      ).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(
                        notif.createdAt || Date.now(),
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="h-2 w-2 bg-theme-accent rounded-full"></div>
                  )}
                </div>
              ))}
            </div>

            {!loading && notification.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-theme-text-muted">
                <Bell size={64} className="mb-4 opacity-20" />
                <p>No new notifications yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Notification;
