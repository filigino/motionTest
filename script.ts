import axios from 'axios'

const API_URL = 'https://graph.facebook.com'
const BACKOFF_INTERVAL_INITIAL = 60 * 1000 // 1 min
const INTERVAL = 2000 // 2 seconds
const MAX_USAGE = 100

const accessToken: string | undefined = process.env.ACCESS_TOKEN

const delay = async (interval: number): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      Math.max(0, interval) // no delay if interval is negative
    )
  )

const fetchFromFacebook = async (accessToken: string): Promise<void> => {
  const fieldQueryParam = encodeURIComponent('fields=id,name,last_name')

  const path = `/v19.0/me?${fieldQueryParam}&access_token=${accessToken}`

  let backoffInterval = BACKOFF_INTERVAL_INITIAL
  while (true) {
    try {
      const { data } = await axios.get(path, { baseURL: API_URL })
      console.log(data)
      break
    } catch (err) {
      const {
        response: {
          headers: { 'x-app-usage': usageHeader },
        },
      } = err
      const usage = JSON.parse(usageHeader)

      // rate limit reached when any of these values are maxed out
      if (Object.values(usage).includes(MAX_USAGE)) {
        // exponential backoff until successful
        console.log(`Backing off, waiting ${backoffInterval / 1000} secs...`)
        await delay(backoffInterval)
        backoffInterval *= 2
      } else {
        console.error(err)
        break
      }
    }
  }
}

const main = async (): Promise<void> => {
  if (!accessToken) {
    console.error('ACCESS_TOKEN env var not specified')
    return
  }

  while (true) {
    const start = Date.now()

    // async so only one API request at a time
    await fetchFromFacebook(accessToken)

    const elapsed = Date.now() - start
    await delay(INTERVAL - elapsed)
  }
}

main()
