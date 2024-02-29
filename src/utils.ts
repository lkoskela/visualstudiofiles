import { existsSync, readFileSync, statSync } from 'fs'

export const isFile = (filePath: string): boolean => existsSync(filePath) && statSync(filePath).isFile()

export const fileContents = (pathOrContents: string): string => {
    if (isFile(pathOrContents)) {
        return readFileSync(pathOrContents, 'utf8').toString()
    }
    return pathOrContents
}
