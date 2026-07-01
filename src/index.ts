/**
 * Main entry point for Grupo Astoria Site
 * Default (npm run dev): starts BOTH Chocosul (3002) and Admin (3001)
 * To run only one: APP_NAME=admin npm run dev  |  APP_NAME=chocosul npm run dev  |  APP_NAME=admin-mastter npm run dev  |  APP_NAME=astoria npm run dev  |  APP_NAME=admin-astoria npm run dev
 */

import dotenv from 'dotenv'
import path from 'path'

// Read APP_NAME BEFORE dotenv so we can tell if it was explicitly passed
// via CLI/environment (not just sitting in .env).
// dotenv.config() does NOT override pre-existing env vars, so if APP_NAME
// already exists here it was set by the caller, not the .env file.
const explicitApp = process.env.APP_NAME

// Load root .env (may set APP_NAME, DB creds, ports, etc.)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Only honour APP_NAME when explicitly provided – otherwise start everything.
const APP = (explicitApp || 'all').toLowerCase()

async function startAdmin() {
  try {
    console.log('\n🚀 Starting ADMIN application...\n')
    await import('../apps/Admin/server')
  } catch (err) {
    console.error('Failed to start Admin app:', err)
    process.exit(1)
  }
}

async function startChocosul() {
  try {
    console.log('\n🚀 Starting CHOCOSUL application...\n')
    await import('../apps/Chocosul/server')
  } catch (err) {
    console.error('Failed to start Chocosul app:', err)
    process.exit(1)
  }
}

async function startMastter() {
  try {
    console.log('\n🚀 Starting MASTTER application...\n')
    await import('../apps/Mastter/server')
  } catch (err) {
    console.error('Failed to start Mastter app:', err)
    process.exit(1)
  }
}

async function startAdminMastter() {
  try {
    console.log('\n🚀 Starting ADMIN MASTTER application...\n')
    await import('../apps/AdminMastter/server')
  } catch (err) {
    console.error('Failed to start AdminMastter app:', err)
    process.exit(1)
  }
}

async function startAstoria() {
  try {
    console.log('\n🚀 Starting ASTORIA application...\n')
    await import('../apps/Astoria/server')
  } catch (err) {
    console.error('Failed to start Astoria app:', err)
    process.exit(1)
  }
}

async function startAdminAstoria() {
  try {
    console.log('\n🚀 Starting ADMIN ASTORIA application...\n')
    await import('../apps/AdminAstoria/server')
  } catch (err) {
    console.error('Failed to start AdminAstoria app:', err)
    process.exit(1)
  }
}

if (APP === 'admin') {
  startAdmin()
} else if (APP === 'chocosul') {
  startChocosul()
} else if (APP === 'mastter') {
  startMastter()
} else if (APP === 'admin-mastter') {
  startAdminMastter()
} else if (APP === 'astoria') {
  startAstoria()
} else if (APP === 'admin-astoria') {
  startAdminAstoria()
} else {
  // Default: start all
  startAdmin()
  startChocosul()
  startMastter()
  startAdminMastter()
  startAstoria()
  startAdminAstoria()
}
