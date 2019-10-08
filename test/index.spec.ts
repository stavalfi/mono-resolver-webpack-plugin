const { ResolverFactory } = require('enhanced-resolve')
const MonoResolverWebpackPlugin = require('../src')
const path = require('path')

describe('Simple matches', () => {
  const monoProject1Path = path.resolve(__dirname, 'mono-project-1')

  it(
    '1',
    resolveAndCheck(monoProject1Path, 'module1', path.resolve(monoProject1Path, 'node_modules', 'module1', 'index.js')),
  )
  it(
    '2',
    resolveAndCheck(
      path.resolve(monoProject1Path, 'packages', 'package1', 'index.js'),
      'module1',
      path.resolve(monoProject1Path, 'node_modules', 'module1', 'index.js'),
    ),
  )
  it(
    '3',
    resolveAndCheck(
      path.resolve(monoProject1Path, 'packages', 'package2', 'index.js'),
      'module1',
      path.resolve(monoProject1Path, 'packages', 'package2', 'node_modules', 'module1', 'index.js'),
    ),
  )
})

function resolveAndCheck(resolveFromPath: string, pathToResolve: string, expectedPath: string, options = {}) {
  return (done: (error?: any) => void) => {
    const resolver = ResolverFactory.createResolver({
      fileSystem: require('fs'),
      plugins: [new MonoResolverWebpackPlugin(options)],
    })
    resolver.resolve({}, resolveFromPath, pathToResolve, {}, (err: any, result: string) => {
      if (err) {
        return done(err)
      }
      expect(result).toEqual(path.resolve(__dirname, expectedPath))
      done()
    })
  }
}
