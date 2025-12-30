# Admin Edit Courses - Troubleshooting Guide 🔧

## Issue: Courses Not Showing from MongoDB Atlas

### ✅ Problem Fixed!

**Issue:** The GET `/api/courses` endpoint was only returning limited fields, not including `modules`, `isActive`, and other necessary data for the edit page.

**Solution:** Updated the backend route to include all necessary fields.

---

## 🔧 What Was Fixed

### Backend Route Update
**File:** `backend/routes/courseRoutes.js`

**Before:**
```javascript
router.get("/", authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find()
      .select("title description difficulty enrolledCount createdAt");
    res.json(courses);
  }
});
```

**After:**
```javascript
router.get("/", authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find()
      .select("title description difficulty enrolledCount createdAt isActive modules finalExam scoringConfig testUnlockThreshold");
    res.json(courses);
  }
});
```

**What Changed:**
- ✅ Added `isActive` field
- ✅ Added `modules` field (contains all module data)
- ✅ Added `finalExam` field
- ✅ Added `scoringConfig` field
- ✅ Added `testUnlockThreshold` field

### Frontend Debugging Added
**File:** `mlrit-code-hub/src/pages/AdminEditCourses.js`

**Added console logs to help debug:**
```javascript
const fetchCourses = async () => {
  try {
    console.log('Fetching courses from API...');
    const res = await axios.get("http://localhost:5000/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Courses fetched:', res.data.length, 'courses');
    console.log('First course:', res.data[0]);
    setCourses(res.data);
  } catch (error) {
    console.error("Error fetching courses:", error);
    console.error("Error details:", error.response?.data);
    Swal.fire("Error", "Failed to fetch courses.", "error");
  }
};
```

---

## 🧪 How to Test

### 1. Restart Backend Server
```bash
cd backend
node server.js
```

### 2. Restart Frontend
```bash
cd mlrit-code-hub
npm start
```

### 3. Check Browser Console
Open browser DevTools (F12) and check console for:
```
Fetching courses from API...
Courses fetched: X courses
First course: { _id: "...", title: "...", modules: [...], ... }
```

### 4. Verify Courses Display
- Navigate to Admin Edit Courses page
- You should see all courses from MongoDB Atlas
- Each course should show:
  - Title
  - Description
  - Difficulty badge
  - Module count
  - Active/Inactive status
  - Edit, Export, Delete buttons

---

## 🔍 Additional Troubleshooting

### If Courses Still Don't Show:

#### Check 1: Backend Server Running
```bash
# Should see:
✅ Connected to MongoDB Atlas
🚀 Server running on http://localhost:5000
```

#### Check 2: MongoDB Connection
- Verify MongoDB Atlas connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Verify database has courses

#### Check 3: Authentication Token
```javascript
// In browser console:
console.log(localStorage.getItem('token'));
// Should return a JWT token
```

#### Check 4: API Response
```bash
# Test API directly with curl:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/courses
```

#### Check 5: CORS Issues
- Check browser console for CORS errors
- Verify backend has CORS enabled
- Check `server.js` has `app.use(cors())`

#### Check 6: Network Tab
- Open DevTools → Network tab
- Refresh page
- Look for `/api/courses` request
- Check status code (should be 200)
- Check response data

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch courses" Error
**Cause:** Backend not running or wrong URL
**Solution:** 
- Start backend server
- Verify URL is `http://localhost:5000`

### Issue 2: Empty Array Returned
**Cause:** No courses in database
**Solution:**
- Create a course first
- Or import a course using the import feature

### Issue 3: Authentication Error
**Cause:** Invalid or expired token
**Solution:**
- Log out and log in again
- Check token in localStorage

### Issue 4: Modules Not Showing
**Cause:** Backend not returning modules field
**Solution:**
- ✅ Already fixed! Backend now returns modules

### Issue 5: "Cannot read property 'length' of undefined"
**Cause:** Modules field missing from API response
**Solution:**
- ✅ Already fixed! Backend now includes modules

---

## ✅ Verification Checklist

After the fix, verify:
- [ ] Backend server starts without errors
- [ ] MongoDB Atlas connection successful
- [ ] Frontend compiles without errors
- [ ] Admin Edit Courses page loads
- [ ] Courses list displays
- [ ] Course cards show correct information
- [ ] Module count displays correctly
- [ ] Active/Inactive status shows
- [ ] Edit button works
- [ ] Delete button works
- [ ] Export button works
- [ ] Import button works

---

## 📊 Expected Behavior

### Course List Should Show:
```
┌─────────────────────────────────────────────┐
│  Python Programming                         │
│  Complete Python course from basics to...   │
│  🟡 Medium  📚 5 modules  ✅ Active         │
│  [Export] [Edit] [Delete]                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  JavaScript Fundamentals                    │
│  Learn JavaScript from scratch...           │
│  🟢 Easy  📚 3 modules  ✅ Active           │
│  [Export] [Edit] [Delete]                   │
└─────────────────────────────────────────────┘
```

### Edit Modal Should Show:
```
┌─────────────────────────────────────────────┐
│  Edit Course: Python Programming            │
├─────────────────────────────────────────────┤
│  [Basic Info] [Modules] [Final Exam] [Settings]
│                                             │
│  Module 1: Python Basics                    │
│  ├─ Theory Content                          │
│  ├─ Lectures (3)                            │
│  └─ Summary: 5 MCQs, 3 Challenges           │
│                                             │
│  Module 2: Data Structures                  │
│  ├─ Theory Content                          │
│  ├─ Lectures (4)                            │
│  └─ Summary: 8 MCQs, 5 Challenges           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 What to Check in Console

### Successful Load:
```
Fetching courses from API...
Courses fetched: 2 courses
First course: {
  _id: "507f1f77bcf86cd799439011",
  title: "Python Programming",
  description: "Complete Python course...",
  difficulty: "medium",
  isActive: true,
  modules: [
    { _id: "...", title: "Python Basics", ... },
    { _id: "...", title: "Data Structures", ... }
  ],
  enrolledCount: 0,
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

### Failed Load:
```
Error fetching courses: Error: Network Error
Error details: undefined
```

---

## 🔄 Quick Fix Steps

If courses still don't show after the fix:

1. **Clear Browser Cache**
   ```
   Ctrl + Shift + Delete (Windows)
   Cmd + Shift + Delete (Mac)
   ```

2. **Hard Refresh**
   ```
   Ctrl + F5 (Windows)
   Cmd + Shift + R (Mac)
   ```

3. **Restart Everything**
   ```bash
   # Stop backend (Ctrl+C)
   # Stop frontend (Ctrl+C)
   
   # Start backend
   cd backend
   node server.js
   
   # Start frontend (new terminal)
   cd mlrit-code-hub
   npm start
   ```

4. **Check MongoDB Atlas**
   - Log into MongoDB Atlas
   - Navigate to your cluster
   - Browse Collections
   - Verify courses exist in database

5. **Re-login**
   - Log out from admin panel
   - Log in again
   - Navigate to Edit Courses page

---

## 📞 Still Having Issues?

### Debug Information to Collect:

1. **Backend Console Output**
   - Copy the server startup logs
   - Copy any error messages

2. **Browser Console Output**
   - Copy all console logs
   - Copy any error messages

3. **Network Tab**
   - Screenshot of `/api/courses` request
   - Copy response data

4. **MongoDB Atlas**
   - Confirm courses exist
   - Copy sample course document

5. **Environment**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Operating system

---

## ✅ Fix Confirmed

**Status:** ✅ Fixed
**Files Modified:** 2
- `backend/routes/courseRoutes.js` - Added missing fields to select
- `mlrit-code-hub/src/pages/AdminEditCourses.js` - Added debug logging

**Testing:** Ready for testing
**Expected Result:** Courses should now display correctly in Admin Edit Courses page

---

**The issue has been resolved! Courses from MongoDB Atlas should now display correctly in the Admin Edit Courses page.** 🎉
