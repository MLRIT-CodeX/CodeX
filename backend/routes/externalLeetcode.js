// routes/externalLeetcode.js
const express = require('express');
const axios = require('axios');

const router = express.Router();
const BASE_URL = 'https://leetcode-api-pied.vercel.app';

router.get('/leetcode/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // 1) profile & submissions
    const profileRes = await axios.get(`${BASE_URL}/user/${username}`);
    const ac = profileRes.data?.submitStats?.acSubmissionNum || [];
    const all = ac.find((d) => d.difficulty === 'All');

    const totalSolved = all?.count ?? 0;

    // 2) contest rating
    let rating = null;
    try {
      const contestRes = await axios.get(`${BASE_URL}/user/${username}/contests`);
      const rawRating = contestRes.data?.userContestRanking?.rating;
      rating = rawRating != null ? Math.round(rawRating) : null;
    } catch (e) {
      // If contests endpoint fails, we still return solved count
      console.log('LeetCode contests fetch failed:', e.message);
    }

    return res.json({
      username,
      totalSolved,
      rating,
    });
  } catch (err) {
    console.error('LeetCode proxy error:', err.message);
    return res.status(502).json({
      error: 'Failed to fetch LeetCode stats',
    });
  }
});

module.exports = router;
