import { promises as fs } from 'fs';
import path from 'path';
import { generateUserConfirmationEmailStandalone, generateAdminNotificationEmailStandalone } from './standalone-templates';
import {
  createMockTeam,
  createMockUserEmailData,
  createMockAdminEmailData,
  MOCK_SCENARIOS,
  type MockScenario,
} from './mock-data';

/**
 * Generates HTML preview files for email templates
 */
export class EmailPreviewGenerator {
  private outputDir: string;

  constructor(outputDir: string = 'temp/emails') {
    this.outputDir = outputDir;
  }

  /**
   * Ensures output directory exists
   */
  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    }
    catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generates a single user email preview
   */
  async generateUserPreview(scenario: MockScenario): Promise<string> {
    const mockTeam = createMockTeam(scenario);
    const mockData = createMockUserEmailData(scenario);

    const html = generateUserConfirmationEmailStandalone({
      players: mockTeam,
      data: mockData,
    });

    const filename = `preview-user-${scenario}-team.html`;
    const filepath = path.join(this.outputDir, filename);

    await this.ensureOutputDir();
    await fs.writeFile(filepath, html, 'utf8');

    return filepath;
  }

  /**
   * Generates a single admin email preview
   */
  async generateAdminPreview(scenario: MockScenario): Promise<string> {
    const mockTeam = createMockTeam(scenario);
    const mockData = createMockAdminEmailData(scenario);

    const html = generateAdminNotificationEmailStandalone({
      players: mockTeam,
      data: mockData,
    });

    const filename = `preview-admin-${scenario}-team.html`;
    const filepath = path.join(this.outputDir, filename);

    await this.ensureOutputDir();
    await fs.writeFile(filepath, html, 'utf8');

    return filepath;
  }

  /**
   * Generates all email previews for all scenarios
   */
  async generateAllPreviews(): Promise<{ userPreviews: string[]; adminPreviews: string[] }> {
    const userPreviews: string[] = [];
    const adminPreviews: string[] = [];

    for (const scenario of Object.keys(MOCK_SCENARIOS) as MockScenario[]) {
      console.log(`Generating previews for ${MOCK_SCENARIOS[scenario].name}...`);

      const userFile = await this.generateUserPreview(scenario);
      const adminFile = await this.generateAdminPreview(scenario);

      userPreviews.push(userFile);
      adminPreviews.push(adminFile);

      console.log(`✅ Generated: ${path.basename(userFile)}`);
      console.log(`✅ Generated: ${path.basename(adminFile)}`);
    }

    return { userPreviews, adminPreviews };
  }

  /**
   * Generates a summary index HTML file
   */
  async generateIndexFile(): Promise<string> {
    const scenarios = Object.entries(MOCK_SCENARIOS);

    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Preview Index - League of Our Own</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #0b0c3d;
            text-align: center;
            margin-bottom: 30px;
        }
        .scenario {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            background-color: #f8f9fa;
        }
        .scenario h2 {
            color: #0b0c3d;
            margin-bottom: 10px;
        }
        .scenario p {
            color: #666;
            margin-bottom: 15px;
        }
        .email-links {
            display: flex;
            gap: 15px;
        }
        .email-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #0b0c3d;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
        }
        .email-link:hover {
            background-color: #1a1d5a;
        }
        .admin-link {
            background-color: #dc3545;
        }
        .admin-link:hover {
            background-color: #c82333;
        }
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Email Preview Index</h1>
        <p style="text-align: center; color: #666; margin-bottom: 40px;">
            Preview generated email templates with mock data - no team submission required!
        </p>
        
        ${scenarios.map(([key, scenario]) => `
        <div class="scenario">
            <h2>${scenario.name}</h2>
            <p>${scenario.description}</p>
            <div class="email-links">
                <a href="preview-user-${key}-team.html" class="email-link" target="_blank">
                    👤 User Email
                </a>
                <a href="preview-admin-${key}-team.html" class="email-link admin-link" target="_blank">
                    🔐 Admin Email
                </a>
            </div>
        </div>
        `).join('')}
        
        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`.trim();

    const filepath = path.join(this.outputDir, 'index.html');
    await this.ensureOutputDir();
    await fs.writeFile(filepath, indexHtml, 'utf8');

    return filepath;
  }
}

/**
 * Convenience function to generate all previews
 */
export async function generateAllEmailPreviews(outputDir?: string): Promise<void> {
  const generator = new EmailPreviewGenerator(outputDir);

  console.log('🚀 Generating email previews...\n');

  const { userPreviews, adminPreviews } = await generator.generateAllPreviews();
  const indexFile = await generator.generateIndexFile();

  console.log('\n✨ Preview generation complete!');
  console.log(`📁 Output directory: ${generator['outputDir']}`);
  console.log(`🎯 Open ${path.basename(indexFile)} to view all previews`);
  console.log(`\n📧 Generated ${userPreviews.length} user email previews`);
  console.log(`🔐 Generated ${adminPreviews.length} admin email previews`);
}
