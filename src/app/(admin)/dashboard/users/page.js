import prisma from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const metadata = { title: "Pengguna | Admin Dapur Arabella" };

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cart: { include: { items: { select: { quantity: true } } } }
    }
  });

  // Hitung total item di keranjang setiap user
  const usersWithCartCount = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    isActive: u.isActive,
    createdAt: u.createdAt,
    cartItemCount: u.cart?.items.reduce((a, i) => a + i.quantity, 0) || 0,
  }));

  return <UsersClient initialUsers={usersWithCartCount} />;
}
