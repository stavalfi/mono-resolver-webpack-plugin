const path = require('path')
const cosmiconfig = require('cosmiconfig')
const { getPackages } = require('@lerna/project')
const PackageGraph = require('@lerna/package-graph')

// check if it's lerna mono-repo. if yes, get all the packages props from it.
export function fromLerna() {
  return cosmiconfig('lerna', {
    searchPlaces: ['lerna.json'],
  })
    .search()
    .then(result => {
      if (result) {
        const lernaJsonDirPath = path.dirname(result.filepath)
        return getPackages(lernaJsonDirPath)
          .then(packageNames => new PackageGraph(packageNames))
          .then(graph =>
            Array.from(graph.values()).map(packageProps => ({
              folderName: packageProps.name,
              location: packageProps.location,
            })),
          )
      }
    })
}
