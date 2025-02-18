import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const drumSound = formData.get('drumSound') as string;
        const soundFile = formData.get('sound') as File;

        if (!drumSound || !soundFile) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Save uploaded file to public/uploads directory
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, soundFile.name);
        const buffer = Buffer.from(await soundFile.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({
            message: 'Sound assigned successfully!',
            filePath: `/uploads/${soundFile.name}`,
            drumSound
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
