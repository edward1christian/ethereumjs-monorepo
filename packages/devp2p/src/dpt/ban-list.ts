import debugDefault from 'debug'

import { formatLogId } from '../util.js'

import { KBucket } from './kbucket.js'

import type { PeerInfo } from '../types.js'
import type LRUCache from 'lru-cache'
const { debug: createDebugLogger } = debugDefault

const LRU = require('lru-cache')

const debug = createDebugLogger('devp2p:dpt:ban-list')
const verbose = createDebugLogger('verbose').enabled

export class BanList {
  private _lru: LRUCache<string, boolean>
  private DEBUG: boolean
  constructor() {
    this._lru = new LRU({ max: 10000 })
    this.DEBUG =
      typeof window === 'undefined' ? process?.env?.DEBUG?.includes('ethjs') ?? false : false
  }

  add(obj: string | Uint8Array | PeerInfo, maxAge?: number) {
    for (const key of KBucket.getKeys(obj)) {
      this._lru.set(key, true, { ttl: maxAge })
      if (this.DEBUG) {
        debug(`Added peer ${formatLogId(key, verbose)}, size: ${this._lru.size}`)
      }
    }
  }

  has(obj: string | Uint8Array | PeerInfo): boolean {
    return KBucket.getKeys(obj).some((key: string) => Boolean(this._lru.get(key)))
  }
}
