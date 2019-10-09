import { findActualModuleLocation } from './utils'

describe('Simple matches', () => {
  it('1', async () => {
    const moduleName = 'react'
    const context = { sourceIssuers: {}, resolvedModules: {} }
    const actualModuleLocation = await findActualModuleLocation({
      moduleName,
      moduleVersion: '1.0.0',
      modulePackageJsonPath: `/${moduleName}/package.json`,
      moduleLocation: `/${moduleName}/index.js`,
      issuerPackageJsonPath: '/issuer/package.json',
      searchFromPath: '/issuer/file1.js',
      context,
    })

    expect(actualModuleLocation).toEqual(`/${moduleName}/index.js`)
    expect(context).toEqual({
      resolvedModules: {
        [moduleName]: {
          ['/issuer/package.json']: {
            moduleVersion: '1.0.0',
            moduleLocation: `/${moduleName}/index.js`,
            modulePackageJsonPath: `/${moduleName}/package.json`,
          },
        },
      },
      sourceIssuers: {
        [`/${moduleName}/package.json`]: '/issuer/package.json',
      },
    })
  })
})

