/* eslint-disable no-throw-literal */
import { describe, test } from 'node:test'
import assert from 'node:assert'
import { createReadStream, readFileSync } from 'node:fs'
import { createGzip } from 'node:zlib'
import { Readable } from 'node:stream'

import { hashWasmMemory } from './wasm.js'

describe('wasm', () => {
  describe('hashWasmMemory', () => {
    test('should hash the array buffer', async () => {
      const s = createReadStream('./test/processes/happy/process.wasm')

      const sha = await hashWasmMemory(s)

      assert.ok(typeof sha === 'string')
      assert.equal(sha.length, 64)
    })

    test('should hash the array buffer derived from a typed array', async () => {
      const s = createReadStream('./test/processes/happy/process.wasm')
      const sha = await hashWasmMemory(s)

      const tArray = new Uint8Array(readFileSync('./test/processes/happy/process.wasm'))
      const fromTArray = Buffer.from(tArray.buffer, tArray.byteOffset, tArray.byteLength)
      const fromBuffer = await hashWasmMemory(Readable.from(fromTArray))

      assert.equal(fromBuffer, sha)
    })

    test('should decode the array buffer before hashing', async () => {
      const raw = createReadStream('./test/processes/happy/process.wasm')
      const rawSha = await hashWasmMemory(raw)

      const encoded = createReadStream('./test/processes/happy/process.wasm')
        .pipe(createGzip())

      const encodedSha = await hashWasmMemory(encoded, 'gzip')

      assert.equal(encodedSha.length, 64)
      assert.equal(rawSha, encodedSha)
    })
  })
})
