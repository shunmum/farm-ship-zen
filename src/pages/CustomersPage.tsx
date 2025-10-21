import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Edit, Printer, Mail, Phone, MapPin } from "lucide-react";
import { useSampleData } from "@/hooks/useSampleData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const CustomersPage = () => {
  const { customers } = useSampleData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">顧客管理</h1>
            <p className="text-muted-foreground">顧客情報の管理と検索</p>
          </div>
          <Button size="lg" className="btn-hover gap-2 shadow-lg">
            <Plus className="h-5 w-5" />
            新規顧客追加
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="顧客名、電話番号、メールアドレスで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base h-12"
                />
              </div>
              <Button size="lg" variant="secondary" className="btn-hover px-8">
                検索
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCustomers.length}件の顧客
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="card-hover overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-lg font-semibold text-white">
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        最終購入: {customer.lastPurchaseDate}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-muted-foreground">〒{customer.postalCode}</div>
                        <div>{customer.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">総購入金額</span>
                      <span className="text-xl font-bold text-primary">
                        ¥{customer.totalSpent.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 btn-hover">
                        <Edit className="h-3 w-3 mr-1" />
                        編集
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 btn-hover">
                        <Printer className="h-3 w-3 mr-1" />
                        送り状
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
