import { basename, extname } from 'path'

import { VisualStudioProject } from './types'
import { isFile, fileContents } from './utils'

const parseProjectFileContent = (filePath: string, content: string): VisualStudioProject => {
    const packageRefs = [...content.matchAll(/<PackageReference Include="(.+?)" Version="(.+?)"/g)]
    return {
        name: basename(filePath, extname(filePath)),
        path: filePath,
        type: '',
        guid: '',
        dependencies: packageRefs.map(ref => ({ name: ref[1], version: ref[2] }))
    }
}

export const parseVisualStudioProjectFile = (pathOrContents: string): VisualStudioProject => {
    const projectFilePath = isFile(pathOrContents) ? pathOrContents : ''
    if (projectFilePath !== '' && !['.csproj', '.fsproj', '.vbproj'].includes(extname(projectFilePath))) throw new Error(`Not a valid Visual Studio project file name: ${projectFilePath}`)
    const content = fileContents(pathOrContents)
    return parseProjectFileContent(projectFilePath, content)
}
