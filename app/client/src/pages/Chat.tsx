import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import {
  Phone,
  Search,
  Send,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Image,
  Mic,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "../services/api";
import { showToast } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import { API_URL } from "../config/config";
import { io } from "socket.io-client";
import chatBgImage from "../assets/chat_bg_image.png";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { ContactItem, User } from "../types";

const socket = io(API_URL);

interface ChatMessage {
  _id?: string;
  senderId?: string;
  recipientId?: string;
  senderName?: string;
  text?: string;
  createdAt?: string;
  edited?: boolean;
  editedAt?: string;
}
interface ChatLocationState {
  selectedUser?: ContactItem;
}

const Chat = () => {
  const emptyUser: User = {};
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(
    null,
  );
  const location = useLocation() as { state?: ChatLocationState };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.user.user) ?? emptyUser;
  const confirm = useConfirm();

  const filteredContacts = contacts.filter(
    (c) =>
      c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── socket
  useEffect(() => {
    if (user._id) socket.emit("join", user._id);
    socket.on("receive_message", (msg: ChatMessage) => {
      setMessages((prev) => {
        if (selectedContact?._id === msg.senderId || user._id === msg.senderId)
          return [...prev, msg];
        return prev;
      });
    });

    // Live sync when the other participant edits or deletes a message.
    socket.on("message_edited", (msg: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m._id && m._id === msg._id ? { ...m, ...msg } : m)),
      );
    });

    socket.on("message_deleted", ({ _id }: { _id: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== _id));
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_edited");
      socket.off("message_deleted");
    };
  }, [user._id, selectedContact]);

  // ── fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get(`/register?exclude=${user.email}`);
        const fetched = res.data.users;
        setContacts(fetched);
        if (location.state?.selectedUser) {
          const target = fetched.find(
            (c: ContactItem) => c._id === location.state?.selectedUser?._id,
          );
          selectContact(target ?? location.state.selectedUser);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchContacts();
  }, [user.email, location.state]);

  const selectContact = async (contact: ContactItem) => {
    setSelectedContact(contact);
    try {
      const res = await api.get(
        `/chat/history?user1=${user._id}&user2=${contact._id}`,
      );
      setMessages(res.data.messages || []);
      await api.post(`/notification/clear-message`, {
        recipientId: user._id,
        senderId: contact._id,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedContact) return;
    try {
      const payload = {
        senderId: user._id,
        recipientId: selectedContact._id,
        senderName: `${user.firstName} ${user.lastName}`,
        text,
      };
      const res = await api.post(`/chat/send`, payload);
      // Use the server's copy so the message carries its _id (needed to edit/delete it).
      const saved: ChatMessage = res.data?.data ?? {
        ...payload,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, saved]);
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (msg: ChatMessage) => {
    if (!msg._id) return;
    setEditingId(msg._id);
    setEditText(msg.text || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEditSave = async (msg: ChatMessage) => {
    const next = editText.trim();
    if (!msg._id || !next) return;
    if (next === msg.text) return cancelEditing();

    const previous = messages;
    // Optimistic update, rolled back if the request fails.
    setMessages((prev) =>
      prev.map((m) =>
        m._id === msg._id ? { ...m, text: next, edited: true } : m,
      ),
    );
    cancelEditing();

    try {
      await api.put(`/chat/${msg._id}`, { text: next });
    } catch (err) {
      console.error("Failed to edit message:", err);
      setMessages(previous);
      showToast.error("Couldn't edit the message. Please try again.");
    }
  };

  const handleDelete = async (msg: ChatMessage) => {
    if (!msg._id) return;

    const ok = await confirm({
      title: "Delete this message?",
      message: "This can't be undone. It will be removed for both of you.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    const previous = messages;
    setMessages((prev) => prev.filter((m) => m._id !== msg._id));

    try {
      await api.delete(`/chat/${msg._id}`);
    } catch (err) {
      console.error("Failed to delete message:", err);
      setMessages(previous);
      showToast.error("Couldn't delete the message. Please try again.");
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 110) + "px";
  };

  return (
    <div className="w-full h-screen app-shell overflow-hidden flex flex-col">
      <Header />
      <div className="flex flex-1 w-full mt-[40px] pb-6 gap-8 overflow-hidden">
        <aside className="w-[15%] ml-[60px] hidden xl:block shrink-0">
          <SideBar />
        </aside>

        <main className="flex-1 flex glass-panel rounded-[40px] overflow-hidden shadow-premium border-none animate-fade-in relative z-10 bg-theme-bg/20">
          {/* ── CONTACTS PANEL */}
          <aside className="w-[340px] border-r border-theme-divider flex flex-col bg-theme-input/20 relative z-20 shrink-0">
            <div className="p-7 pb-4">
              <h1 className="text-xl font-black tracking-tight mb-5 text-gradient">
                Contacts
              </h1>
              <div className="relative group">
                <Search
                  className="absolute top-3.5 left-4 text-theme-accent"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Target ID search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-theme-input/40 border border-theme-border h-[46px] pl-11 pr-4
                             rounded-2xl text-theme-text placeholder:text-theme-text-muted/50
                             focus:outline-none focus:ring-2 focus:ring-theme-accent/40
                             transition-all duration-300 font-semibold text-sm"
                />
              </div>
            </div>

            <section className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 flex flex-col gap-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => selectContact(contact)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer
                                transition-all duration-300 group
                                ${
                                  selectedContact?._id === contact._id
                                    ? "bg-gradient-to-r from-theme-accent/20 to-indigo-600/15 border border-theme-accent/30 translate-x-1"
                                    : "hover:bg-theme-input/40 border border-transparent hover:border-theme-border"
                                }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className="h-12 w-12 rounded-[13px] bg-gradient-to-br from-theme-accent to-indigo-600
                                      flex items-center justify-center text-white font-black overflow-hidden
                                      shadow-lg group-hover:rotate-6 transition-transform duration-300"
                      >
                        {contact.avatar ? (
                          <img
                            src={contact.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base">
                            {contact.firstName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                                      bg-emerald-500 border-2 border-[#0F172A] animate-pulse"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-black text-xs truncate uppercase tracking-wide
                                    ${selectedContact?._id === contact._id ? "text-white" : "text-theme-text"}`}
                      >
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest truncate mt-0.5
                                    ${selectedContact?._id === contact._id ? "text-white/55" : "text-theme-text-muted"}`}
                      >
                        {contact.email?.split("@")[0]}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-30 italic font-bold text-xs">
                  No signals found…
                </div>
              )}
            </section>
          </aside>

          {/* ── CHAT WINDOW */}
          <section className="flex-1 flex flex-col relative overflow-hidden bg-theme-input/5">
            {/* Ambiance layers */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(6,182,212,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.6) 1px,transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url(${chatBgImage})`,
                backgroundSize: "cover",
              }}
            />
            <div
              className={`absolute top-0 right-0 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none
                            transition-all duration-1000
                            ${selectedContact ? "bg-theme-accent/10 opacity-100" : "opacity-0"}`}
            />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full blur-[90px] pointer-events-none bg-indigo-600/8 opacity-60" />

            <div className="relative flex-1 flex flex-col z-10 overflow-hidden">
              {selectedContact ? (
                <>
                  {/* CHAT HEADER */}
                  <header
                    className="flex-shrink-0 flex items-center justify-between px-6 py-4
                                     border-b border-theme-divider backdrop-blur-md bg-theme-bg/40"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar with animated ring */}
                      <div className="relative">
                        <div
                          className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-theme-accent to-indigo-600
                                        flex items-center justify-center text-white font-black overflow-hidden shadow-lg"
                        >
                          {selectedContact.avatar ? (
                            <img
                              src={selectedContact.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{selectedContact.firstName?.charAt(0)}</span>
                          )}
                        </div>
                        {/* pulsing border ring */}
                        <div
                          className="absolute inset-[-3px] rounded-[17px] border-2 border-theme-accent/40
                                        animate-[ring-pulse_2.5s_ease-in-out_infinite]"
                        />
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wide text-theme-text">
                          {selectedContact.firstName} {selectedContact.lastName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-500">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {[
                        { icon: <Phone size={15} />, label: "Call" },
                        { icon: <Video size={15} />, label: "Video" },
                        { icon: <MoreVertical size={15} />, label: "More" },
                      ].map(({ icon, label }) => (
                        <button
                          key={label}
                          title={label}
                          className="w-9 h-9 rounded-xl border border-theme-border bg-theme-input/20
                                     flex items-center justify-center text-theme-text-muted
                                     hover:bg-theme-accent/10 hover:text-theme-accent hover:border-theme-accent/30
                                     transition-all duration-200"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </header>

                  {/* MESSAGES */}
                  <section className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 flex flex-col gap-1">
                    {messages.length > 0 ? (
                      messages.map((msg, i) => {
                        const isMine = msg.senderId === user._id;
                        const isEditing = !!msg._id && editingId === msg._id;
                        const time = new Date(
                          msg.createdAt || Date.now(),
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return (
                          <div
                            key={msg._id || i}
                            className={`flex items-end gap-2 mb-2
                                           ${isMine ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {/* Mini avatar (only for received) */}
                            {!isMine && (
                              <div
                                className="w-7 h-7 rounded-[9px] bg-gradient-to-br from-theme-accent to-indigo-600
                                              flex items-center justify-center text-white text-[10px] font-black
                                              shrink-0 mb-0.5 shadow-md"
                              >
                                {selectedContact.firstName?.charAt(0)}
                              </div>
                            )}

                            {/* Bubble */}
                            <div
                              className={`max-w-[68%] group ${isMine ? "items-end" : "items-start"} flex flex-col`}
                            >
                              {isEditing ? (
                                /* ── inline edit ── */
                                <div className="w-full min-w-[240px] flex flex-col gap-2 p-3 rounded-[18px] bg-theme-card nm-inset">
                                  <textarea
                                    autoFocus
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEditSave(msg);
                                      }
                                      if (e.key === "Escape") cancelEditing();
                                    }}
                                    rows={2}
                                    className="w-full resize-none bg-transparent text-sm font-medium
                                               text-theme-text focus:outline-none"
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={cancelEditing}
                                      className="px-3 py-1 rounded-lg text-[11px] font-bold text-theme-text-muted
                                                 hover:text-theme-text transition-colors duration-100"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleEditSave(msg)}
                                      disabled={!editText.trim()}
                                      className="px-3 py-1 rounded-lg text-[11px] font-bold bg-theme-accent text-white
                                                 disabled:opacity-40 nm-pressable"
                                    >
                                      Save
                                    </button>
                                  </div>
                                  <p className="text-[9px] text-theme-text-muted">
                                    Enter to save · Esc to cancel
                                  </p>
                                </div>
                              ) : (
                                <div
                                  className={`flex items-center gap-1.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                                >
                                  <div
                                    className={`px-4 py-2.5 rounded-[18px] transition-all duration-200
                                                  cursor-default
                                                  ${
                                                    isMine
                                                      ? "bg-gradient-to-br from-theme-accent to-theme-accent/75 text-white rounded-br-[5px] shadow-lg shadow-theme-accent/20"
                                                      : "bg-theme-card nm-raised-sm text-theme-text rounded-bl-[5px]"
                                                  }`}
                                  >
                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
                                      {msg.text}
                                    </p>
                                    <p
                                      className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-50
                                                  ${isMine ? "text-right" : "text-left"}`}
                                    >
                                      {time}
                                      {msg.edited && " · edited"}
                                    </p>
                                  </div>

                                  {/* Edit / delete — own messages only, revealed on hover */}
                                  {isMine && msg._id && (
                                    <div
                                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                                                 focus-within:opacity-100 transition-opacity duration-150"
                                    >
                                      <button
                                        onClick={() => startEditing(msg)}
                                        title="Edit message"
                                        aria-label="Edit message"
                                        className="w-7 h-7 rounded-lg flex items-center justify-center
                                                   text-theme-text-muted hover:text-theme-accent
                                                   bg-theme-card nm-pressable"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(msg)}
                                        title="Delete message"
                                        aria-label="Delete message"
                                        className="w-7 h-7 rounded-lg flex items-center justify-center
                                                   text-theme-text-muted hover:text-rose-500
                                                   bg-theme-card nm-pressable"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-20">
                        <div
                          className="w-16 h-16 rounded-[20px] border border-theme-accent/20
                                        bg-theme-accent/5 flex items-center justify-center"
                        >
                          <Send
                            size={28}
                            className="text-theme-accent opacity-50"
                          />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[.3em]">
                          Establish connection
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[.15em] opacity-60">
                          Initialize encrypted link to start broadcast
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </section>

                  {/* INPUT FOOTER */}
                  <footer
                    className="flex-shrink-0 px-4 pt-3 pb-4
                                     bg-theme-bg/60 backdrop-blur-md border-t border-theme-divider"
                  >
                    {/* Input row */}
                    <div
                      className="flex items-end gap-2.5 bg-white/5 border border-white/10 rounded-[20px]
                                    px-4 py-2 transition-all duration-250
                                    focus-within:border-theme-accent/50 focus-within:shadow-[0_0_0_3px_rgba(6,182,212,0.08)]"
                    >
                      <textarea
                        ref={textareaRef}
                        value={text}
                        rows={1}
                        onChange={(e) => {
                          setText(e.target.value);
                          autoResize(e.target);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Broadcast your signal..."
                        className="flex-1 bg-transparent border-none outline-none ring-0
                                   text-theme-text placeholder:text-theme-text-muted/40 mb-[5px]
                                   font-medium text-[13.5px] leading-[1.55]
                                   resize-none py-1 min-h-[22px]
                                   overflow-y-auto scrollbar-none"
                      />
                      <button
                        onClick={handleSend}
                        className="w-10 h-10 rounded-[14px] flex-shrink-0
                                   bg-gradient-to-br from-theme-accent to-theme-accent/70
                                   flex items-center justify-center
                                   shadow-[0_3px_14px_rgba(6,182,212,0.35)]
                                   hover:shadow-[0_5px_20px_rgba(6,182,212,0.5)]
                                   hover:scale-[1.08] hover:-rotate-[8deg]
                                   active:scale-95 transition-all duration-200"
                      >
                        <Send size={16} className="text-white" />
                      </button>
                    </div>

                    {/* Hint */}
                    <div className="flex items-center justify-between mt-1.5 px-1">
                      <span className="text-[10px] text-theme-text-muted/35 font-semibold tracking-wide">
                        Enter to send · Shift+Enter for new line
                      </span>
                      <span className="text-[10px] text-theme-text-muted/30 font-semibold">
                        {text.length} / 500
                      </span>
                    </div>
                  </footer>
                </>
              ) : (
                /* EMPTY STATE */
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div
                    className="w-[72px] h-[72px] rounded-[22px] bg-theme-accent/8 border border-theme-accent/15
                                  flex items-center justify-center animate-pulse"
                  >
                    <Search size={30} className="text-theme-accent/40" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[.4em] opacity-25 text-center">
                    Awaiting Selection
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[.15em] opacity-20 text-center max-width-[200px]">
                    Initialize encrypted link to start broadcast
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Chat;
