const { fetch } = require('undici')
const { DateTime } = require('luxon')
const semver = require('semver')

async function app() {
  // fetch the data we're going to operate on
  const rawVersions = await fetch('https://nodejs.org/dist/index.json')
  const rawSchedule = await fetch('https://raw.githubusercontent.com/nodejs/Release/master/schedule.json')
  // pull the JSON from the fetched data
  const versions = await rawVersions.json()
  const schedule = await rawSchedule.json()
  // set up luxon
  const now = DateTime.now()
  // set up our basic object
  const data = {}

  // iterate over every object, which is a specific version of Node.js
  Object.keys(versions).map(version => {
    // get the semver for the version
    const versionSemver = semver.coerce(versions[version].version)
    // get a nice name for the version
    const name = versionSemver.major !== 0 ? `v${versionSemver.major}` : `v${versionSemver.major}.${versionSemver.minor}`

    // define the shape of the object we're going to use
    if(!data[name]) { 
      data[name] = {}
    }

    // if that version doesn't already have a support property, add it and fill it out
    if (!data[name].support) {
      data[name].support = {}
      data[name].support.codename = schedule[name]?.codename ?? undefined

      // this is where our meaningful data starts, and where the nullish coalescing begins. this usually all works as expected as far as I can tell.
      data[name].support.phases = {}
      data[name].support.phases.start = schedule[name]?.start ?? undefined
      data[name].support.phases.lts = schedule[name]?.lts ?? undefined
      data[name].support.phases.maintenance = schedule[name]?.maintenance ?? undefined
      data[name].support.phases.end = schedule[name]?.end ?? undefined
      console.log("\ndates before call:\n", JSON.stringify(data[name].support.phases, null, 2))
      // now we call our method where the nullish coalescing weirdness happens
      determineCurrentReleasePhase(data[name].support.phases)
    }
  })
}
  

function determineCurrentReleasePhase(dates = {}) {
  // output what we're recieving as JSON
  console.log("\ndates in function:\n", JSON.stringify(dates, null, 2))
  // this is where the weirdness happens. sometimes, the properties that aren't always available will be `null`? I'm not sure how that's possible.
  const isoified = {
    start: DateTime.fromISO(dates.start) ?? undefined,
    lts: DateTime.fromISO(dates.lts) ?? undefined,
    maintenance: DateTime.fromISO(dates.maintenance) ?? undefined,
    end: DateTime.fromISO(dates.end) ?? undefined
  }

  console.log("\nisoified:\n", JSON.stringify(isoified, null, 2))
}

app()
