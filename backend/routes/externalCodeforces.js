// routes/externalCodeforces.js
const express = require('express');
const axios = require('axios');

const router = express.Router();
const BASE_URL = 'https://codeforces.com/api';

// GET /api/external/codeforces/:handle
router.get('/codeforces/:handle', async (req, res) => {
  const { handle } = req.params;

  try {
    // 1) Basic user info (rating, maxRating, etc.)
    const userRes = await axios.get(`${BASE_URL}/user.info`, {
      params: { handles: handle },
    });

    if (userRes.data.status !== 'OK' || !userRes.data.result?.length) {
      return res.status(404).json({ error: 'Codeforces user not found' });
    }

    const user = userRes.data.result[0];
    const rating = user.rating ?? null;
    const maxRating = user.maxRating ?? null;

    // 2) Problems solved count from user.status
    let problemsSolved = null;
    try {
      const statusRes = await axios.get(`${BASE_URL}/user.status`, {
        params: { handle, from: 1, count: 100000 },
      });

      if (statusRes.data.status === 'OK') {
        const subs = statusRes.data.result || [];
        const solvedSet = new Set();

        for (const sub of subs) {
          if (sub.verdict === 'OK' && sub.problem) {
            const p = sub.problem;
            const key = `${p.contestId || 'custom'}-${p.index || p.name}`;
            solvedSet.add(key);
          }
        }

        problemsSolved = solvedSet.size;
      }
    } catch (e) {
      console.log('Codeforces user.status fetch failed:', e.message);
    }

    return res.json({
      handle,
      rating,
      maxRating,
      problemsSolved,
    });
  } catch (err) {
    console.error('Codeforces proxy error:', err.message);
    return res.status(502).json({
      error: 'Failed to fetch Codeforces stats',
    });
  }
});

module.exports = router;