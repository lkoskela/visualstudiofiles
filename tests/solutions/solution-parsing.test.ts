import * as path from 'path'

import { parseVisualStudioSolutionFile } from '../../src'


describe('parseVisualStudioSolutionFile', () => {

    it('should reject a non-solution file', () => {
        expect(() => parseVisualStudioSolutionFile(__filename)).toThrow(new Error(`Not a valid Visual Studio solution file name: ${__filename}`))
    })

    it('should reject a .vdproj file', () => {
        const filePath = path.join(__dirname, '../samples/VS2013/windows-service-installer/App.WindowsService.Installer/App.WindowsService.Installer.vdproj')
        expect(() => parseVisualStudioSolutionFile(filePath)).toThrow(new Error(`Not a valid Visual Studio solution file name: ${filePath}`))
    })

    describe('solution with a virtual project ("Solution Items")', () => {
        const parse = () => parseVisualStudioSolutionFile(path.join(__dirname, '../samples/gstreamer-sharp/gstreamer-sharp.sln'))

        it('does not choke on the reference to non-existent project', () => {
            expect(parse).not.toThrow()
        })

        it('includes only regular "code" projects, not the virtual project', () => {
            const solution = parse()
            expect(solution).toBeDefined()
            expect(solution.projects).toBeDefined()
            expect(solution.projects.map(p => p.name).sort()).toStrictEqual(['gstreamer-sharp'])
        })
    })

    describe('file format version 12.00 (VS2013 and newer)', () => {
        const solution = parseVisualStudioSolutionFile(path.join(__dirname, '../samples/VS2013/VS2013Solution.sln'))

        describe('parses the header', () => {
            it('minimum version', () => expect(solution.minimumVersion).toEqual('10.0.40219.1'))
            it('full version', () => expect(solution.fullVersion).toEqual('17.2.32630.192'))
            it('major version', () => expect(solution.majorVersion).toEqual('17'))
            it('file format', () => expect(solution.fileFormat).toEqual('12.00'))
        })

        it('includes only valid "code" projects (not a .vdproj, for example)', () => {
            expect(solution).toBeDefined()
            expect(solution.projects).toBeDefined()
            expect(solution.projects.map(p => p.name).sort()).toStrictEqual(['App.CloudService', 'App.Core'])
        })

        it('extracts project GUID and project type', () => {
            const coreProject = solution?.projects?.find(p => p.name === 'App.Core')
            expect(coreProject?.type).toEqual('C# (.Net Core)')
            expect(coreProject?.guid).toEqual('28F3041E-09D9-43D5-9D69-7BAE9BBA2531')
        })
    })

    describe('older file formats', () => {

        describe('file format version 11.00 (VS2010)', () => {
            const solution = parseVisualStudioSolutionFile(path.join(__dirname, '../samples/VS2010/VS2010Solution.sln'))

            describe('parses the header', () => {
                it('minimum version', () => expect(solution.minimumVersion).toEqual('unknown'))
                it('full version', () => expect(solution.fullVersion).toEqual('unknown'))
                it('major version', () => expect(solution.majorVersion).toEqual('10'))
                it('file format', () => expect(solution.fileFormat).toEqual('11.00'))
            })

            it('includes only valid "code" projects (not a .vdproj, for example)', () => {
                expect(solution).toBeDefined()
                expect(solution.projects).toBeDefined()
                expect(solution.projects.map(p => p.name).sort()).toStrictEqual(['VS2010CppProject', 'VS2010Project'])
            })

            it('extracts C# project GUID and project type', () => {
                const coreProject = solution?.projects?.find(p => p.name === 'VS2010Project')
                expect(coreProject?.type).toEqual('C#')
                expect(coreProject?.guid).toEqual('BA9EB972-C998-43AF-A697-653BE8147504')
            })

            it('extracts C++ project GUID and project type', () => {
                const coreProject = solution?.projects?.find(p => p.name === 'VS2010CppProject')
                expect(coreProject?.type).toEqual('C++')
                expect(coreProject?.guid).toEqual('BA9EB972-C998-43AF-A697-653BE8147505')
            })
        })

        describe('file format version 10.00 (VS2008)', () => {
            const solution = parseVisualStudioSolutionFile(path.join(__dirname, '../samples/VS2008/VS2008Solution.sln'))

            describe('parses the header', () => {
                it('minimum version', () => expect(solution.minimumVersion).toEqual('unknown'))
                it('full version', () => expect(solution.fullVersion).toEqual('9.0'))
                it('major version', () => expect(solution.majorVersion).toEqual('2008'))
                it('file format', () => expect(solution.fileFormat).toEqual('10.00'))
            })

            it('includes only valid "code" projects (not a .vdproj, for example)', () => {
                expect(solution).toBeDefined()
                expect(solution.projects).toBeDefined()
                expect(solution.projects.map(p => p.name).sort()).toStrictEqual(['VS2008Project'])
            })

            it('extracts project GUID and project type', () => {
                const coreProject = solution?.projects?.find(p => p.name === 'VS2008Project')
                expect(coreProject?.type).toEqual('VB.NET')
                expect(coreProject?.guid).toEqual('30B2794F-5D7D-4C9F-95C5-9DCC7AD4DC44')
            })
        })

        describe('file format version 9.00 (VS2005)', () => {
            const solution = parseVisualStudioSolutionFile(path.join(__dirname, '../samples/VS2005/VS2005Solution.sln'))

            describe('parses the header', () => {
                it('minimum version', () => expect(solution.minimumVersion).toEqual('unknown'))
                it('full version', () => expect(solution.fullVersion).toEqual('unknown'))
                it('major version', () => expect(solution.majorVersion).toEqual('2005'))
                it('file format', () => expect(solution.fileFormat).toEqual('9.00'))
            })

            it('includes only valid "code" projects (not a .vdproj, for example)', () => {
                expect(solution).toBeDefined()
                expect(solution.projects).toBeDefined()
                expect(solution.projects.map(p => p.name).sort()).toStrictEqual(['VS2005Project'])
            })

            it('extracts project GUID and project type', () => {
                const coreProject = solution?.projects?.find(p => p.name === 'VS2005Project')
                expect(coreProject?.type).toEqual('VB.NET')
                expect(coreProject?.guid).toEqual('30B2794F-5D7D-4C9F-95C5-9DCC7AD4DC44')
            })
        })

        describe('file format version 8.00 (VS2003)', () => {
            const solution = parseVisualStudioSolutionFile(path.join(__dirname, '../samples/VS2003/VS2003Solution.sln'))

            describe('parses the header', () => {
                it('minimum version', () => expect(solution.minimumVersion).toEqual('unknown'))
                it('full version', () => expect(solution.fullVersion).toEqual('7.1'))
                it('major version', () => expect(solution.majorVersion).toEqual('2003'))
                it('file format', () => expect(solution.fileFormat).toEqual('8.00'))
            })

            it('includes only valid "code" projects (not a .vdproj, for example)', () => {
                expect(solution).toBeDefined()
                expect(solution.projects).toBeDefined()
                expect(solution.projects.map(p => p.name).sort()).toStrictEqual(['VS2003Project'])
            })

            it('extracts project GUID and project type', () => {
                const coreProject = solution?.projects?.find(p => p.name === 'VS2003Project')
                expect(coreProject?.type).toEqual('VB.NET')
                expect(coreProject?.guid).toEqual('30B2794F-5D7D-4C9F-95C5-9DCC7AD4DC44')
            })
        })
    })
})
