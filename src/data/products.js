import { Grid2x2, CupSoda, UtensilsCrossed, Cookie, Snowflake } from 'lucide-react';

export const products = [
  {
    id: 1,
    name: "Cireng Salju Isi Ayam Pedas",
    price: 15000,
    category: "Camilan",
    badge: "Bestseller",
    badgeColor: "var(--accent)",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80",
    description: "Cireng renyah di luar, kenyal di dalam dengan isian ayam suwir pedas mercon.",
    rating: 4.9,
    sold: "2.1k"
  },
  {
    id: 2,
    name: "Es Mambo Buah Asli",
    price: 5000,
    category: "Minuman",
    badge: "",
    image: "https://images.unsplash.com/photo-1558231065-985f52f85e13?auto=format&fit=crop&w=400&q=80",
    description: "Es mambo segar terbuat dari 100% buah asli tanpa pemanis buatan.",
    rating: 4.7,
    sold: "850"
  },
  {
    id: 3,
    name: "Bolu Karamel Sarang Semut",
    price: 35000,
    originalPrice: 45000,
    category: "Makanan",
    badge: "Promo",
    badgeColor: "var(--red)",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
    description: "Bolu karamel manis legit dengan tekstur kenyal bersarang. Diskon spesial!",
    rating: 4.8,
    sold: "1.2k"
  },
  {
    id: 4,
    name: "Dimsum Ayam Udang",
    price: 25000,
    category: "Frozen Food",
    badge: "Bestseller",
    badgeColor: "var(--accent)",
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=400&q=80",
    description: "Dimsum ayam dan udang full daging (isi 5) lengkap dengan saus.",
    rating: 5.0,
    sold: "3.5k"
  },
  {
    id: 5,
    name: "Keripik Kaca Daun Jeruk",
    price: 12000,
    category: "Camilan",
    badge: "",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80",
    description: "Keripik singkong super tipis, renyah, berbalut bumbu pedas gurih.",
    rating: 4.6,
    sold: "450"
  },
  {
    id: 6,
    name: "Pudding Susu Karamel",
    price: 18000,
    category: "Camilan",
    badge: "Baru",
    badgeColor: "var(--primary)",
    image: "https://images.unsplash.com/photo-1579954115545-a95711ffa7ba?auto=format&fit=crop&w=400&q=80",
    description: "Pudding susu super lembut dengan siraman saus karamel lumer di mulut.",
    rating: 4.9,
    sold: "230"
  },
  {
    id: 7,
    name: "Es Jeruk Kunci Segar",
    price: 8000,
    category: "Minuman",
    badge: "Baru",
    badgeColor: "var(--primary)",
    image: "https://images.unsplash.com/photo-1621269389270-4d407fc3660a?auto=format&fit=crop&w=400&q=80",
    description: "Perasan jeruk kunci asli yang menyegarkan dengan tambahan biji selasih.",
    rating: 4.5,
    sold: "120"
  },
  {
    id: 8,
    name: "Nugget Ayam Wortel (500g)",
    price: 32000,
    originalPrice: 40000,
    category: "Frozen Food",
    badge: "Promo",
    badgeColor: "var(--red)",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80",
    description: "Nugget homemade tanpa pengawet dengan campuran ayam asli dan wortel.",
    rating: 4.8,
    sold: "980"
  }
];

export const categories = [
  { id: "Semua", name: "Semua", icon: <Grid2x2 size={18} strokeWidth={2} /> },
  { id: "Minuman", name: "Minuman", icon: <CupSoda size={18} strokeWidth={2} /> },
  { id: "Makanan", name: "Makanan", icon: <UtensilsCrossed size={18} strokeWidth={2} /> },
  { id: "Camilan", name: "Camilan", icon: <Cookie size={18} strokeWidth={2} /> },
  { id: "Frozen Food", name: "Frozen Food", icon: <Snowflake size={18} strokeWidth={2} /> }
];
