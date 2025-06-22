import crypto from 'crypto'
import { writeFile } from 'fs/promises'
import { mkdir } from 'fs/promises'

await mkdir('certs', { recursive: true })


const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
})

await writeFile('certs/public.pem', publicKey)
await writeFile('certs/private.pem', privateKey)
