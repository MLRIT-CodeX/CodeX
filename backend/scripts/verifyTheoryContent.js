require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

const COURSE_ID = '690c993dcb21cbd98ce292d8';

async function verifyTheoryContent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const course = await Course.findById(COURSE_ID);
    if (!course) {
      console.error(`❌ Course with ID ${COURSE_ID} not found`);
      return;
    }

    console.log(`\n📚 Verifying theory content for: ${course.title}`);
    console.log(`🔗 Course URL: http://localhost:3000/courses/${COURSE_ID}`);
    console.log('='.repeat(80));

    if (course.modules && course.modules.length > 0) {
      course.modules.forEach((module, index) => {
        console.log(`\n📁 Module ${index + 1}: "${module.title}"`);
        console.log(`   🆔 Module ID: ${module._id}`);
        console.log(`   🔗 Theory URL: http://localhost:3000/courses/${COURSE_ID}/module/${module._id}/theory`);
        
        if (module.theory) {
          console.log(`   ✅ Theory content available:`);
          console.log(`      📝 Text content: ${module.theory.textContent ? 'YES' : 'NO'} (${module.theory.textContent?.length || 0} chars)`);
          
          if (module.theory.files) {
            console.log(`      📄 PDF: ${module.theory.files.pdf ? module.theory.files.pdf.name : 'No PDF'}`);
            
            if (module.theory.files.ppt) {
              console.log(`      📊 PPT: ${module.theory.files.ppt.name || 'Unnamed'} (${module.theory.files.ppt.totalSlides || 0} slides)`);
              if (module.theory.files.ppt.slides && module.theory.files.ppt.slides.length > 0) {
                console.log(`         Sample slides: ${module.theory.files.ppt.slides.slice(0, 3).map(s => s.title).join(', ')}...`);
              }
            } else {
              console.log(`      📊 PPT: No presentation`);
            }
            
            console.log(`      📋 DOC: ${module.theory.files.doc ? module.theory.files.doc.name : 'No document'}`);
          } else {
            console.log(`      📁 Files: No additional files`);
          }
        } else {
          console.log(`   ❌ No theory content found`);
        }
      });

      console.log('\n' + '='.repeat(80));
      console.log('🧪 TEST CHECKLIST - Try these scenarios:');
      console.log('\n📱 Frontend Testing:');
      course.modules.forEach((module, index) => {
        console.log(`   ${index + 1}. Visit: http://localhost:3000/courses/${COURSE_ID}/module/${module._id}/theory`);
      });
      
      console.log('\n🎯 Edge Cases to Test:');
      console.log('   ✓ Switch between TEXT, PDF, PPT, and DOC tabs');
      console.log('   ✓ Navigate through PPT slides using Prev/Next buttons');
      console.log('   ✓ Check slide counter (e.g., "Slide 1 / 12")');
      console.log('   ✓ Test fullscreen mode for presentations');
      console.log('   ✓ Verify PDF and DOC download links');
      console.log('   ✓ Check text content formatting (headers, code blocks, lists)');
      console.log('   ✓ Test with disabled tabs (should be enabled for all tabs now)');
      console.log('   ✓ Mobile responsiveness');
      console.log('   ✓ Loading states and error handling');
      
      console.log('\n📋 Content Verification:');
      console.log('   ✓ Module 1: Programming Fundamentals (12 slides)');
      console.log('   ✓ Module 2: Data Structures & Algorithms (15 slides)');
      console.log('   ✓ Module 3: Object-Oriented Programming (18 slides)');
      
      console.log('\n🎨 UI Elements to Check:');
      console.log('   ✓ Tab buttons are properly styled and functional');
      console.log('   ✓ Code blocks have proper syntax highlighting');
      console.log('   ✓ PPT slide navigation controls work');
      console.log('   ✓ Headers and content are properly formatted');
      console.log('   ✓ Download buttons for PDF/DOC files');

    } else {
      console.log('❌ No modules found in the course');
    }

  } catch (error) {
    console.error('❌ Error verifying theory content:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

verifyTheoryContent();