const { findModuleLocation } = require('../src/utils')

export type Context = {
  resolvedModules: {
    [moduleName: string]: {
      [issuerPackageJsonPath: string]: {
        moduleVersion: string
        moduleLocation: string
        modulePackageJsonPath: string
      }
    }
  }
  sourceIssuers: {
    [modulePackageJsonPath: string]: string
  }
}

export type FindClosestPackageJsonPath = (args: { moduleLocation: string }) => Promise<string>
export type FindModuleProps = (args: {
  moduleName: string
  searchFromPath: string
}) => Promise<{
  moduleName: string
  moduleLocation: string
  modulePackageJsonPath: string
  moduleVersion: string
}>

export type FindModuleLocation = (
  args1: { moduleName: string; searchFromPath: string; context: Context },
  args2: {
    findClosestPackageJsonPath: FindClosestPackageJsonPath
    findModuleProps: FindModuleProps
  },
) => Promise<string>

export type FindActualModuleLocation = (args: {
  moduleName: string
  moduleVersion: string
  modulePackageJsonPath: string
  moduleLocation: string
  issuerPackageJsonPath: string
  searchFromPath: string
  context: Context
}) => Promise<string>

export const findActualModuleLocation: FindActualModuleLocation = ({
  moduleName,
  moduleVersion,
  modulePackageJsonPath,
  moduleLocation,
  issuerPackageJsonPath,
  searchFromPath,
  context,
}) => {
  const findClosestPackageJsonPath: FindClosestPackageJsonPath = () => Promise.resolve(issuerPackageJsonPath)
  const findModuleProps: FindModuleProps = () =>
    Promise.resolve({
      moduleName,
      moduleLocation,
      modulePackageJsonPath,
      moduleVersion,
    })

  return findModuleLocation(
    {
      moduleName,
      searchFromPath,
      context,
    },
    {
      findClosestPackageJsonPath,
      findModuleProps,
    },
  )
}
