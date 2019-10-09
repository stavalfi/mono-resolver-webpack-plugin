const { isModule, findModuleLocation } = require('./utils')
const MonoResolverPluginName = 'MonoResolverPlugin'

module.exports = class MonoResolverPlugin {
  constructor(options = {}) {
    this.source = 'resolve'
    this.target = 'resolve'
    this.ignoreModules = options.ignoreModules || []
  }

  apply(resolver) {
    const { ignoreModules, source, target } = this
    const targetPlugin = resolver.ensureHook(target)
    resolver.getHook(source).tapAsync(MonoResolverPluginName, (request, context, callback) => {
      const moduleName = request.request
      if (!isModule(moduleName) || ignoreModules.some(ignoredModuleName => moduleName.includes(ignoredModuleName))) {
        return callback()
      }

      context.resolvedModules = {}
      context.sourceIssuers = {}

      return (
        findModuleLocation({
          moduleName,
          searchFromPath: request.path,
          context,
        })
          .then(moduleLocation => {
            const newRequest = { ...request, request: moduleLocation }
            const resolvingLog = `webpack will find the module: "${moduleName}" in: ${newRequest.request}`
            console.log(resolvingLog)
            return resolver.doResolve(targetPlugin, nextRequest, resolvingLog, context, callback)
          })
          // if we can't resolve a module, we let webpack resolve it.
          .catch(() => callback())
      )
    })
  }
}
