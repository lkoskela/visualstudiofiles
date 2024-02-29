import * as path from 'path'

import { parseVisualStudioSolutionFile } from '../../src'


describe('parseVisualStudioSolutionFile', () => {

    it('should reject a non-solution file', () => {
        expect(() => parseVisualStudioSolutionFile(__filename)).toThrow(new Error(`Not a valid Visual Studio solution file name: ${__filename}`))
    })

    it('should reject a .vdproj file', () => {
        const filePath = path.join(__dirname, '../samples/windows-service-installer/App.WindowsService.Installer/App.WindowsService.Installer.vdproj')
        expect(() => parseVisualStudioSolutionFile(filePath)).toThrow(new Error(`Not a valid Visual Studio solution file name: ${filePath}`))
    })


    describe('SampleSolution.sln', () => {
        const solution = parseVisualStudioSolutionFile(path.join(__dirname, '../samples/SampleSolution.sln'))

        describe('parses the header', () => {
            it('minimum version', () => expect(solution.minimumVersion).toEqual('10.0.40219.1'))
            it('full version', () => expect(solution.fullVersion).toEqual('17.2.32630.192'))
            it('major version', () => expect(solution.majorVersion).toEqual('17'))
            it('file format', () => expect(solution.fileFormat).toEqual('12.00'))
        })

        it('includes only valid "code" projects (not a .vdproj, for example)', () => {
            expect(solution).toBeDefined()
            expect(solution.projects).toBeDefined()
            expect(solution.projects.length).toBe(2)
            expect(solution.projects.map(p => p.name).sort()).toStrictEqual(['App.CloudService', 'App.Core'])
        })

        it('extracts project GUID and project type', () => {
            expect(solution).toBeDefined()
            expect(solution.projects).toBeDefined()
            const coreProject = solution.projects.find(p => p.name === 'App.Core')
            expect(coreProject?.name).toEqual('App.Core')
            expect(coreProject?.type).toEqual('C# (.Net Core)')
            expect(coreProject?.guid).toEqual('28F3041E-09D9-43D5-9D69-7BAE9BBA2531')
        })
    })
})
