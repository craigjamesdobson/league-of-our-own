# Deployment

Production deployment guide for this project.

## Deployment Overview

This project is deployed as a static SPA (Single Page Application).

**Build Output:** `.output/public/`
**Build Command:** `pnpm build`
**Deployment Strategy:** [Configure for your platform - Vercel/Netlify/etc.]

## Prerequisites

Before deploying:

1. All tests passing: `pnpm test`
2. No TypeScript errors: `pnpm typecheck`
3. No linting issues: `pnpm lint`
4. Production build succeeds: `pnpm build`

## Environment Variables

Production requires different variables than development.

### Required for Production

```env
# Supabase Configuration (Production Project)
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_KEY=your_production_anon_key

# Application
ACTIVE_SEASON=2024-25
SITE_URL=https://yourdomain.com

# Security
TURNSTILE_SITE_KEY=your_production_turnstile_key
NODE_ENV=production
```

**DO NOT** commit `.env` files with secrets. Use platform-specific secret management:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment
- **Your Hosting**: Use environment variable injection

### Getting Production Supabase Keys

1. Log in to [supabase.com](https://supabase.com)
2. Select your **production** project
3. Settings → API → Copy production credentials
4. **Never use development keys in production**

## Building for Production

```bash
# Build production bundle
pnpm build

# Test the production build locally
pnpm preview
```

Visit `http://localhost:3000` to verify the production build works correctly.

## Deployment Platforms

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Project Settings
3. Vercel auto-deploys on push to main

**Configuration:**
- Framework: Nuxt
- Build Command: `pnpm build`
- Output Directory: `.output/public`

### Netlify

1. Connect GitHub repository
2. Configure build settings:
   - Build command: `pnpm build`
   - Publish directory: `.output/public`
3. Add environment variables in Site Settings
4. Deploy

### Other Platforms

For other hosting:

1. Build locally: `pnpm build`
2. Deploy `.output/public/` directory
3. Ensure environment variables are configured
4. Test after deployment

## Post-Deployment Verification

After deploying:

1. **Check Application Loads**
   - Visit your domain
   - No 404 errors
   - No console errors (F12 → Console)

2. **Test Key Features**
   - Login with test account
   - Load a page that requires data
   - Verify Supabase is connected

3. **Monitor Errors**
   - Check application logs
   - Monitor browser console for errors
   - Verify no TypeScript errors in production

## Rollback

If deployment has issues:

1. **Revert Last Deployment**
   - Vercel: Click "Rollback" on previous deployment
   - Netlify: Deploy from previous working commit
   - Manual: Deploy previous version

2. **Check Deployment Logs**
   - Look for build errors
   - Check environment variables are set
   - Verify database connectivity

## Database Schema Changes

For major schema changes:

1. **Deploy Code First**
   - Deploy application with schema migration code
   - Application should handle old/new schema gracefully

2. **Run Migrations**
   - Use Supabase dashboard or migration tools
   - Test with production data first if possible

3. **Verify**
   - Check application still works
   - Monitor for errors

## Performance Monitoring

After deployment, monitor:

- **Page Load Time**: Should be <2 seconds
- **API Response Time**: Supabase queries should be fast
- **Error Rate**: Monitor for exceptions
- **User Experience**: Test on slow networks (Chrome DevTools throttling)

## Troubleshooting Deployment

### Build Fails on Platform

**Check:**
1. Node version matches (typically 18+)
2. All environment variables set
3. Dependencies installable (`pnpm install`)
4. No git errors in build logs

### Application Loads but Shows Errors

**Check:**
1. Environment variables correct
2. Supabase project accessible
3. CORS configured if needed
4. Check browser console (F12)

### Supabase Connection Fails

**Check:**
1. `SUPABASE_URL` correct
2. `SUPABASE_KEY` valid for production project
3. Row-level security (RLS) policies not blocking
4. Network access allowed

### Blank Page or 404 Errors

**Check:**
1. `.output/public/` contains files
2. Build output deployed correctly
3. Web server routing configured for SPA (serve index.html for all routes)
4. Base path configuration in `nuxt.config.ts`

## See Also

- [Configuration Reference](../reference/configuration.md) - Environment variables
- [Troubleshooting Guide](troubleshooting.md) - Common issues

---

**Last updated:** 2025-11-09
