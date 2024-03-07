To run:
- `tsc script.ts` to compile
- `ACCESS_TOKEN={ACCESS_TOKEN} node script.js` to run
#
- Uses async calls to ensure calls are sequential and run every 2 seconds at the soonest
- Uses exponential backoff to handle rate limits
