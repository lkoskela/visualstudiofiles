import path, { dirname, basename, extname } from 'path'

import { VisualStudioProject, VisualStudioSolution, VisualStudioSolutionHeader } from './types'
import { isFile, fileContents } from './utils'
import { parseVisualStudioProjectFile } from './project'

const projectTypes = require('./codegen/project-types.json')

const extractLineMatch = (lines: string[], regex: RegExp): RegExpMatchArray|null => {
    const matches: Array<RegExpMatchArray|null> = lines.map(line => line.match(regex))
    return matches.find(match => !!match) || null
}

const parseSolutionFileHeader = (lines: string[]): VisualStudioSolutionHeader => {
    const majorVersion = extractLineMatch(lines, /^# Visual Studio \.NET\s+(.+?)$/)?.[1]
                         || extractLineMatch(lines, /^# Visual Studio(?: Version)?\s+(.+?)$/)?.[1]
                         || 'unknown'
    const fullVersion = extractLineMatch(lines, /^VisualStudioVersion\s*=\s*(.+?)$/)?.[1] || 'unknown'
    const minimumVersion = extractLineMatch(lines, /^MinimumVisualStudioVersion\s*=\s*(.+?)$/)?.[1] || 'unknown'
    const fileFormat = extractLineMatch(lines, /^Microsoft Visual Studio Solution File, Format Version\s*(.+?)$/)?.[1] || 'unknown'
    return { fileFormat, majorVersion, fullVersion, minimumVersion }
}

const mapProjectType = (guid: string): string => {
    return projectTypes[guid] || guid
}

const parseSolutionFileBody = (solutionFilePath: string|undefined, content: string): VisualStudioProject[] => {
    const extractProjects = (contents: string): Array<{ name: string, path: string, type: string, guid: string }> => {
        const matches = [...contents.matchAll(/^Project\("\{(.+?)\}"\) = "(.+?)", "(.+?)", "\{(.+?)\}"/mg)]
        return matches.map(match => ({ type: match[1], name: match[2], path: match[3].replace(/\\/g, '/'), guid: match[4] }))
    }

    const refs = extractProjects(content).map(ref => ({
        ...ref,
        path: solutionFilePath ? path.join(dirname(solutionFilePath), ref.path) : ref.path
    }))
    const filteredRefs = refs.filter(ref => !ref.path.endsWith('.vdproj'))
    const projects: VisualStudioProject[] = filteredRefs.map(ref => {
        const project = parseVisualStudioProjectFile(ref.path)
        return { ...project, ...ref }
    })
    return projects.map(project => ({ ...project, type: mapProjectType(project.type) }))
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

export const parseVisualStudioSolutionFile = (pathOrContents: string): VisualStudioSolution => {
    const path = isFile(pathOrContents) ? pathOrContents : ''
    const content = fileContents(pathOrContents)
    return parseSolutionFileContent(path, content)
}
