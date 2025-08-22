import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
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
