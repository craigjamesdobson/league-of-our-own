#!/usr/bin/env tsx

/**
 * Test script to generate email previews
 * Run with: npx tsx utils/email/preview/test-preview.ts
 */

import { generateAllEmailPreviews } from './generate-previews';

async function main() {
  try {
    await generateAllEmailPreviews();
    console.log('\n🎉 Email previews generated successfully!');
    console.log('📂 Check the temp/emails/ directory for preview files');
    console.log('🌐 Open temp/emails/index.html in your browser to view all previews');
  }
  catch (error) {
    console.error('❌ Error generating email previews:', error);
    process.exit(1);
  }
}

main();
