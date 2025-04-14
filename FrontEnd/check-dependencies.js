// Dependency Analyzer
// This script reads a package.json file, extracts all dependencies,
// and fetches additional information from npmjs.com for each dependency
// It can also analyze sub-dependencies and identify version conflicts

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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

// Function to get detailed dependency tree using npm list
async function getDependencyTree(depth = 10) {
  try {
    console.log(`Getting dependency tree (depth: ${depth})...`);
    const { stdout } = await execPromise(`npm list --all --json --depth=${depth}`);
    return JSON.parse(stdout);
  } catch (error) {
    // npm list might exit with code 1 if there are missing deps, but still provide output
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (e) {
        console.error(`Error parsing npm list output: ${e.message}`);
      }
    }
    console.error(`Error getting dependency tree: ${error.message}`);
    return { dependencies: {} };
  }
}

// Function to analyze the dependency tree for version conflicts
function findVersionConflicts(dependencyTree) {
  const dependencyVersions = new Map();
  const conflicts = [];

  // Recursive function to traverse the dependency tree
  function traverse(node, path = []) {
    if (!node || !node.dependencies) return;
    
    const deps = Object.entries(node.dependencies);
    for (const [name, info] of deps) {
      if (!info.version) continue;
      
      const currentPath = [...path, name];
      const key = name;
      
      if (!dependencyVersions.has(key)) {
        dependencyVersions.set(key, [{ 
          version: info.version, 
          path: currentPath.join(' > '),
          requiredBy: path[path.length - 1] || 'root' 
        }]);
      } else {
        const versions = dependencyVersions.get(key);
        const existingVersion = versions.find(v => v.version === info.version);
        
        if (!existingVersion) {
          versions.push({ 
            version: info.version, 
            path: currentPath.join(' > '),
            requiredBy: path[path.length - 1] || 'root'
          });
          
          // This is a conflict because we have different versions of the same package
          if (versions.length > 1) {
            const conflict = {
              package: name,
              versions: versions.map(v => ({
                version: v.version,
                path: v.path,
                requiredBy: v.requiredBy
              }))
            };
            
            // Check if this conflict is already in our list
            const existingConflict = conflicts.find(c => c.package === name);
            if (existingConflict) {
              // Update the existing conflict
              existingConflict.versions = conflict.versions;
            } else {
              conflicts.push(conflict);
            }
          }
        }
      }
      
      // Continue traversing
      traverse(info, currentPath);
    }
  }
  
  traverse(dependencyTree);
  return { conflicts, dependencyVersions: Array.from(dependencyVersions.entries()) };
}

// Main function to analyze dependencies
async function analyzeDependencies(options = {}) {
  try {
    // Get options
    const includeWeb = options.includeWeb !== false;
    const includeTree = options.includeTree !== false;
    const depth = options.depth || 10;
    
    // Read dependencies from package.json
    const dependencies = await readPackageJson();
    
    // Create an array of dependency names and versions
    const dependencyEntries = Object.entries(dependencies).map(([name, version]) => ({
      name,
      version
    }));
    
    console.log(`Found ${dependencyEntries.length} dependencies in package.json`);
    
    let dependencyResults = [];
    
    // Fetch additional data for each dependency if enabled
    if (includeWeb) {
      // Process dependencies sequentially to avoid overwhelming the server
      for (const dep of dependencyEntries) {
        console.log(`Processing ${dep.name}...`);
        const data = await fetchDependencyData(dep.name);
        data.version = dep.version; // Add version from package.json
        dependencyResults.push(data);
        
        // Add a small delay to be nice to the npm server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      dependencyResults = dependencyEntries;
    }
    
    // Get the detailed dependency tree if enabled
    let conflicts = [];
    let dependencyVersionsMap = [];
    
    if (includeTree) {
      const dependencyTree = await getDependencyTree(depth);
      const analysisResult = findVersionConflicts(dependencyTree);
      conflicts = analysisResult.conflicts;
      dependencyVersionsMap = analysisResult.dependencyVersions;
      
      console.log(`Found ${conflicts.length} dependencies with version conflicts`);
    }
    
    // Create the final JSON result
    const result = {
      totalDependencies: dependencyResults.length,
      analyzedAt: new Date().toISOString(),
      dependencies: dependencyResults,
      versionConflicts: conflicts,
      conflictsCount: conflicts.length
    };
    
    // Save the result to a file
    const outputPath = path.join(process.cwd(), 'dependency-analysis.json');
    await fs.promises.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf8');
    
    // Also save conflicts to a separate file for easier viewing
    if (conflicts.length > 0) {
      const conflictsPath = path.join(process.cwd(), 'dependency-conflicts.json');
      await fs.promises.writeFile(conflictsPath, JSON.stringify({ 
        analyzedAt: new Date().toISOString(),
        conflicts
      }, null, 2), 'utf8');
      console.log(`Conflicts saved to ${conflictsPath}`);
    }
    
    console.log(`Analysis complete! Results saved to ${outputPath}`);
    return result;
  } catch (error) {
    console.error(`Error during analysis: ${error.message}`);
    return { error: error.message };
  }
}

// Execute the analysis
analyzeDependencies({
  includeWeb: true,   // Set to false to skip web scraping (faster)
  includeTree: true,  // Set to false to skip dependency tree analysis
  depth: 10           // Maximum depth for dependency tree analysis
})
  .then(result => {
    // Output a summary to the console
    console.log(`\nAnalysis summary:`);
    console.log(`- Total direct dependencies: ${result.totalDependencies}`);
    
    if (result.dependencies && result.dependencies.some(dep => dep.error)) {
      // Count dependencies with errors
      const errorsCount = result.dependencies.filter(dep => dep.error).length;
      console.log(`- Dependencies with errors: ${errorsCount}`);
    }
    
    if (result.dependencies && result.dependencies.some(dep => dep.dependedBy)) {
      // Count total "depended by" relationships
      const totalDependedBy = result.dependencies.reduce(
        (total, dep) => total + (dep.dependedBy ? dep.dependedBy.length : 0), 
        0
      );
      console.log(`- Total "depended by" relationships: ${totalDependedBy}`);
    }
    
    // Output version conflicts
    if (result.versionConflicts && result.versionConflicts.length > 0) {
      console.log(`\n⚠️ Found ${result.versionConflicts.length} dependencies with version conflicts:`);
      result.versionConflicts.forEach(conflict => {
        console.log(`\n  • ${conflict.package}:`);
        conflict.versions.forEach(v => {
          console.log(`    - ${v.version} (required by ${v.requiredBy})`);
        });
      });
      console.log(`\nSee dependency-conflicts.json for full details.`);
    } else {
      console.log(`\n✅ No version conflicts detected!`);
    }
  })
  .catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });