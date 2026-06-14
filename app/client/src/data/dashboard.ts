import { Home, MessageCircleIcon, Bell, User, DiamondPlus } from "lucide-react";

export const nav = [
  {
    name: Home,
    label: "Home",
    path:"/dashboard",
  },
  {
    name: MessageCircleIcon,
      label: "Message",
    path:"/chat",
  },
  {
    name: Bell,
      label: "Notification",
    path:"/notification",
  },
  {
    name: User,
      label: "Profile",
    path:"/profile",
  },
  {
    name: DiamondPlus,
      label: "CreatePost",
    path:"/post",
  },
];
