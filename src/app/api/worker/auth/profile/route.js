import { NextResponse } from "next/server";
import { getWorkerAuthSession } from "@/lib/workerAuth";
import prisma from "@/lib/prisma";

export async function PUT(req) {
  try {
    const user = await getWorkerAuthSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address, role } = body;

    // Prepare update data (only update fields that are provided)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (role !== undefined) updateData.role = role;

    // Update in database
    const updatedWorker = await prisma.worker.update({
      where: { id: user.id },
      data: updateData
    });
    
    // Re-issue cookie so the session has the latest profile data
    const { setWorkerAuthCookie } = await import("@/lib/workerAuth");
    const newPayload = {
      id: updatedWorker.id,
      email: updatedWorker.email,
      name: updatedWorker.name,
      role: updatedWorker.role,
      phone: updatedWorker.phone,
      address: updatedWorker.address
    };
    await setWorkerAuthCookie(newPayload);

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedWorker.id,
        email: updatedWorker.email,
        name: updatedWorker.name,
        role: updatedWorker.role,
        phone: updatedWorker.phone,
        address: updatedWorker.address
      }
    });

  } catch (error) {
    console.error("Worker profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
