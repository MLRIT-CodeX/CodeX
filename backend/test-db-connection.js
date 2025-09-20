const mongoose = require('mongoose');
const Contest = require('./models/Contest');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mlrit-code-hub');
    console.log('✅ Connected to MongoDB');
    
    // Test Contest model
    console.log('Testing Contest model...');
    const contestCount = await Contest.countDocuments();
    console.log(`Total contests in database: ${contestCount}`);
    
    // Test upcoming contests query
    console.log('Testing upcoming contests query...');
    const now = new Date();
    const upcomingContests = await Contest.find({
      startTime: { $gt: now },
    }).sort({ startTime: 1 });
    
    console.log(`Upcoming contests found: ${upcomingContests.length}`);
    
    if (upcomingContests.length > 0) {
      console.log('Sample upcoming contest:');
      console.log(JSON.stringify(upcomingContests[0], null, 2));
    }
    
    await mongoose.disconnect();
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error(error);
  }
}

testDatabaseConnection();
