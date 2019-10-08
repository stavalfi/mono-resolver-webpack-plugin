export function fixNpmOrganizationName(npmOrganizationName = '') {
  return typeof npmOrganizationName === 'string' ? `@${npmOrganizationName.replace(/[@\/]/g, '')}/` : ''
}

export function isModule(moduleName) {
  return !moduleName.startsWith('.') && !moduleName.startsWith('/')
}
