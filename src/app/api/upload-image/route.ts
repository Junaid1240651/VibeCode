import { auth } from '@clerk/nextjs/server';
import { uploadImageToBlob } from '@/lib/blob-storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (10MB limit - Azure can handle larger files)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Upload to Azure Blob Storage
    const blobUrl = await uploadImageToBlob(file, userId);

    return NextResponse.json({ 
      url: blobUrl,
      size: file.size,
      type: file.type 
    });

  } catch {
    return NextResponse.json(
      { error: 'Upload failed' }, 
      { status: 500 }
    );
  }
}