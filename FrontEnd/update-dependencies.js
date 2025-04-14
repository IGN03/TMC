const fs = require('fs');
const { exec } = require('child_process');
const cheerio = require('cheerio');

// Read the package.json file
const packageJsonPath = './package.json';

// Function to execute shell commands
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`Warning: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

// Main function to update dependencies
async function updateDependencies() {
  try {
    // Read and parse package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Check if dependencies exist
    if (!packageJson.dependencies) {
      console.log('No dependencies found in package.json');
      return;
    }
    
    const dependencies = packageJson.dependencies;
    const dependencyNames = Object.keys(dependencies);
    
    console.log(`Found ${dependencyNames.length} dependencies to check`);
    
    // Process each dependency
    for (const depName of dependencyNames) {
      try {
        console.log(`Checking latest version for ${depName}...`);
        
        // Fetch the npm package page
        const curlCommand = `curl -s https://www.npmjs.com/package/${depName}`;
        const htmlContent = await executeCommand(curlCommand);
        
        // Parse HTML with cheerio to find the version
        const $ = cheerio.load(htmlContent);
        
        // The version is typically in a sidebar element with specific class or attribute
        // This selector may need adjustment based on npm's current HTML structure
        const versionText = $('p:contains("Version")').next('p').text().trim() || 
                            $('span:contains("Version")').next().text().trim() ||
                            $('h3:contains("Version")').next().text().trim();
                            
        if (!versionText) {
          console.log(`Could not find version for ${depName}, skipping...`);
          continue;
        }
        
        // Clean up and extract just the version number
        const versionMatch = versionText.match(/\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?/);
        const latestVersion = versionMatch ? versionMatch[0] : null;
        
        if (latestVersion) {
          const currentVersion = dependencies[depName].replace(/[\^~]/g, '');
          
          // Update the dependency version if different
          if (currentVersion !== latestVersion) {
            console.log(`Updating ${depName} from ${currentVersion} to ${latestVersion}`);
            packageJson.dependencies[depName] = latestVersion;
          } else {
            console.log(`${depName} is already at the latest version (${currentVersion})`);
          }
        } else {
          console.log(`Could not parse version for ${depName}`);
        }
      } catch (depError) {
        console.error(`Error processing dependency ${depName}: ${depError}`);
      }
      
      // Wait a short time between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Successfully updated package.json with latest versions');
    
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

// Run the update function
updateDependencies();