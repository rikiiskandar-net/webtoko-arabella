import prisma from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const metadata = { title: "Pengguna | Admin Dapur Arabella" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let usersWithCartCount = [];

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        cart: {
          select: {
            items: {
              select: { quantity: true }
            }
          }
        }
      }
    });

    usersWithCartCount = users.map(u => ({
      id: u.id,
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      address: u.address || "",
      avatar: u.avatar || "",
      isActive: u.isActive,
      createdAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
      cartItemCount: u.cart?.items
        ? u.cart.items.reduce((a, i) => a + (i.quantity || 0), 0)
        : 0,
    }));
  } catch (err) {
    console.error("UsersPage error:", err);
    // Return empty state, bukan crash
    usersWithCartCount = [];
  }

  return <UsersClient initialUsers={usersWithCartCount} />;
}
