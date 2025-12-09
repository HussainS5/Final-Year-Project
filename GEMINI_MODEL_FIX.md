# Fix: Gemini API Quota Exceeded Error

## The Problem
```
Error: [429 Too Many Requests] You exceeded your current quota
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
limit: 0, model: gemini-2.0-flash-exp
```

**The issue:** `gemini-2.0-flash-exp` is an **experimental model** that requires a **paid plan**. The free tier has a limit of 0 requests for this model.

## Solution

I've updated the code to use `gemini-1.5-flash` which is available on the free tier.

### What Changed

**File:** `backend/routes/resumes.js`
- Changed from: `gemini-2.0-flash-exp`
- Changed to: `gemini-1.5-flash`

### Available Free Tier Models

- ✅ `gemini-1.5-flash` - Fast, free tier available
- ✅ `gemini-1.5-pro` - More capable, free tier available
- ❌ `gemini-2.0-flash-exp` - Experimental, requires paid plan

## Next Steps

1. **Restart your backend server:**
   ```bash
   # Stop current server (Ctrl+C)
   cd backend
   node server.js
   ```

2. **Try uploading a resume again** - It should work now!

## If You Still Get Quota Errors

If you're still getting quota errors with `gemini-1.5-flash`:

1. **Check your API usage:**
   - Visit: https://ai.dev/usage?tab=rate-limit
   - Check your current quota limits

2. **Free Tier Limits:**
   - 15 requests per minute (RPM)
   - 1,500 requests per day (RPD)
   - 1 million tokens per minute

3. **Wait and retry:**
   - The error message shows "Please retry in 46s"
   - Wait for the cooldown period

4. **Upgrade to paid plan:**
   - If you need higher limits
   - Visit: https://ai.google.dev/pricing

## Alternative: Use gemini-1.5-pro

If you want better quality (but slower), you can change to:

```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});
```

This is also available on the free tier but has lower rate limits.

