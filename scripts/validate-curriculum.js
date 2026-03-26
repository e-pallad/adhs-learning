#!/usr/bin/env node
// Validates all curriculum JSON files under content/curriculum/tracks/
// Run: node scripts/validate-curriculum.js
// Used by .github/workflows/validate-curriculum.yml

const fs = require("fs")
const path = require("path")

const TRACKS_DIR = path.join(__dirname, "../content/curriculum/tracks")
const VALID_BLOCK_TYPES = ["theory", "practice", "project", "review"]
const VALID_LEVELS = ["beginner", "intermediate", "advanced"]

let errors = []
let warnings = []
let filesChecked = 0

function error(file, msg) {
  errors.push(`  ✗ ${file}: ${msg}`)
}

function warn(file, msg) {
  warnings.push(`  ⚠ ${file}: ${msg}`)
}

function validateMeta(file, data) {
  const required = ["id", "title", "description", "language", "level", "icon"]
  for (const field of required) {
    if (!data[field]) error(file, `missing required field: "${field}"`)
  }
  if (data.level && !VALID_LEVELS.includes(data.level)) {
    error(file, `invalid level "${data.level}" — must be one of: ${VALID_LEVELS.join(", ")}`)
  }
}

function validateBlock(file, block, trackId, monthNum, weekNum) {
  const ctx = `block "${block.id ?? "(no id)"}"`

  if (!block.id) {
    error(file, `${ctx} missing required field: "id"`)
  } else {
    // ID convention: {track}-m{month}w{week}-b{n} for new tracks
    // javascript keeps legacy format m{month}w{week}-b{n} for backward compat
    const legacyPattern = /^m\d+w\d+-b\d+$/
    const prefixedPattern = /^[a-z]+-m\d+w\d+-b\d+$/
    if (!legacyPattern.test(block.id) && !prefixedPattern.test(block.id)) {
      error(file, `${ctx} invalid ID format — expected "m{month}w{week}-b{n}" or "{track}-m{month}w{week}-b{n}"`)
    }
  }

  if (!block.title) error(file, `${ctx} missing required field: "title"`)
  if (!block.description) error(file, `${ctx} missing required field: "description"`)
  if (typeof block.durationMinutes !== "number" || block.durationMinutes <= 0) {
    error(file, `${ctx} "durationMinutes" must be a positive number`)
  }
  if (!VALID_BLOCK_TYPES.includes(block.type)) {
    error(file, `${ctx} invalid type "${block.type}" — must be one of: ${VALID_BLOCK_TYPES.join(", ")}`)
  }

  if (block.quiz) {
    if (!Array.isArray(block.quiz)) {
      error(file, `${ctx} "quiz" must be an array`)
    } else {
      block.quiz.forEach((q, i) => {
        const qctx = `${ctx} quiz[${i}]`
        if (!q.question) error(file, `${qctx} missing "question"`)
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          error(file, `${qctx} "options" must be an array of exactly 4 strings`)
        }
        if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 3) {
          error(file, `${qctx} "correctIndex" must be a number 0–3`)
        }
        if (!q.explanation) error(file, `${qctx} missing "explanation"`)
      })
      if (block.quiz.length < 3 || block.quiz.length > 5) {
        warn(file, `${ctx} quiz has ${block.quiz.length} questions — recommended 3–5`)
      }
    }
  }

  if (block.resources) {
    if (!Array.isArray(block.resources)) {
      error(file, `${ctx} "resources" must be an array`)
    } else {
      block.resources.forEach((r, i) => {
        if (!r.label) error(file, `${ctx} resources[${i}] missing "label"`)
        if (!r.url) error(file, `${ctx} resources[${i}] missing "url"`)
      })
    }
  }
}

function validateMonth(file, data, trackId) {
  const required = ["month", "title", "description", "projectTitle", "projectDescription", "alternativeProjects", "weeks"]
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      error(file, `missing required field: "${field}"`)
    }
  }

  if (typeof data.month !== "number") {
    error(file, `"month" must be a number`)
  }

  if (!Array.isArray(data.alternativeProjects)) {
    error(file, `"alternativeProjects" must be an array`)
  }

  if (!Array.isArray(data.weeks)) {
    error(file, `"weeks" must be an array`)
    return
  }

  const blockIds = new Set()
  data.weeks.forEach((week, wi) => {
    if (typeof week.week !== "number") error(file, `weeks[${wi}] missing "week" number`)
    if (!week.theme) error(file, `weeks[${wi}] missing "theme"`)
    if (!Array.isArray(week.blocks)) {
      error(file, `weeks[${wi}] "blocks" must be an array`)
      return
    }

    week.blocks.forEach((block) => {
      if (block.id) {
        if (blockIds.has(block.id)) {
          error(file, `duplicate block ID: "${block.id}"`)
        }
        blockIds.add(block.id)
      }
      validateBlock(file, block, trackId, data.month, week.week)
    })
  })
}

// --- Main ---
if (!fs.existsSync(TRACKS_DIR)) {
  console.error(`Tracks directory not found: ${TRACKS_DIR}`)
  process.exit(1)
}

const trackDirs = fs.readdirSync(TRACKS_DIR).filter(d =>
  fs.statSync(path.join(TRACKS_DIR, d)).isDirectory()
)

// Collect all block IDs across all tracks to check for cross-track collisions
const allBlockIds = new Map() // id -> file

for (const trackId of trackDirs) {
  const trackDir = path.join(TRACKS_DIR, trackId)
  const files = fs.readdirSync(trackDir)

  // Validate meta.json
  const metaFile = path.join(trackDir, "meta.json")
  if (!fs.existsSync(metaFile)) {
    errors.push(`  ✗ ${trackId}/meta.json: file missing`)
  } else {
    try {
      const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"))
      validateMeta(`${trackId}/meta.json`, meta)
      filesChecked++
      if (meta.id && meta.id !== trackId) {
        error(`${trackId}/meta.json`, `meta.id "${meta.id}" does not match directory name "${trackId}"`)
      }
    } catch (e) {
      errors.push(`  ✗ ${trackId}/meta.json: invalid JSON — ${e.message}`)
    }
  }

  // Validate month files
  const monthFiles = files.filter(f => /^month-\d{2}\.json$/.test(f)).sort()
  for (const monthFile of monthFiles) {
    const filePath = path.join(trackDir, monthFile)
    const relPath = `${trackId}/${monthFile}`
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
      validateMonth(relPath, data, trackId)
      filesChecked++

      // Register block IDs for cross-track collision detection
      if (Array.isArray(data.weeks)) {
        for (const week of data.weeks) {
          if (Array.isArray(week.blocks)) {
            for (const block of week.blocks) {
              if (block.id) {
                if (allBlockIds.has(block.id)) {
                  errors.push(`  ✗ Cross-track duplicate ID "${block.id}" in ${relPath} (also in ${allBlockIds.get(block.id)})`)
                } else {
                  allBlockIds.set(block.id, relPath)
                }
              }
            }
          }
        }
      }
    } catch (e) {
      errors.push(`  ✗ ${relPath}: invalid JSON — ${e.message}`)
    }
  }
}

// Report
console.log(`\nCurriculum validation — ${filesChecked} files checked across ${trackDirs.length} track(s)\n`)

if (warnings.length > 0) {
  console.log("Warnings:")
  warnings.forEach(w => console.log(w))
  console.log()
}

if (errors.length > 0) {
  console.log("Errors:")
  errors.forEach(e => console.log(e))
  console.log(`\n${errors.length} error(s) found. Fix them before merging.\n`)
  process.exit(1)
} else {
  console.log("All checks passed.\n")
  process.exit(0)
}
