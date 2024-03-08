import * as path from 'path'

import { parseVisualStudioProjectFile } from '../../src'


describe('parseVisualStudioProjectFile', () => {

    describe('App.Core.csproj', () => {
        const project = parseVisualStudioProjectFile(path.join(__dirname, '../samples/VS2013/core/App.Core/App.Core.csproj'))

        it('doesn\'t throw', () => {
            expect(project).toBeDefined()
        })

        it('extracts project name from file name', () => {
            expect(project.name).toEqual('App.Core')
        })

        it('collects dependencies', () => {
            expect(project.dependencies).toBeDefined()
            expect(project.dependencies.length).toBe(1)
            expect(project.dependencies[0]).toStrictEqual({ name: 'Microsoft.Extensions.Hosting', version: '7.0.1' })
        })

        it('defaults type and GUID properties when there is no .sln file to give context', () => {
            expect(project.guid).toEqual('')
            expect(project.type).toEqual('')
        })

        it('extracts SDKs', () => {
            expect(project.sdks).toStrictEqual(['Microsoft.NET.Sdk.Worker'])
        })
    })

    describe('App.CloudService.csproj', () => {
        const project = parseVisualStudioProjectFile(path.join(__dirname, '../samples/VS2013/cloud-service/App.CloudService.csproj'))

        it('doesn\'t throw', () => {
            expect(project).toBeDefined()
        })

        it('extracts project name from file name', () => {
            expect(project.name).toEqual('App.CloudService')
        })

        it('collects dependencies', () => {
            expect(project.dependencies).toBeDefined()
            expect(project.dependencies.length).toBe(2)
            expect(project.dependencies[0]).toStrictEqual({ name: 'Microsoft.Extensions.Hosting', version: '7.0.1' })
            expect(project.dependencies[1]).toStrictEqual({ name: 'Microsoft.VisualStudio.Azure.Containers.Tools.Targets', version: '1.18.1' })
        })

        it('extracts SDKs', () => {
            expect(project.sdks).toStrictEqual(['Microsoft.NET.Sdk.Publish', 'Microsoft.NET.Sdk.Worker'])
        })
    })

    describe('VS2010CppProject.vcxproj', () => {
        const project = parseVisualStudioProjectFile(path.join(__dirname, '../samples/VS2010/VS2010CppProject/VS2010CppProject.vcxproj'))

        it('doesn\'t throw', () => {
            expect(project).toBeDefined()
        })

        it('extracts project name from file name', () => {
            expect(project.name).toEqual('VS2010CppProject')
        })

        it('collects an empty list of dependencies', () => {
            expect(project.dependencies).toBeDefined()
            expect(project.dependencies).toStrictEqual([])
        })

        it('extracts an empty list of SDKs', () => {
            expect(project.sdks).toStrictEqual([])
        })
    })
})
