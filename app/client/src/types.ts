export interface User {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  [key: string]: unknown;
}

export interface CommentItem {
  _id?: string;
  text?: string;
  authorName?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface PostItem {
  _id?: string;
  authorName?: string;
  authorId?: string;
  caption?: string;
  image?: string;
  createdAt?: string;
  userId?: string;
  likes?: string[];
  comments?: CommentItem[];
  [key: string]: unknown;
}

export interface ContactItem {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  _id?: string;
  isRead?: boolean;
  senderName?: string;
  content?: string;
  createdAt?: string;
  type?: string;
  [key: string]: unknown;
}

