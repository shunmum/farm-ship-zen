import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Edit, Printer, Mail, Phone, MapPin, Trash2, UserPlus } from "lucide-react";
import { useCustomers, type Customer, type Recipient } from "@/hooks/useCustomers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const CustomersPage = () => {
  const { customers, loading } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);

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

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer({ ...customer });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    // ここで実際の保存処理を実装（例：APIコール）
    console.log("Saving customer:", editingCustomer);
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const updateEditingCustomer = (field: keyof Customer, value: string | number) => {
    if (editingCustomer) {
      setEditingCustomer({ ...editingCustomer, [field]: value });
    }
  };

  const handleAddRecipient = () => {
    const newRecipient: Recipient = {
      id: `R${Date.now()}`,
      name: "",
      address: "",
      postalCode: "",
      phone: "",
      email: "",
      relation: "",
    };
    setEditingRecipient(newRecipient);
    setIsAddingRecipient(true);
  };

  const handleEditRecipient = (recipient: Recipient) => {
    setEditingRecipient({ ...recipient });
    setIsAddingRecipient(false);
  };

  const handleSaveRecipient = () => {
    if (!editingCustomer || !editingRecipient) return;

    const recipients = editingCustomer.recipients || [];

    if (isAddingRecipient) {
      // 新規追加
      setEditingCustomer({
        ...editingCustomer,
        recipients: [...recipients, editingRecipient],
      });
    } else {
      // 既存の編集
      setEditingCustomer({
        ...editingCustomer,
        recipients: recipients.map((r) =>
          r.id === editingRecipient.id ? editingRecipient : r
        ),
      });
    }

    setEditingRecipient(null);
    setIsAddingRecipient(false);
  };

  const handleDeleteRecipient = (recipientId: string) => {
    if (!editingCustomer) return;

    setEditingCustomer({
      ...editingCustomer,
      recipients: (editingCustomer.recipients || []).filter((r) => r.id !== recipientId),
    });
  };

  const handleCancelRecipient = () => {
    setEditingRecipient(null);
    setIsAddingRecipient(false);
  };

  const updateEditingRecipient = (field: keyof Recipient, value: string) => {
    if (editingRecipient) {
      setEditingRecipient({ ...editingRecipient, [field]: value });
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">顧客管理</h1>
            <p className="text-sm sm:text-base text-muted-foreground">顧客情報の管理と検索</p>
          </div>
          <Button size="lg" className="btn-hover gap-2 shadow-lg w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            新規顧客追加
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="顧客名、電話番号、メールアドレスで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base h-11 sm:h-12"
                />
              </div>
              <Button size="lg" variant="secondary" className="btn-hover px-8 h-11 sm:h-12">
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
          
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="card-hover overflow-hidden">
                <CardContent className="p-4 sm:p-6">
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 btn-hover"
                        onClick={() => handleEditClick(customer)}
                      >
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>顧客情報の編集</DialogTitle>
            <DialogDescription>
              顧客の情報を編集してください。変更後、保存ボタンをクリックしてください。
            </DialogDescription>
          </DialogHeader>

          {editingCustomer && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">氏名</Label>
                <Input
                  id="name"
                  value={editingCustomer.name}
                  onChange={(e) => updateEditingCustomer("name", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) => updateEditingCustomer("email", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={editingCustomer.phone}
                  onChange={(e) => updateEditingCustomer("phone", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="postalCode">郵便番号</Label>
                <Input
                  id="postalCode"
                  value={editingCustomer.postalCode}
                  onChange={(e) => updateEditingCustomer("postalCode", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">住所</Label>
                <Input
                  id="address"
                  value={editingCustomer.address}
                  onChange={(e) => updateEditingCustomer("address", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastPurchaseDate">最終購入日</Label>
                <Input
                  id="lastPurchaseDate"
                  value={editingCustomer.lastPurchaseDate}
                  onChange={(e) => updateEditingCustomer("lastPurchaseDate", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="totalSpent">総購入金額</Label>
                <Input
                  id="totalSpent"
                  type="number"
                  value={editingCustomer.totalSpent}
                  onChange={(e) => updateEditingCustomer("totalSpent", parseFloat(e.target.value) || 0)}
                />
              </div>

              <Separator className="my-2" />

              {/* お届け先リスト */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">お届け先リスト</h3>
                    <p className="text-sm text-muted-foreground">
                      よく送るお届け先を登録できます
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRecipient}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    追加
                  </Button>
                </div>

                {editingCustomer.recipients && editingCustomer.recipients.length > 0 ? (
                  <div className="space-y-3">
                    {editingCustomer.recipients.map((recipient) => (
                      <Card key={recipient.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{recipient.name}</h4>
                                {recipient.relation && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {recipient.relation}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>〒{recipient.postalCode}</span>
                                </div>
                                <div className="ml-5">{recipient.address}</div>
                                <div className="flex items-center gap-2 ml-5">
                                  <Phone className="h-3 w-3" />
                                  <span>{recipient.phone}</span>
                                </div>
                                {recipient.email && (
                                  <div className="flex items-center gap-2 ml-5">
                                    <Mail className="h-3 w-3" />
                                    <span>{recipient.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRecipient(recipient)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecipient(recipient.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                    お届け先が登録されていません
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              キャンセル
            </Button>
            <Button onClick={handleSaveEdit}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* お届け先の追加・編集ダイアログ */}
      <Dialog open={!!editingRecipient} onOpenChange={(open) => !open && handleCancelRecipient()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isAddingRecipient ? "お届け先の追加" : "お届け先の編集"}
            </DialogTitle>
            <DialogDescription>
              お届け先の情報を入力してください。
            </DialogDescription>
          </DialogHeader>

          {editingRecipient && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="recipient-name">氏名 *</Label>
                <Input
                  id="recipient-name"
                  value={editingRecipient.name}
                  onChange={(e) => updateEditingRecipient("name", e.target.value)}
                  placeholder="例: 山田 花子"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recipient-relation">関係性</Label>
                <Input
                  id="recipient-relation"
                  value={editingRecipient.relation || ""}
                  onChange={(e) => updateEditingRecipient("relation", e.target.value)}
                  placeholder="例: 友人、親戚、取引先"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recipient-postalCode">郵便番号 *</Label>
                <Input
                  id="recipient-postalCode"
                  value={editingRecipient.postalCode}
                  onChange={(e) => updateEditingRecipient("postalCode", e.target.value)}
                  placeholder="例: 150-0043"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recipient-address">住所 *</Label>
                <Input
                  id="recipient-address"
                  value={editingRecipient.address}
                  onChange={(e) => updateEditingRecipient("address", e.target.value)}
                  placeholder="例: 東京都渋谷区道玄坂1-1-1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recipient-phone">電話番号 *</Label>
                <Input
                  id="recipient-phone"
                  value={editingRecipient.phone}
                  onChange={(e) => updateEditingRecipient("phone", e.target.value)}
                  placeholder="例: 03-1111-2222"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recipient-email">メールアドレス</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  value={editingRecipient.email || ""}
                  onChange={(e) => updateEditingRecipient("email", e.target.value)}
                  placeholder="例: yamada@example.com"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRecipient}>
              キャンセル
            </Button>
            <Button
              onClick={handleSaveRecipient}
              disabled={
                !editingRecipient?.name ||
                !editingRecipient?.postalCode ||
                !editingRecipient?.address ||
                !editingRecipient?.phone
              }
            >
              {isAddingRecipient ? "追加" : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersPage;
