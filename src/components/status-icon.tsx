import { cn } from "@/lib/utils";
import { AlertCircle, Check, Clock, DollarSign, XCircle } from "lucide-react";

export const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "approved":
      return <Check className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "paid":
      return <DollarSign className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export const StatusBadge = ({ status }: { status: string }) => {
  let icon: React.ReactNode, label: string, bg: string, text: string;

  switch (status) {
    case "approved":
      icon = <Check className="h-4 w-4 mr-1" />;
      label = "Approved";
      bg = "bg-green-100";
      text = "text-green-800";
      break;
    case "rejected":
      icon = <XCircle className="h-4 w-4 mr-1" />;
      label = "Rejected";
      bg = "bg-red-100";
      text = "text-red-800";
      break;
    case "pending":
      icon = <Clock className="h-4 w-4 mr-1" />;
      label = "Pending";
      bg = "bg-yellow-100";
      text = "text-yellow-800";
      break;
    case "paid":
      icon = <DollarSign className="h-4 w-4 mr-1" />;
      label = "Paid";
      bg = "bg-blue-100";
      text = "text-blue-800";
      break;
    default:
      icon = <AlertCircle className="h-4 w-4 mr-1" />;
      label = status.charAt(0).toUpperCase() + status.slice(1);
      bg = "bg-gray-100";
      text = "text-gray-800";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium",
        bg,
        text,
      )}
    >
      {icon}
      {label}
    </span>
  );
};
