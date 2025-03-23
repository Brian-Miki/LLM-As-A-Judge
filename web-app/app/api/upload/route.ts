import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    // Here you would typically process the files
    // For now, we'll just simulate processing and return success
    
    const processedFiles = files.map((file: any) => ({
      name: file.name,
      type: file.type,
      size: file.size
    }));

    return NextResponse.json({ 
      success: true, 
      message: 'Files uploaded successfully',
      files: processedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 