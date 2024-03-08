import { basename, extname } from 'path'

import { VisualStudioProject } from './types'
import { isFile, fileContents } from './utils'

const extractProjectSdks = (content: string): string[] => {
    return [...content.matchAll(/<Project(?:\s+[a-zA-Z0-9\-_]+=\".*?\")*\s+Sdk="(.+?)"(\s|>)/g)]
        .flatMap(ref => ref[1].split(';'))
        .sort()
}

const extractPackageRefs = (content: string): Array<{ name: string, version: string }> => {
    return [...content.matchAll(/<PackageReference Include="(.+?)" Version="(.+?)"/g)]
        .map(ref => ({ name: ref[1], version: ref[2] }))
        .sort((a, b) => a.name.localeCompare(b.name))
}

const parseProjectFileContent = (filePath: string, content: string): VisualStudioProject => {
    return {
        name: basename(filePath, extname(filePath)),
        path: filePath,
        type: '',
        guid: '',
        sdks: extractProjectSdks(content),
        dependencies: extractPackageRefs(content)
    }
}

export const supportedProjectFileExtensions = ['.csproj', '.fsproj', '.vbproj', '.vcxproj']

export const parseVisualStudioProjectFile = (pathOrContents: string): VisualStudioProject => {
    const projectFilePath = isFile(pathOrContents) ? pathOrContents : ''
    if (projectFilePath !== '' && !supportedProjectFileExtensions.includes(extname(projectFilePath))) throw new Error(`Not a valid Visual Studio project file name: ${projectFilePath}`)
    const content = fileContents(pathOrContents)
    return parseProjectFileContent(projectFilePath, content)
}
