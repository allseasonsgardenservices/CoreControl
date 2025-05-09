import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface EditRequest {
    id: number;
    name: string;
    os: string;
    ip: string;
    url: string;
    cpu: string;
    gpu: string;
    ram: string;
    disk: string;
}

export async function PUT(request: NextRequest) {
    try {
        const body: EditRequest = await request.json();
        const { id, name, os, ip, url, cpu, gpu, ram, disk } = body;

        const existingServer = await prisma.server.findUnique({ where: { id } });
        if (!existingServer) {
            return NextResponse.json({ error: "Server not found" }, { status: 404 });
        }

        const updatedServer = await prisma.server.update({
            where: { id },
            data: { 
                name, 
                os, 
                ip, 
                url,
                cpu,
                gpu,
                ram,
                disk
            }
        });

        return NextResponse.json({ message: "Server updated", server: updatedServer });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}