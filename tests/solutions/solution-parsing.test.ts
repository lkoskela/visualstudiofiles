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

        it('should include only valid "code" projects', () => {
            expect(solution).toBeDefined()
            expect(solution.projects).toBeDefined()
            expect(solution.projects.length).toBe(2)
            expect(solution.projects.map(p => p.name).sort()).toStrictEqual(['App.CloudService', 'App.Core'])
        })
    })
})
