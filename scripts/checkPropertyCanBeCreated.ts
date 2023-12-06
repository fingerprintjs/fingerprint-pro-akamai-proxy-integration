import { getProperty } from './utils/getProperty'

const handler = async () => {
  try {
    const property = await getProperty()
    if (property) {
      console.log('Property already exists')
      process.exit(1)
    }
  } catch (e) {
    console.log('Error during property check:', e)
    process.exit(1)
  }
}

handler().finally()
