const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Helper: safe percentage ──
function pct(part, total) {
  if (!total) return '0.0';
  return ((part / total) * 100).toFixed(1);
}

function buildSummary({ users = [], orders = [], products = [], feedbacks = [] }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const receivedAmount = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const dueAmount = totalRevenue - receivedAmount;
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  // Normalize order statuses (fixes "Delivered" vs "Deliverd" type inconsistencies)
  const statusCounts = orders.reduce((acc, o) => {
    const raw = (o.orderStatus || 'Pending').trim().toLowerCase();
    const normalized =
      raw.startsWith('deliv') ? 'Delivered' :
      raw.startsWith('cancel') ? 'Cancelled' :
      raw.startsWith('pend') ? 'Pending' :
      raw.startsWith('dispatch') ? 'Dispatched' :
      raw.charAt(0).toUpperCase() + raw.slice(1);
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {});

  const cancelledCount = statusCounts['Cancelled'] || 0;
  const deliveredCount = statusCounts['Delivered'] || 0;

  const customerUsers = users.filter((u) => (u.role || 'user').toLowerCase() === 'user');

  const topProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5)
    .map((p) => ({
      title: p.title || p.author || 'Untitled',
      salesCount: p.salesCount || 0,
      price: p.price || 0,
      revenue: (p.salesCount || 0) * (p.price || 0),
    }));

  const totalProductRevenue = products.reduce((sum, p) => sum + (p.salesCount || 0) * (p.price || 0), 0);

  // Normalize category names too (e.g. stray test entries)
  const categoryCounts = products.reduce((acc, p) => {
    const cat = (p.genere || 'Other').trim();
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 5), 0) / feedbacks.length).toFixed(1)
    : '0.0';

  const roleCounts = users.reduce((acc, u) => {
    const role = (u.role || 'user').toLowerCase();
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const revenuePerCustomer = customerUsers.length
    ? Math.round(totalRevenue / customerUsers.length)
    : 0;

  return {
    // Core financials
    totalRevenue,
    receivedAmount,
    dueAmount,
    collectionRatePct: pct(receivedAmount, totalRevenue),
    dueRatePct: pct(dueAmount, totalRevenue),
    avgOrderValue,
    revenuePerCustomer,

    // Orders
    totalOrders: orders.length,
    orderStatusCounts: statusCounts,
    cancellationRatePct: pct(cancelledCount, orders.length),
    deliveryRatePct: pct(deliveredCount, orders.length),

    // Customers / users
    totalCustomers: customerUsers.length,
    totalUsers: users.length,
    roleCounts,

    // Products
    totalProducts: products.length,
    topProducts,
    categoryCounts,
    topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
    totalProductRevenue,

    // Feedback
    totalFeedbacks: feedbacks.length,
    avgRating,
  };
}

const REPORT_SYSTEM_INSTRUCTIONS = `You are a senior business intelligence analyst for Furnexa, a furniture e-commerce platform.

You will be given a JSON object of pre-computed metrics (including percentages and rates already calculated for you — do NOT recalculate or invent your own math, use the given numbers exactly as provided).

Your job is not to just restate numbers — it is to INTERPRET them like an experienced analyst would:
- Point out what is healthy vs what is a risk (e.g. a low collection rate is a cash-flow risk; a high cancellation rate is an operations problem).
- Compare related numbers to give context (e.g. "due amount is 44% of total revenue" instead of just stating the due amount alone).
- Call out concentration risk if a small number of products or categories dominate performance.
- Flag data-quality issues if you see inconsistent or placeholder-looking entries (e.g. test categories, malformed statuses) — but only mention this briefly, don't dwell on it.
- Recommendations must be specific, prioritized (most urgent first), and tied directly to a number in the data — never generic advice like "improve marketing."

Write in plain text with clear section headings (no markdown symbols like # or **). Keep language confident, concise, and professional — like a report a CEO would actually read, not a data dump.`;

router.post('/generate-report', async (req, res) => {
  try {
    const { users, orders, products, feedbacks } = req.body;

    if (!orders && !users && !products && !feedbacks) {
      return res.status(400).json({ error: 'No data provided for report generation.' });
    }

    const summary = buildSummary({ users, orders, products, feedbacks });

    const prompt = `${REPORT_SYSTEM_INSTRUCTIONS}

DATA:
${JSON.stringify(summary, null, 2)}

Structure the report with these sections:
1. Executive Summary (2-3 sentences — lead with the single most important takeaway, good or bad)
2. Sales & Revenue (use collectionRatePct and dueRatePct to frame the cash position, not just raw amounts)
3. Customers (relate revenuePerCustomer and role mix to what it means for the business)
4. Product Performance (call out concentration if topProducts/topCategory dominate; use totalProductRevenue for context)
5. Customer Feedback (be honest if the sample size is too small to draw strong conclusions)
6. Recommendations (3-4 bullet points, most urgent first, each referencing a specific number from the data)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ report: response.text, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('AI report generation error:', err);
    res.status(500).json({ error: 'Failed to generate report. Please try again.' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { messages, users, orders, products, feedbacks } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'No message provided.' });
    }

    const summary = buildSummary({ users, orders, products, feedbacks });

    const systemContext = `You are the same senior business intelligence analyst for Furnexa described below, now answering follow-up questions in a chat instead of writing a full report.

${REPORT_SYSTEM_INSTRUCTIONS}

Chat-specific rules:
- Answer ONLY using the DATA below. Never invent numbers.
- If a question isn't answerable from this data, say so plainly instead of guessing.
- Keep answers short and conversational (2-5 sentences) unless the admin explicitly asks for a detailed breakdown.
- Still interpret, don't just recite — e.g. if asked "how's revenue", don't just give the number, say whether that's good news or a concern and why.
- Do not use markdown symbols like # or **.

DATA:
${JSON.stringify(summary, null, 2)}`;

    const contents = [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: 'Understood. Ask me anything about orders, revenue, customers, products, or feedback — I\'ll give you the numbers with context, not just a recitation.' }] },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to get response. Please try again.' });
  }
});

module.exports = router;