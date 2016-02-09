'use strict'

/* @flow */

import Path from 'path'
import IgnoredParser from 'gitignore-parser'
import { isMatch } from 'micromatch'
import { readFile, fileExists, findAsync } from '../helpers'
const debugValidate = require('debug')('publish:ignore:npm')

export async function validate(directory: string): Promise {
  // Manifest existance validation
  const manifest = await findAsync(directory, 'package.json')
  if (!manifest) {
    debugValidate('No manifest file found, ignoring')
    return
  }
  debugValidate(`Manifest found at ${manifest}`)

  // Manifest content validation
  let manifestContents
  try {
    manifestContents = JSON.parse( await readFile(manifest) )
  } catch (_) {
    throw new Error(`Malformed or invalid manifest`)
  }
  if (!manifestContents.main) {
    throw new Error(`No 'main' found in manifest`)
  }

  // Main file validation
  const mainFile = Path.resolve(directory, manifestContents.main)
  if (!await fileExists(mainFile)) {
    throw new Error(`Main file ${mainFile} not found`)
  }

  // Main file ignored validation
  const ignoreFile = await findAsync(directory, '.npmignore')
  if (!ignoreFile) {
    debugValidate('No .npmignore found')
  } else {
    const ignoreRules = (await readFile(ignoreFile)).toString()
    const ignoreParser = IgnoredParser.compile(ignoreRules)
    const ignoreDirectory = Path.dirname(ignoreFile)
    if (ignoreParser.denies(Path.relative(ignoreDirectory, mainFile))) {
      throw new Error(`Main file ${mainFile} ignored by .npmignore`)
    }
  }
}
