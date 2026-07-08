import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function checkAuth(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;
  return await verifyToken(token) !== null;
}

export async function GET(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let config = await prisma.storeConfig.findFirst();
    if (!config) {
      config = await prisma.storeConfig.create({
        data: {
          storeName: "Dapur Arabella",
          waNumber: process.env.ADMIN_WA_NUMBER || "",
        }
      });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Gagal mengambil pengaturan" }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    let config = await prisma.storeConfig.findFirst();

    if (config) {
      config = await prisma.storeConfig.update({
        where: { id: config.id },
        data: {
          storeName: data.storeName ?? config.storeName,
          waNumber: data.waNumber ?? config.waNumber,
          description: data.description ?? config.description,
          address: data.address ?? config.address,
          hours: data.hours ?? config.hours,
          deliveryETA: data.deliveryETA ?? config.deliveryETA,
          instagram: data.instagram ?? config.instagram,
          facebook: data.facebook ?? config.facebook,
          email: data.email ?? config.email,
          paymentMethods: data.paymentMethods ?? config.paymentMethods,
          aboutTitle: data.aboutTitle ?? config.aboutTitle,
          aboutDescription: data.aboutDescription ?? config.aboutDescription,
          aboutPoints: data.aboutPoints ?? config.aboutPoints,
          aboutBadgeNumber: data.aboutBadgeNumber ?? config.aboutBadgeNumber,
          aboutBadgeText: data.aboutBadgeText ?? config.aboutBadgeText,
          aboutImage: data.aboutImage ?? config.aboutImage,
          isOpen: data.isOpen ?? config.isOpen,
        }
      });
    } else {
      config = await prisma.storeConfig.create({ data });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
