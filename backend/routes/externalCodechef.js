// routes/externalCodechef.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

const PROFILE_BASE = 'https://www.codechef.com/users';

// GET /api/external/codechef/:handle
router.get('/codechef/:handle', async (req, res) => {
  const { handle } = req.params;

  try {
    const profileUrl = `${PROFILE_BASE}/${handle}`;
    const response = await axios.get(profileUrl, {
      headers: {
        // Helps avoid anti-bot blocking
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
    });

    const html = response.data;   // IMPORTANT FIX
    const $ = cheerio.load(html);

    // --------------------------------------------------
    // 1) RATING
    // --------------------------------------------------
    let rating = null;
    const ratingText = $('.rating-number').first().text().trim();
    if (ratingText) {
      const num = parseInt(ratingText, 10);
      if (!Number.isNaN(num)) rating = num;
    }

    // --------------------------------------------------
    // 2) PROBLEMS SOLVED
    // We look for: "Total Problems Solved: 1104"
    // --------------------------------------------------
    let problemsSolved = null;

    const totalSolvedMatch = html.match(/Total\s+Problems\s+Solved:\s*(\d+)/i);
    if (totalSolvedMatch && totalSolvedMatch[1]) {
      const num = parseInt(totalSolvedMatch[1], 10);
      if (!Number.isNaN(num)) {
        problemsSolved = num;
      }
    }

    return res.json({
      handle,
      rating,
      problemsSolved,
    });

  } catch (err) {
    console.error('CodeChef proxy error:', err.message);
    return res.status(502).json({
      error: 'Failed to fetch CodeChef stats',
    });
  }
});

module.exports = router;
