const cosmiconfig = require('cosmiconfig')

async function findModuleLocation(
  { moduleName, searchFromPath, context: { resolvedModules, sourceIssuers } },
  // I pass this function to test it better with mock functions
  { findClosestPackageJsonPath = findClosestPackageJsonPath, findModuleProps = findModuleProps } = {},
) {
  const issuerLocation = await findClosestPackageJsonPath({ moduleLocation: searchFromPath })

  if (!(moduleName in resolvedModules)) {
    resolvedModules[moduleName] = {}
  }

  const sourceIssuerLocation = sourceIssuers[issuerLocation]

  if (!sourceIssuerLocation && issuerLocation.includes('node_modules')) {
    return Promise.reject(`can't resolve the request for module: "${moduleName}" from: "${searchFromPath}" because 
     this plugin don't know from which package it came from. we let webpack resolve it.`)
  }

  const selectedIssuerLocation = sourceIssuerLocation || issuerLocation

  const moduleProps = resolvedModules[moduleName][selectedIssuerLocation]
  if (moduleProps) {
    sourceIssuers[moduleProps.modulePackageJsonPath] = selectedIssuerLocation
    return moduleProps.moduleLocation
  } else {
    const { moduleLocation, modulePackageJsonPath, moduleVersion } = await findModuleProps({
      moduleName,
      searchFromPath: selectedIssuerLocation,
    })
    resolvedModules[moduleName][selectedIssuerLocation] = {
      moduleVersion,
      modulePackageJsonPath,
      moduleLocation,
    }
    sourceIssuers[modulePackageJsonPath] = selectedIssuerLocation
    return moduleLocation
  }
}

async function findModuleProps({ moduleName, searchFromPath }) {
  const moduleLocation = require.resolve(moduleName, { paths: [searchFromPath] })
  const modulePackageJsonPath = await findClosestPackageJsonPath({ moduleLocation })
  const modulePackageJson = require(modulePackageJsonPath)
  const moduleVersion = modulePackageJson.version
  return { moduleName, moduleLocation, modulePackageJsonPath, moduleVersion }
}

async function findClosestPackageJsonPath({ moduleLocation }) {
  const result = await cosmiconfig('version').search(moduleLocation)

  return (
    (result && result.filepath) ||
    Promise.reject(`couldn't find the closest package json from path: "${moduleLocation}"`)
  )
}

function isModule(moduleName) {
  return !moduleName.startsWith('.') && !moduleName.startsWith('/')
}

module.exports = {
  isModule,
  findClosestPackageJsonPath,
  findModuleProps,
  findModuleLocation,
}
