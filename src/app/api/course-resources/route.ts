import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCourseContents } from '@/lib/moodle-api';

/**
 * GET /api/course-resources?courseId=X
 * Fetch course resources/modules with detailed logging
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = request.nextUrl.searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    const courseIdNum = parseInt(courseId, 10);
    const userToken = (session.user as any)?.token;
    const courseToken = process.env.MOODLE_COURSE_TOKEN;

    console.log(`\n🎓 [Course Resources API] Fetching resources for course ${courseIdNum}`);
    console.log(`📍 Using tokens:`, {
      hasUserToken: !!userToken,
      hasCourseToken: !!courseToken,
    });

    // Try to fetch course contents
    let contents: any = null;

    // First, try with user token if available
    if (userToken) {
      try {
        console.log('🔐 Attempting fetch with user token...');
        contents = await getCourseContents(courseIdNum, userToken);
        
        // Check if it's an error response
        if (contents && (contents as any).exception) {
          console.warn('⚠️ User token returned exception, trying course token...');
          contents = null;
        } else if (Array.isArray(contents) && contents.length > 0) {
          console.log(`✅ Successfully fetched ${contents.length} sections with user token`);
        }
      } catch (err) {
        console.warn('⚠️ User token fetch failed:', err);
        contents = null;
      }
    }

    // If user token failed or not available, try with course token
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      if (courseToken) {
        try {
          console.log('🔐 Attempting fetch with course token...');
          contents = await getCourseContents(courseIdNum, courseToken);
          
          if (Array.isArray(contents) && contents.length > 0) {
            console.log(`✅ Successfully fetched ${contents.length} sections with course token`);
          }
        } catch (err) {
          console.error('❌ Course token fetch failed:', err);
          contents = null;
        }
      }
    }

    // If both failed, try without token (for public courses)
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      try {
        console.log('🔐 Attempting fetch without token (public course)...');
        contents = await getCourseContents(courseIdNum);
        
        if (Array.isArray(contents) && contents.length > 0) {
          console.log(`✅ Successfully fetched ${contents.length} sections without token`);
        }
      } catch (err) {
        console.error('❌ Public fetch failed:', err);
      }
    }

    // Detailed logging of fetched content
    if (Array.isArray(contents)) {
      console.log(`\n📊 Course Content Summary:`);
      contents.forEach((section, idx) => {
        console.log(`  Section ${idx + 1}: "${section.name}"`);
        if (section.modules && Array.isArray(section.modules)) {
          console.log(`    📦 Modules: ${section.modules.length}`);
          section.modules.forEach((mod: any) => {
            console.log(`      - [${mod.modname}] "${mod.name}"`);
            console.log(`        📍 URL: ${mod.url ? '✓ present' : '✗ missing'}`);
            console.log(`        📄 Contents: ${mod.contents?.length || 0} files`);
            if (mod.contents && Array.isArray(mod.contents)) {
              mod.contents.forEach((file: any) => {
                console.log(`          📎 ${file.filename} (${file.filesize || 0} bytes)`);
              });
            }
          });
        }
      });
    }

    return NextResponse.json({
      ok: true,
      courseId: courseIdNum,
      sections: contents || [],
      totalSections: Array.isArray(contents) ? contents.length : 0,
      totalModules: Array.isArray(contents) 
        ? contents.reduce((sum: number, s: any) => sum + (s.modules?.length || 0), 0)
        : 0,
    });

  } catch (error) {
    console.error('❌ [Course Resources API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course resources', details: String(error) },
      { status: 500 }
    );
  }
}
