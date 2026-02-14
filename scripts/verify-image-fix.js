
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const empresaPath = path.join(__dirname, '../src/pages/Empresa.tsx');

try {
  const content = fs.readFileSync(empresaPath, 'utf8');
  
  // Check for OptimizedImage import
  if (!content.includes("import OptimizedImage from '../components/OptimizedImage';")) {
    console.error('FAIL: OptimizedImage not imported in Empresa.tsx');
    process.exit(1);
  }

  // Check for usage of page.featured_image
  if (!content.includes('src={page.featured_image}')) {
    console.error('FAIL: page.featured_image not used in Empresa.tsx');
    process.exit(1);
  }

  // Check for priority prop (LCP optimization)
  if (!content.includes('priority={true}')) {
    console.warn('WARNING: priority={true} missing for featured image');
  }

  console.log('PASS: Empresa.tsx contains the necessary image rendering logic.');
  process.exit(0);

} catch (error) {
  console.error('Error reading file:', error);
  process.exit(1);
}
