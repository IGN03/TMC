// Dependency Analyzer
// This script reads a package.json file, extracts all dependencies,
// and fetches additional information from npmjs.com for each dependency

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Function to read package.json and extract dependencies
async function readPackageJson(filePath = './package.json') {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const packageJson = JSON.parse(data);
    
    // Combine all dependency types
    const allDependencies = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {},
      ...packageJson.peerDependencies || {}
    };
    
    return allDependencies;
  } catch (error) {
    console.error(`Error reading package.json: ${error.message}`);
    return {};
  }
}

// Function to fetch data from npm for a specific dependency
async function fetchDependencyData(dependencyName) {
  try {
    const url = `https://www.npmjs.com/browse/depended/${dependencyName}`;
    const response = await axios.get(url);
    
    // Parse the HTML using cheerio
    const $ = cheerio.load(response.data);
    
    // Extract packages that depend on this dependency
    // Note: This is a simplification - the actual implementation may need adjustments
    // based on the current structure of the npmjs.com website
    const dependedBy = [];
    
    // Select the elements containing package information
    $('.package-list li').each((i, el) => {
      const packageName = $(el).find('.package-name').text().trim();
      const packageVersion = $(el).find('.package-version').text().trim();
      
      if (packageName) {
        dependedBy.push({
          name: packageName,
          version: packageVersion
        });
      }
    });
    
    return {
      name: dependencyName,
      version: null, // This will be filled in from package.json
      dependedBy
    };
  } catch (error) {
    console.error(`Error fetching data for ${dependencyName}: ${error.message}`);
    return {
      name: dependencyName,
      version: null,
      dependedBy: [],
      error: error.message
    };
  }
}

// Main function to analyze dependencies
async function analyzeDependencies() {
  try {
    // Read dependencies from package.json
    const dependencies = await readPackageJson();
    
    // Create an array of dependency names and versions
    const dependencyEntries = Object.entries(dependencies).map(([name, version]) => ({
      name,
      version
    }));
    
    console.log(`Found ${dependencyEntries.length} dependencies in package.json`);
    
    // Fetch additional data for each dependency
    const dependencyResults = [];
    
    // Process dependencies sequentially to avoid overwhelming the server
    for (const dep of dependencyEntries) {
      console.log(`Processing ${dep.name}...`);
      const data = await fetchDependencyData(dep.name);
      data.version = dep.version; // Add version from package.json
      dependencyResults.push(data);
      
      // Add a small delay to be nice to the npm server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Create the final JSON result
    const result = {
      totalDependencies: dependencyResults.length,
      analyzedAt: new Date().toISOString(),
      dependencies: dependencyResults
    };
    
    // Save the result to a file
    const outputPath = path.join(process.cwd(), 'dependency-analysis.json');
    await fs.promises.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf8');
    
    console.log(`Analysis complete! Results saved to ${outputPath}`);
    return result;
  } catch (error) {
    console.error(`Error during analysis: ${error.message}`);
    return { error: error.message };
  }
}

// Execute the analysis
analyzeDependencies()
  .then(result => {
    // Output a summary to the console
    console.log(`Analysis summary:`);
    console.log(`- Total dependencies analyzed: ${result.totalDependencies}`);
    
    // Count dependencies with errors
    const errorsCount = result.dependencies.filter(dep => dep.error).length;
    console.log(`- Dependencies with errors: ${errorsCount}`);
    
    // Count total "depended by" relationships
    const totalDependedBy = result.dependencies.reduce(
      (total, dep) => total + (dep.dependedBy ? dep.dependedBy.length : 0), 
      0
    );
    console.log(`- Total "depended by" relationships: ${totalDependedBy}`);
  })
  .catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });