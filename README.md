# visualstudiofiles

A TypeScript/JavaScript library for parsing Visual Studio solution and project files in Node.js.

# Usage

```typescript
import {
    VisualStudioSolution,
    VisualStudioProject,
    parseVisualStudioSolutionFile,
    parseVisualStudioProjectFile,
} from 'visualstudiofiles'

// You can parse solution files from a file path:
let solution1: VisualStudioSolution = parseVisualStudioSolutionFile('/path/to/TicTacToe.sln')

// ...or provide the file's contents:
let solution2: VisualStudioSolution = parseVisualStudioSolutionFile(
  'Microsoft Visual Studio Solution File, Format Version 11.00\n' +
  '# Visual Studio 10\n' +
  'Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = ...\n' +
  'EndProject\n'
`)

// You can parse project files from a file path:
let project1: VisualStudioProject = parseVisualStudioProjectFile('./TicTacToe.UI/TicTacToe.UI.csproj')

// ...or provide the file's contents:
let project2: VisualStudioProject = parseVisualStudioProjectFile('<Project ...>...</Project>')
```
