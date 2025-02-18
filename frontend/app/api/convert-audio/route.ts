import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audioFile') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Save uploaded file to /public/uploads/
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const inputPath = path.join(uploadDir, audioFile.name);
        const outputPath = path.join(uploadDir, `converted_${audioFile.name}`);

        const buffer = Buffer.from(await audioFile.arrayBuffer());
        fs.writeFileSync(inputPath, buffer);

        // Example: Replace all sounds with a default drum sound (using ffmpeg as an example)
        const command = `ffmpeg -i ${inputPath} -af "volume=2" ${outputPath}`;  // Adjust processing logic

        exec(command, (err) => {
            if (err) {
                console.error('Error processing audio:', err);
                return NextResponse.json({ error: 'Audio processing failed' }, { status: 500 });
            }
        });

        return NextResponse.json({
            message: 'Audio converted successfully!',
            filePath: `/uploads/converted_${audioFile.name}`,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
