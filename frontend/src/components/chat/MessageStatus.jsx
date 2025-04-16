// MessageStatus.jsx
import React from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageStatus = ({ status }) => {
if (status === 'sent') {
  return <Check size={14} />;
}
if (status === 'delivered') {
  return <CheckCheck size={14} />;
}
if (status === 'read') {
  return <CheckCheck size={14} className="text-blue-200" />;
}
return null;
};

export default MessageStatus;