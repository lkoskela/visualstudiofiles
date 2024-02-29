import { existsSync, readFileSync, statSync } from 'fs'
import path, { dirname, basename, extname } from 'path'

export const isFile = (filePath: string): boolean => existsSync(filePath) && statSync(filePath).isFile()


type VisualStudioProject = {
    name: string,
    path: string,
    guid: string,
    type: string,
    dependencies: Array<{ name: string, version: string }>,
}

type VisualStudioSolutionHeader = {
    fileFormat: string,
    majorVersion: string,
    fullVersion: string,
    minimumVersion: string,
}

type VisualStudioSolution = VisualStudioSolutionHeader & {
    path: string,
    projects: VisualStudioProject[],
}

const fileContents = (pathOrContents: string): string => {
    if (isFile(pathOrContents)) {
        return readFileSync(pathOrContents, 'utf8').toString()
    }
    return pathOrContents
}

const extractLineMatch = (lines: string[], regex: RegExp): RegExpMatchArray|null => {
    const matches: Array<RegExpMatchArray|null> = lines.map(line => line.match(regex))
    return matches.find(match => !!match) || null
}

const parseSolutionFileHeader = (lines: string[]): VisualStudioSolutionHeader => {
    const majorVersion = extractLineMatch(lines, /^# Visual Studio Version\s+(.+?)$/)?.[1] || 'unknown'
    const fullVersion = extractLineMatch(lines, /^VisualStudioVersion\s*=\s*(.+?)$/)?.[1] || 'unknown'
    const minimumVersion = extractLineMatch(lines, /^MinimumVisualStudioVersion\s*=\s*(.+?)$/)?.[1] || 'unknown'
    const fileFormat = extractLineMatch(lines, /^Microsoft Visual Studio Solution File, Format Version\s*=\s*(.+?)$/)?.[1] || 'unknown'
    return {
        fileFormat,
        majorVersion,
        fullVersion,
        minimumVersion,
    }
}

const parseSolutionFileBody = (solutionFilePath: string|undefined, content: string): VisualStudioProject[] => {
    const extractProjects = (contents: string): Array<{ name: string, path: string }> => {
        const matches = [...contents.matchAll(/^Project\("\{.+?\}"\) = "(.+?)", "(.+?)", "\{.+?\}"/mg)]
        return matches.map(match => ({ name: match[1], path: match[2].replace(/\\/g, '/') }))
    }

    const refs = extractProjects(content).map(ref => ({ name: ref.name, path: solutionFilePath ? path.join(dirname(solutionFilePath), ref.path) : ref.path }))
    const filteredRefs = refs.filter(ref => !ref.path.endsWith('.vdproj'))
    const projects: VisualStudioProject[] = filteredRefs.map(ref => parseVisualStudioProjectFile(ref.path))
    return projects
}

const parseSolutionFileContent = (filePath: string, content: string): VisualStudioSolution => {
    content = content.replace(/\r\n/g, '\n')
    const bodyStartIndex = content.match(/(.*?)^Project/m)?.index || 0
    const globalStartIndex = content.match(/(.*?)^Global/m)?.index || 0
    if (filePath !== '' && extname(filePath) !== '.sln') throw new Error(`Not a valid Visual Studio solution file name: ${filePath}`)
    if (bodyStartIndex === 0 && globalStartIndex === 0) throw new Error(`Not a valid Visual Studio solution file: ${filePath}`)
    const headerSegment = content.slice(0, bodyStartIndex)
    const header = parseSolutionFileHeader(headerSegment.split('\n'))
    const bodySegment = content.slice(bodyStartIndex)
    const projects = parseSolutionFileBody(filePath, bodySegment)
    return { ...header, path: filePath, projects }
}

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

export const parseVisualStudioSolutionFile = (pathOrContents: string): VisualStudioSolution => {
    const path = isFile(pathOrContents) ? pathOrContents : ''
    const content = fileContents(pathOrContents)
    return parseSolutionFileContent(path, content)
}

export const parseVisualStudioProjectFile = (pathOrContents: string): VisualStudioProject => {
    const projectFilePath = isFile(pathOrContents) ? pathOrContents : ''
    if (projectFilePath !== '' && !['.csproj', '.fsproj'].includes(extname(projectFilePath))) throw new Error(`Not a valid Visual Studio project file name: ${projectFilePath}`)
    const content = fileContents(pathOrContents)
    return parseProjectFileContent(projectFilePath, content)
}
