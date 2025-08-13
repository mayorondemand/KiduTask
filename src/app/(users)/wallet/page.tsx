"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function WalletPage() {
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoadingBankDetails, setIsLoadingBankDetails] = useState(false);

  // Mock user bank details from settings
  const [userBankDetails, setUserBankDetails] = useState(null);

  useEffect(() => {
    // Simulate fetching user bank details from settings
    const fetchBankDetails = async () => {
      setIsLoadingBankDetails(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock bank details - in real app, this would come from user settings
      setUserBankDetails({
        bankName: "First Bank of Nigeria",
        accountNumber: "0123456789",
        accountName: "John Doe",
        isVerified: true,
      });
      setIsLoadingBankDetails(false);
    };

    fetchBankDetails();
  }, []);

  // Remove these hardcoded constants:
  // const WITHDRAWAL_FEE = 100
  // const MINIMUM_WITHDRAWAL = 1000
  // const MINIMUM_DEPOSIT = 500
  // const MAXIMUM_DEPOSIT = 1000000

  // Add this function to fetch settings from backend:
  const fetchPlatformSettings = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      withdrawalFee: 100,
      minimumWithdrawal: 1000,
      minimumDeposit: 500,
      maximumDeposit: 1000000,
      campaignCreationFee: 5000,
    };
  };

  const { data: platformSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: fetchPlatformSettings,
  });

  // Constants
  // const WITHDRAWAL_FEE = 100
  // const MINIMUM_WITHDRAWAL = 1000
  // const MINIMUM_DEPOSIT = 500
  // const MAXIMUM_DEPOSIT = 1000000

  // Mock transaction history
  const transactions = [
    {
      id: "txn-1",
      type: "deposit",
      amount: 10000,
      fee: 0,
      status: "completed",
      description: "Wallet deposit",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "txn-2",
      type: "earning",
      amount: 500,
      fee: 0,
      status: "completed",
      description: "Task completion reward",
      createdAt: "2024-01-15T09:15:00Z",
    },
    {
      id: "txn-3",
      type: "withdrawal",
      amount: 5000,
      fee: 100,
      status: "pending",
      description: "Bank withdrawal",
      createdAt: "2024-01-14T16:20:00Z",
    },
    {
      id: "txn-4",
      type: "earning",
      amount: 300,
      fee: 0,
      status: "completed",
      description: "Task completion reward",
      createdAt: "2024-01-14T14:45:00Z",
    },
    {
      id: "txn-5",
      type: "withdrawal",
      amount: 2000,
      fee: 100,
      status: "completed",
      description: "Bank withdrawal",
      createdAt: "2024-01-13T11:30:00Z",
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const depositMutation = useMutation({
    mutationFn: async (amount) => {
      // Simulate deposit processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true, amount };
    },
    onSuccess: (data) => {
      toast({
        title: "Deposit Successful! 🎉",
        description: `${formatCurrency(data.amount)} has been added to your wallet`,
      });
      setDepositAmount("");
      setDepositDialogOpen(false);
      queryClient.invalidateQueries(["wallet"]);
    },
    onError: () => {
      toast({
        title: "Deposit Failed",
        description:
          "There was an error processing your deposit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount) => {
      // Simulate withdrawal processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true, amount };
    },
    onSuccess: (data) => {
      toast({
        title: "Withdrawal Submitted! 📤",
        description: `Your withdrawal of ${formatCurrency(data.amount)} is being processed`,
      });
      setWithdrawAmount("");
      setWithdrawDialogOpen(false);
      queryClient.invalidateQueries(["wallet"]);
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description:
          "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    const amount = Number.parseFloat(depositAmount);
    if (!amount || amount < (platformSettings?.minimumDeposit || 500)) {
      toast({
        title: "Invalid Amount",
        description: `Minimum deposit is ${formatCurrency(platformSettings?.minimumDeposit || 500)}`,
        variant: "destructive",
      });
      return;
    }
    if (amount > (platformSettings?.maximumDeposit || 1000000)) {
      toast({
        title: "Amount Too High",
        description: `Maximum deposit is ${formatCurrency(platformSettings?.maximumDeposit || 1000000)}`,
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate(amount);
  };

  const getWithdrawalError = () => {
    if (!user?.kycVerified) {
      return "KYC verification required. Complete your identity verification in Settings to enable withdrawals.";
    }
    if (!userBankDetails?.isVerified) {
      return "Bank account verification required. Add and verify your bank account in Settings to enable withdrawals.";
    }
    if (user.walletBalance < (platformSettings?.minimumWithdrawal || 1000)) {
      return `Insufficient balance. You need at least ${formatCurrency(platformSettings?.minimumWithdrawal || 1000)} to make a withdrawal.`;
    }
    return null;
  };

  const handleWithdraw = () => {
    const amount = Number.parseFloat(withdrawAmount);
    const totalDeduction = amount + (platformSettings?.withdrawalFee || 100);

    if (!amount || amount < (platformSettings?.minimumWithdrawal || 1000)) {
      toast({
        title: "Invalid Amount",
        description: `Minimum withdrawal is ${formatCurrency(platformSettings?.minimumWithdrawal || 1000)}`,
        variant: "destructive",
      });
      return;
    }

    if (totalDeduction > user.walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${formatCurrency(totalDeduction)} (including ${formatCurrency(platformSettings?.withdrawalFee || 100)} fee) but only have ${formatCurrency(user.walletBalance)}`,
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "earning":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const quickDepositAmounts = [1000, 2500, 5000, 10000];

  const canWithdraw = userBankDetails?.isVerified && user?.kycVerified;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">
            Manage your funds and view transaction history
          </p>
        </div>

        {/* Wallet Balance Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-6 w-6" />
              <span>Wallet Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {formatCurrency(user.walletBalance)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Available balance
                </p>
              </div>
              <div className="flex space-x-3">
                <Dialog
                  open={depositDialogOpen}
                  onOpenChange={setDepositDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit Funds</DialogTitle>
                      <DialogDescription>
                        Add money to your wallet. Minimum deposit:{" "}
                        {formatCurrency(
                          platformSettings?.minimumDeposit || 500,
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="deposit-amount">Amount</Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Quick amounts</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {quickDepositAmounts.map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              onClick={() =>
                                setDepositAmount(amount.toString())
                              }
                              className="bg-transparent"
                            >
                              {formatCurrency(amount)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Deposits are processed
                          instantly via secure payment gateway.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDepositDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeposit}
                        disabled={depositMutation.isPending}
                      >
                        {depositMutation.isPending
                          ? "Processing..."
                          : "Deposit"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={withdrawDialogOpen}
                  onOpenChange={setWithdrawDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!canWithdraw || isLoadingBankDetails}
                      className="bg-transparent"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                      <DialogDescription>
                        Withdraw money to your verified bank account. Minimum:{" "}
                        {formatCurrency(
                          platformSettings?.minimumWithdrawal || 1000,
                        )}
                      </DialogDescription>
                    </DialogHeader>

                    {!canWithdraw ? (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-800">
                                Cannot Withdraw
                              </h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                {getWithdrawalError()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <Link href="/settings">
                            <Button>
                              <Building2 className="h-4 w-4 mr-2" />
                              Go to Settings
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Bank Account Info */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-800">
                                Verified Bank Account
                              </h4>
                              <div className="text-sm text-green-700 mt-1">
                                <p>{userBankDetails?.bankName}</p>
                                <p>
                                  {userBankDetails?.accountNumber} -{" "}
                                  {userBankDetails?.accountName}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="withdraw-amount">
                            Withdrawal Amount
                          </Label>
                          <Input
                            id="withdraw-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                        </div>

                        {withdrawAmount &&
                          Number.parseFloat(withdrawAmount) >=
                            (platformSettings?.minimumWithdrawal || 1000) && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">
                                Transaction Summary
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Withdrawal amount:</span>
                                  <span>
                                    {formatCurrency(
                                      Number.parseFloat(withdrawAmount),
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Processing fee:</span>
                                  <span>
                                    {formatCurrency(
                                      platformSettings?.withdrawalFee || 100,
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between font-medium border-t pt-1">
                                  <span>Total deduction:</span>
                                  <span>
                                    {formatCurrency(
                                      Number.parseFloat(withdrawAmount) +
                                        (platformSettings?.withdrawalFee ||
                                          100),
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Withdrawals are processed
                            within 24 hours on business days.
                          </p>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setWithdrawDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      {canWithdraw && (
                        <Button
                          onClick={handleWithdraw}
                          disabled={withdrawMutation.isPending}
                        >
                          {withdrawMutation.isPending
                            ? "Processing..."
                            : "Withdraw"}
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent wallet transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <span
                          className={
                            transaction.type === "withdrawal"
                              ? "text-red-600"
                              : transaction.type === "deposit" ||
                                  transaction.type === "earning"
                                ? "text-green-600"
                                : ""
                          }
                        >
                          {transaction.type === "withdrawal" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transaction.fee > 0
                          ? formatCurrency(transaction.fee)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-600">
                  Your transaction history will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
