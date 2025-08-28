"use client";

import { Navbar } from "@/components/layout/navbar";
import { usePublicAuth } from "@/components/providers/public-auth-provider";
import { StatusBadge } from "@/components/status-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateWithdrawal,
  useInitiateDeposit,
  usePlatformSettings,
  useTransactions,
} from "@/lib/client";
import type { TransactionTypeEnum } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CheckCircle,
  CreditCard,
  DollarSign,
  Loader2,
  Megaphone,
  Minus,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WalletPage() {
  const { user } = usePublicAuth();
  const router = useRouter();

  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Mock user bank details from settings
  const [userBankDetails, setUserBankDetails] = useState<{
    bankName: string;
    accountNumber: string;
    accountName: string;
    isVerified: boolean;
  } | null>(null);

  useEffect(() => {
    // Simulate fetching user bank details from settings
    const fetchBankDetails = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock bank details - in real app, this would come from user settings
      setUserBankDetails({
        bankName: "First Bank of Nigeria",
        accountNumber: "0123456789",
        accountName: "John Doe",
        isVerified: true,
      });
    };

    fetchBankDetails();
  }, []);

  const { data: platformSettings } = usePlatformSettings();
  const { data: transactions = [] } = useTransactions(50);

  const depositMutation = useInitiateDeposit();

  const withdrawMutation = useCreateWithdrawal();

  const handleDeposit = () => {
    const amount = Number.parseFloat(depositAmount);
    if (!amount || amount < (platformSettings?.minimumDeposit || 500)) {
      toast.error(
        `Minimum deposit is ${formatCurrency(platformSettings?.minimumDeposit || 500)}`,
      );
      return;
    }
    depositMutation.mutate(amount, {
      onSuccess: (data) => {
        const link = data.link;
        console.log("link response", link);
        if (link) router.push(link);
        toast.info("Deposit initiated. Complete payment in the opened tab");
        setDepositAmount("");
        setDepositDialogOpen(false);
      },
    });
  };

  const handleWithdraw = () => {
    if (!platformSettings || !user?.walletBalance) {
      toast.info("Please wait", {
        description: "If this does not resolve, contact support",
      });
      return;
    }
    const amount = Number.parseFloat(withdrawAmount);
    const totalDeduction = amount + platformSettings.withdrawalFee;

    if (!amount || amount < platformSettings.minimumWithdrawal) {
      toast.error(
        `Minimum withdrawal is ${formatCurrency(platformSettings?.minimumWithdrawal)}`,
      );
      return;
    }

    if (totalDeduction > user.walletBalance) {
      toast.error(
        `You need ${formatCurrency(totalDeduction)} (including ${formatCurrency(platformSettings.withdrawalFee)} fee) but only have ${formatCurrency(user.walletBalance)}`,
      );
      return;
    }

    withdrawMutation.mutate(amount, {
      onSuccess: () => {
        setWithdrawAmount("");
        setWithdrawDialogOpen(false);
      },
    });
  };

  const getTransactionIcon = (type: TransactionTypeEnum) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "earning":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "campaign_creation":
        return <Megaphone className="h-4 w-4 text-primary" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const quickDepositAmounts = [10000, 25000, 50000, 100000, 250000, 300000];

  const canWithdraw = userBankDetails?.isVerified && user?.isKycVerified;

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="animate-spin  border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading Wallet...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">
            Manage your funds and view transaction history
          </p>
        </div>

        {/* Wallet Balance Card */}
        <Card className="mb-8 shadow-none rounded-lg">
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
                    <Button variant="outline" className="bg-transparent">
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
                                {!userBankDetails?.isVerified
                                  ? "You have not set your bank details"
                                  : "You have not completed KYC verification"}
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
                      <Button
                        onClick={handleWithdraw}
                        disabled={withdrawMutation.isPending}
                      >
                        {withdrawMutation.isPending
                          ? "Processing..."
                          : "Withdraw"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="shadow-none rounded-lg">
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
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow className="h-14" key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="uppercase">
                            {String(transaction.type)}
                          </span>
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
                          {transaction.type === "withdrawal" ||
                          transaction.type === "campaign_creation"
                            ? "-"
                            : "+"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(transaction.createdAt))}
                      </TableCell>
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
