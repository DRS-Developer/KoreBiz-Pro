const { execSync } = require('child_process');
console.log("Starting npm install...");
try {
  // Try npm.cmd first (Windows batch file, usually works)
  execSync('npm.cmd install', { stdio: 'inherit' });
  console.log("npm install completed successfully.");
} catch (e) {
  console.log("npm.cmd failed or not found, trying 'npm'...");
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log("npm install completed successfully.");
  } catch (e2) {
    console.error("All install attempts failed.");
    console.error(e2.message);
  }
}
