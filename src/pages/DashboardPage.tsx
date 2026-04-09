import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Users, ArrowLeftRight, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function DashboardPage() {
  const { data: inventory } = useQuery({
    queryKey: ["inventory-count"],
    queryFn: async () => {
      const { data } = await supabase.from("scrap_inventory").select("*, scrap_categories(name)");
      return data || [];
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["vendors-count"],
    queryFn: async () => {
      const { count } = await supabase.from("vendors").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*, vendors(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const totalItems = inventory?.length || 0;
  const totalValue = inventory?.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unit_price), 0) || 0;
  const totalTransactions = transactions?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your scrap management operations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Inventory Items" value={totalItems} icon={Package} description="Total scrap items" />
          <StatCard title="Total Value" value={`₹${totalValue.toLocaleString()}`} icon={DollarSign} description="Inventory worth" />
          <StatCard title="Vendors" value={vendors || 0} icon={Users} description="Active vendors" />
          <StatCard title="Transactions" value={totalTransactions} icon={ArrowLeftRight} description="Recent activity" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-heading">Recent Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {inventory && inventory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.slice(0, 5).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{(item.scrap_categories as any)?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{Number(item.unit_price).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === "available" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm">No inventory items yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-heading">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{(tx.vendors as any)?.name}</TableCell>
                        <TableCell>
                          <Badge variant={tx.transaction_type === "purchase" ? "default" : "secondary"}>
                            {tx.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{Number(tx.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={tx.payment_status === "paid" ? "default" : "outline"}>
                            {tx.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm">No transactions yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
