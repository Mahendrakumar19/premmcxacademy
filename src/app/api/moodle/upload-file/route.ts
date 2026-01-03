import { NextRequest, NextResponse } from 'next/server';

const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;
    const sectionId = formData.get('sectionId') as string;
    const fileName = formData.get('fileName') as string || file.name;
    const description = formData.get('description') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Step 1: Upload file to Moodle draft area
    const uploadFormData = new FormData();
    uploadFormData.append('file_1', file);
    uploadFormData.append('itemid', '0'); // Draft area
    
    const uploadUrl = `${MOODLE_URL}/webservice/upload.php?token=${MOODLE_TOKEN}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      throw new Error('File upload failed');
    }

    const uploadResult = await uploadResponse.json();
    console.log('Upload result:', uploadResult);

    // Step 2: Create resource module in course
    // Using Moodle's core_course_create_module or manual enrollment
    const createResourceUrl = `${MOODLE_URL}/webservice/rest/server.php`;
    const resourceParams = new URLSearchParams({
      wstoken: MOODLE_TOKEN!,
      wsfunction: 'core_course_create_module',
      moodlewsrestformat: 'json',
      courseid: courseId,
      section: sectionId,
      modulename: 'resource',
      name: fileName,
      intro: description,
    });

    // Note: This requires additional Moodle configuration
    // For now, return success with upload info
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileInfo: uploadResult,
      note: 'Resource module creation requires admin token with course:manageactivities capability'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
