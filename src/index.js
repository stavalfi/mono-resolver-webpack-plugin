const { fromLerna } = require('./get-packages-props')
const { fixNpmOrganizationName, isModule } = require('./utils')

module.exports = class MonoResolverPlugin {
  constructor(options = {}) {
    this.source = 'resolve'
    this.target = 'resolve'
    // when we get packages-folders-names from lerna, every name is `{npmOrganizationName}/{package-name}`.
    // I only need the package-name to find and modify the requests from those folders.
    this.npmOrganizationName = fixNpmOrganizationName(options.npmOrganizationName)
    // if the user's main-package is not a lerna or any other mono-repo manager repo, we need the packages and thier location from the user.
    this.packagesProps = options.packagesProps || []
    this.ignoreModules = options.ignoreModules || []
  }

  apply(resolver) {
    const { npmOrganizationName, packagesProps, ignoreModules, source, target } = this
    const targetPlugin = resolver.ensureHook(target)
    resolver.getHook(source).tapAsync('MonoResolverPlugin', (request, resolveContext, callback) => {
      if (!isModule(request.request) || ignoreModules.some(moduleName => request.request.includes(moduleName))) {
        return callback()
      }

      // try to find packages props from lerna/... mono-repos managers
      return (
        Promise.all([getLernaPackages()])
        // if nothing was found, use what the user gave
          .then(packagesPropsArray => packagesPropsArray.find(Array.isArray) || packagesProps)
          .then(packagesProps =>
            packagesProps.find(packageProps =>
              request.path.includes(packageProps.folderName.replace(npmOrganizationName, '')),
            ),
          )
          .then(requestPackage => {
            if (requestPackage) {
              // if require.resolve throws because module not found, we will run `callback()`
              const absModulePath = require.resolve(request.request, { paths: [requestPackage.location] })
              if (absModulePath) {
                const nextRequest = {
                  ...request,
                  request: absModulePath,
                }
                const log = `webpack will find the module: "${request.request}" in: ${nextRequest.request}`
                console.log(log)
                resolver.doResolve(targetPlugin, nextRequest, log, resolveContext, callback)
              }
            } else {
              return Promise.reject(
                `The module: "${request.request}" and it's not inside node_modules requests
                 the module: "${request.path}", so we let webpack resolve it how he want. 
                 probably he will search it in the package that run the webpack command.`,
              )
            }
          })
          .catch(() => callback())
      )
    })
  }
}
