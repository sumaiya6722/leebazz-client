import { requestFaqApi } from "@/lib/faq-api";

export function getFaqReplyUnreadCount() {
  return requestFaqApi("/api/customer/faq-replies/unread-count");
}

export function getMyFaqReplies() {
  return requestFaqApi("/api/customer/faq-replies");
}
