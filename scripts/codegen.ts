import { writeFileSync } from 'fs'
import { join } from 'path'

const CODEGEN_OUTPUT_FILE = join(__dirname, '../src/codegen/project-types.json')
const VISUAL_STUDIO_PROJECT_TYPE_GUIDS_URL = 'https://raw.githubusercontent.com/JamesW75/visual-studio-project-type-guid/main/README.md'

// Fetch and parse the README.md file from the GitHub repository https://github.com/JamesW75/visual-studio-project-type-guid
// which is a public domain listing of Visual Studio project types and their associated GUIDs.
fetch(VISUAL_STUDIO_PROJECT_TYPE_GUIDS_URL)
    .then(response => response.text())
    .then(text => [...text.matchAll(/^\|\s+(.*?)\s+\|\s+{(.*?)}\s+\|$/mg)])
    .then(matches => Object.fromEntries(matches.map(match => ([match[2], match[1]]))))
    .then(guids => JSON.stringify(guids, null, 2))
    .then(json => writeFileSync(CODEGEN_OUTPUT_FILE, json + '\n', { encoding: 'utf8' }))
    .catch(error => console.error(`Error fetching ${VISUAL_STUDIO_PROJECT_TYPE_GUIDS_URL}: ${error}`))
