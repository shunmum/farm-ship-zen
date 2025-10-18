import { useState } from "react";

export interface Customer {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  lastPurchaseDate: string;
  totalSpent: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  size: string;
  weight: number;
  category: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  products: { productId: string; productName: string; quantity: number }[];
  amount: number;
  deliveryDate: string;
  status: "未発送" | "発送済み" | "配達完了" | "キャンセル";
  shippingCompany?: string;
  trackingNumber?: string;
}

export const useSampleData = () => {
  const [customers] = useState<Customer[]>([
    {
      id: "C001",
      name: "田中 太郎",
      address: "東京都世田谷区三軒茶屋1-2-3",
      postalCode: "154-0024",
      phone: "03-1234-5678",
      email: "tanaka@example.com",
      lastPurchaseDate: "2024-01-15",
      totalSpent: 125000,
    },
    {
      id: "C002",
      name: "佐藤 花子",
      address: "神奈川県横浜市中区山下町4-5-6",
      postalCode: "231-0023",
      phone: "045-2345-6789",
      email: "sato@example.com",
      lastPurchaseDate: "2024-01-18",
      totalSpent: 98000,
    },
    {
      id: "C003",
      name: "鈴木 一郎",
      address: "大阪府大阪市北区梅田7-8-9",
      postalCode: "530-0001",
      phone: "06-3456-7890",
      email: "suzuki@example.com",
      lastPurchaseDate: "2024-01-20",
      totalSpent: 156000,
    },
    {
      id: "C004",
      name: "高橋 美咲",
      address: "愛知県名古屋市中区栄10-11-12",
      postalCode: "460-0008",
      phone: "052-4567-8901",
      email: "takahashi@example.com",
      lastPurchaseDate: "2024-01-12",
      totalSpent: 87000,
    },
    {
      id: "C005",
      name: "伊藤 健太",
      address: "福岡県福岡市博多区博多駅13-14-15",
      postalCode: "812-0011",
      phone: "092-5678-9012",
      email: "ito@example.com",
      lastPurchaseDate: "2024-01-22",
      totalSpent: 203000,
    },
    {
      id: "C006",
      name: "渡辺 由美",
      address: "北海道札幌市中央区大通16-17-18",
      postalCode: "060-0042",
      phone: "011-6789-0123",
      email: "watanabe@example.com",
      lastPurchaseDate: "2024-01-10",
      totalSpent: 145000,
    },
    {
      id: "C007",
      name: "山本 直樹",
      address: "宮城県仙台市青葉区一番町19-20-21",
      postalCode: "980-0811",
      phone: "022-7890-1234",
      email: "yamamoto@example.com",
      lastPurchaseDate: "2024-01-25",
      totalSpent: 67000,
    },
    {
      id: "C008",
      name: "中村 まり",
      address: "広島県広島市中区紙屋町22-23-24",
      postalCode: "730-0031",
      phone: "082-8901-2345",
      email: "nakamura@example.com",
      lastPurchaseDate: "2024-01-08",
      totalSpent: 112000,
    },
    {
      id: "C009",
      name: "小林 和也",
      address: "京都府京都市下京区四条通25-26-27",
      postalCode: "600-8001",
      phone: "075-9012-3456",
      email: "kobayashi@example.com",
      lastPurchaseDate: "2024-01-28",
      totalSpent: 189000,
    },
    {
      id: "C010",
      name: "加藤 さくら",
      address: "静岡県静岡市葵区呉服町28-29-30",
      postalCode: "420-0031",
      phone: "054-0123-4567",
      email: "kato@example.com",
      lastPurchaseDate: "2024-01-05",
      totalSpent: 93000,
    },
  ]);

  const [products] = useState<Product[]>([
    { id: "P001", name: "有機トマト", price: 1200, size: "80", weight: 1.5, category: "野菜" },
    { id: "P002", name: "きゅうり", price: 800, size: "60", weight: 1.0, category: "野菜" },
    { id: "P003", name: "なす", price: 900, size: "60", weight: 1.2, category: "野菜" },
    { id: "P004", name: "じゃがいも5kg", price: 2500, size: "100", weight: 5.5, category: "野菜" },
    { id: "P005", name: "たまねぎ3kg", price: 1800, size: "80", weight: 3.2, category: "野菜" },
    { id: "P006", name: "にんじん", price: 700, size: "60", weight: 1.0, category: "野菜" },
    { id: "P007", name: "キャベツ", price: 600, size: "80", weight: 1.5, category: "野菜" },
    { id: "P008", name: "レタス", price: 500, size: "60", weight: 0.8, category: "野菜" },
    { id: "P009", name: "いちご", price: 3500, size: "80", weight: 1.0, category: "果物" },
    { id: "P010", name: "みかん5kg", price: 3000, size: "100", weight: 5.5, category: "果物" },
    { id: "P011", name: "りんご5kg", price: 4000, size: "100", weight: 5.5, category: "果物" },
    { id: "P012", name: "コシヒカリ10kg", price: 6500, size: "140", weight: 10.5, category: "米" },
  ]);

  const [orders] = useState<Order[]>([
    {
      id: "O001",
      orderNumber: "2024010001",
      orderDate: "2024-01-15",
      customerId: "C001",
      customerName: "田中 太郎",
      products: [
        { productId: "P001", productName: "有機トマト", quantity: 2 },
        { productId: "P004", productName: "じゃがいも5kg", quantity: 1 },
      ],
      amount: 5400,
      deliveryDate: "2024-01-20",
      status: "配達完了",
      shippingCompany: "ヤマト運輸",
      trackingNumber: "1234-5678-9012",
    },
    {
      id: "O002",
      orderNumber: "2024010002",
      orderDate: "2024-01-16",
      customerId: "C002",
      customerName: "佐藤 花子",
      products: [
        { productId: "P009", productName: "いちご", quantity: 1 },
        { productId: "P008", productName: "レタス", quantity: 2 },
      ],
      amount: 4500,
      deliveryDate: "2024-01-21",
      status: "発送済み",
      shippingCompany: "佐川急便",
      trackingNumber: "9876-5432-1098",
    },
    {
      id: "O003",
      orderNumber: "2024010003",
      orderDate: "2024-01-17",
      customerId: "C003",
      customerName: "鈴木 一郎",
      products: [{ productId: "P012", productName: "コシヒカリ10kg", quantity: 2 }],
      amount: 13000,
      deliveryDate: "2024-01-23",
      status: "未発送",
    },
    {
      id: "O004",
      orderNumber: "2024010004",
      orderDate: "2024-01-18",
      customerId: "C004",
      customerName: "高橋 美咲",
      products: [
        { productId: "P010", productName: "みかん5kg", quantity: 1 },
        { productId: "P005", productName: "たまねぎ3kg", quantity: 1 },
      ],
      amount: 4800,
      deliveryDate: "2024-01-24",
      status: "未発送",
    },
    {
      id: "O005",
      orderNumber: "2024010005",
      orderDate: "2024-01-19",
      customerId: "C005",
      customerName: "伊藤 健太",
      products: [
        { productId: "P011", productName: "りんご5kg", quantity: 2 },
        { productId: "P001", productName: "有機トマト", quantity: 1 },
      ],
      amount: 9200,
      deliveryDate: "2024-01-25",
      status: "発送済み",
      shippingCompany: "ゆうパック",
      trackingNumber: "5555-6666-7777",
    },
    {
      id: "O006",
      orderNumber: "2024010006",
      orderDate: "2024-01-20",
      customerId: "C006",
      customerName: "渡辺 由美",
      products: [
        { productId: "P002", productName: "きゅうり", quantity: 3 },
        { productId: "P003", productName: "なす", quantity: 2 },
      ],
      amount: 4200,
      deliveryDate: "2024-01-26",
      status: "配達完了",
      shippingCompany: "ヤマト運輸",
      trackingNumber: "1111-2222-3333",
    },
    {
      id: "O007",
      orderNumber: "2024010007",
      orderDate: "2024-01-21",
      customerId: "C007",
      customerName: "山本 直樹",
      products: [
        { productId: "P007", productName: "キャベツ", quantity: 2 },
        { productId: "P006", productName: "にんじん", quantity: 3 },
      ],
      amount: 3300,
      deliveryDate: "2024-01-27",
      status: "未発送",
    },
    {
      id: "O008",
      orderNumber: "2024010008",
      orderDate: "2024-01-22",
      customerId: "C008",
      customerName: "中村 まり",
      products: [{ productId: "P012", productName: "コシヒカリ10kg", quantity: 1 }],
      amount: 6500,
      deliveryDate: "2024-01-28",
      status: "発送済み",
      shippingCompany: "佐川急便",
      trackingNumber: "4444-5555-6666",
    },
    {
      id: "O009",
      orderNumber: "2024010009",
      orderDate: "2024-01-23",
      customerId: "C009",
      customerName: "小林 和也",
      products: [
        { productId: "P009", productName: "いちご", quantity: 2 },
        { productId: "P010", productName: "みかん5kg", quantity: 1 },
      ],
      amount: 10000,
      deliveryDate: "2024-01-29",
      status: "未発送",
    },
    {
      id: "O010",
      orderNumber: "2024010010",
      orderDate: "2024-01-24",
      customerId: "C010",
      customerName: "加藤 さくら",
      products: [
        { productId: "P004", productName: "じゃがいも5kg", quantity: 1 },
        { productId: "P005", productName: "たまねぎ3kg", quantity: 1 },
      ],
      amount: 4300,
      deliveryDate: "2024-01-30",
      status: "配達完了",
      shippingCompany: "ヤマト運輸",
      trackingNumber: "7777-8888-9999",
    },
    {
      id: "O011",
      orderNumber: "2024010011",
      orderDate: "2024-01-25",
      customerId: "C001",
      customerName: "田中 太郎",
      products: [{ productId: "P011", productName: "りんご5kg", quantity: 1 }],
      amount: 4000,
      deliveryDate: "2024-01-31",
      status: "未発送",
    },
    {
      id: "O012",
      orderNumber: "2024010012",
      orderDate: "2024-01-26",
      customerId: "C002",
      customerName: "佐藤 花子",
      products: [
        { productId: "P001", productName: "有機トマト", quantity: 1 },
        { productId: "P002", productName: "きゅうり", quantity: 1 },
        { productId: "P003", productName: "なす", quantity: 1 },
      ],
      amount: 2900,
      deliveryDate: "2024-02-01",
      status: "発送済み",
      shippingCompany: "ゆうパック",
      trackingNumber: "2222-3333-4444",
    },
    {
      id: "O013",
      orderNumber: "2024010013",
      orderDate: "2024-01-27",
      customerId: "C003",
      customerName: "鈴木 一郎",
      products: [
        { productId: "P009", productName: "いちご", quantity: 3 },
      ],
      amount: 10500,
      deliveryDate: "2024-02-02",
      status: "配達完了",
      shippingCompany: "ヤマト運輸",
      trackingNumber: "8888-9999-0000",
    },
    {
      id: "O014",
      orderNumber: "2024010014",
      orderDate: "2024-01-28",
      customerId: "C005",
      customerName: "伊藤 健太",
      products: [
        { productId: "P012", productName: "コシヒカリ10kg", quantity: 1 },
        { productId: "P004", productName: "じゃがいも5kg", quantity: 1 },
      ],
      amount: 9000,
      deliveryDate: "2024-02-03",
      status: "未発送",
    },
    {
      id: "O015",
      orderNumber: "2024010015",
      orderDate: "2024-01-29",
      customerId: "C007",
      customerName: "山本 直樹",
      products: [
        { productId: "P010", productName: "みかん5kg", quantity: 2 },
      ],
      amount: 6000,
      deliveryDate: "2024-02-04",
      status: "未発送",
    },
    {
      id: "O016",
      orderNumber: "2024010016",
      orderDate: "2024-01-30",
      customerId: "C008",
      customerName: "中村 まり",
      products: [
        { productId: "P007", productName: "キャベツ", quantity: 3 },
        { productId: "P008", productName: "レタス", quantity: 3 },
      ],
      amount: 3300,
      deliveryDate: "2024-02-05",
      status: "発送済み",
      shippingCompany: "佐川急便",
      trackingNumber: "3333-4444-5555",
    },
    {
      id: "O017",
      orderNumber: "2024010017",
      orderDate: "2024-01-31",
      customerId: "C009",
      customerName: "小林 和也",
      products: [
        { productId: "P011", productName: "りんご5kg", quantity: 2 },
        { productId: "P010", productName: "みかん5kg", quantity: 1 },
      ],
      amount: 11000,
      deliveryDate: "2024-02-06",
      status: "配達完了",
      shippingCompany: "ヤマト運輸",
      trackingNumber: "6666-7777-8888",
    },
    {
      id: "O018",
      orderNumber: "2024020001",
      orderDate: "2024-02-01",
      customerId: "C010",
      customerName: "加藤 さくら",
      products: [
        { productId: "P001", productName: "有機トマト", quantity: 2 },
        { productId: "P006", productName: "にんじん", quantity: 2 },
      ],
      amount: 3800,
      deliveryDate: "2024-02-07",
      status: "未発送",
    },
    {
      id: "O019",
      orderNumber: "2024020002",
      orderDate: "2024-02-02",
      customerId: "C004",
      customerName: "高橋 美咲",
      products: [{ productId: "P012", productName: "コシヒカリ10kg", quantity: 1 }],
      amount: 6500,
      deliveryDate: "2024-02-08",
      status: "未発送",
    },
    {
      id: "O020",
      orderNumber: "2024020003",
      orderDate: "2024-02-03",
      customerId: "C006",
      customerName: "渡辺 由美",
      products: [
        { productId: "P009", productName: "いちご", quantity: 1 },
        { productId: "P002", productName: "きゅうり", quantity: 1 },
        { productId: "P003", productName: "なす", quantity: 1 },
      ],
      amount: 5200,
      deliveryDate: "2024-02-09",
      status: "未発送",
    },
  ]);

  return { customers, products, orders };
};
