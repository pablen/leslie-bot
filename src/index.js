require('dotenv').config()
const Twit = require('twit')

const quotes = require('./quotes')()

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: false // optional - requires SSL certificates to be valid.
})

T.get(
  'account/verify_credentials',
  {
    include_entities: false,
    include_email: false,
    skip_status: true
  },
  function onAuthenticated(err) {
    if (err) throw err
    console.log('Authentication successful. Running bot...\r\n')
  }
)

T.get('statuses/user_timeline', { count: 1 }, function getLastQuote(err, data) {
  if (err) throw err
  const lastTweetText = data[0].text || ''
  const lastTweetIndex =
    quotes.indexOf(lastTweetText) > -1 ? quotes.indexOf(lastTweetText) : 0
  console.log(`Last quote:\n${lastTweetText} (${lastTweetIndex})\n\n`)

  const nextTweetIndex =
    lastTweetIndex === quotes.length - 1 ? 0 : lastTweetIndex + 1
  const nextTweetText = quotes[nextTweetIndex]
  console.log(`Next quote:\n${nextTweetText} (${nextTweetIndex})\n\n`)

  T.post('statuses/update', { status: nextTweetText }, function onTweeted(
    err,
    reply
  ) {
    if (err !== undefined) {
      console.log(
        `There was an error with Leslie quotes bot: ${JSON.stringify(err)}.`
      )
    } else {
      console.log(`Tweeted:\n${reply.text}\n\n`)
    }
  })
})
