import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'
import { getManifest } from './getManifest'

async function main() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'xylo' } },
    limit: 1,
    depth: 0,
  })
  const doc = docs[0]
  if (!doc) {
    console.log('no xylo doc found')
    await payload.destroy()
    return
  }

  const before = await getManifest()
  console.log('before update: manifest has "XYLO"?', before.some((m) => m.title === 'XYLO'))

  await payload.update({
    collection: 'projects',
    id: doc.id,
    data: { title: 'XYLO-VERIFY' },
  })

  const after = await getManifest()
  console.log('after update: manifest has "XYLO-VERIFY"?', after.some((m) => m.title === 'XYLO-VERIFY'))
  console.log('after update: manifest has "XYLO"?', after.some((m) => m.title === 'XYLO'))

  await payload.update({
    collection: 'projects',
    id: doc.id,
    data: { title: 'XYLO' },
  })

  const reverted = await getManifest()
  console.log('after revert: manifest has "XYLO"?', reverted.some((m) => m.title === 'XYLO'))

  await payload.destroy()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
