'use strict'

/* @flow */

export type Publish$Rule = {
  name: string,
  execute: ((... param:any) => Promise<boolean>)
}

export type Publish$Bump = 'major' | 'minor' | 'patch'
