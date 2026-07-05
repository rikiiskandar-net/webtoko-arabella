import prisma from "@/lib/prisma";
import KeranjangClient from "./KeranjangClient";

export const metadata = {
  title: "Keranjang Belanja | Dapur Arabella",
};

export default async function KeranjangPage() {
  const storeConfig = await prisma.storeConfig.findFirst();
  return <KeranjangClient storeWaNumber={storeConfig?.waNumber} />;
}
