export type VisualStudioProject = {
    name: string,
    path: string,
    guid: string,
    type: string,
    dependencies: Array<{ name: string, version: string }>,
}

export type VisualStudioSolutionHeader = {
    fileFormat: string,
    majorVersion: string,
    fullVersion: string,
    minimumVersion: string,
}

export type VisualStudioSolution = VisualStudioSolutionHeader & {
    path: string,
    projects: VisualStudioProject[],
}
