const { fetch } = require('undici')
const { DateTime } = require('luxon')
const semver = require('semver')

async function app() {
  const rawVersions = await fetch('https://nodejs.org/dist/index.json')
  const rawSchedule = await fetch('https://raw.githubusercontent.com/nodejs/Release/master/schedule.json')
  const versions = await rawVersions.json()
  const schedule = await rawSchedule.json()
  const now = DateTime.now()
  const data = {}

  Object.keys(versions).map(version => {
    const versionSemver = semver.coerce(versions[version].version)
    const name = versionSemver.major !== 0 ? `v${versionSemver.major}` : `v${versionSemver.major}.${versionSemver.minor}`

    // define the shape of the object we're going to use
    if(!data[name]) { 
      data[name] = {}
    }

    if (!data[name].support) { // check to see if we've already written it. if we have, we don't need to waste time on it.
      data[name].support = {}
      data[name].support.codename = schedule[name]?.codename ?? undefined

      data[name].support.phases = {}
      data[name].support.phases.start = schedule[name]?.start ?? undefined
      data[name].support.phases.lts = schedule[name]?.lts ?? undefined
      data[name].support.phases.maintenance = schedule[name]?.maintenance ?? undefined
      data[name].support.phases.end = schedule[name]?.end ?? undefined
      console.log("\ndates before call:\n", JSON.stringify(data[name].support.phases, null, 2))
      determineCurrentReleasePhase(data[name].support.phases)
    }
  })
}
  

function determineCurrentReleasePhase(dates = {}) {
  console.log("\ndates in function:\n", JSON.stringify(dates, null, 2))
  const isoified = {
    start: DateTime.fromISO(dates.start) ?? undefined,
    lts: DateTime.fromISO(dates.lts) ?? undefined,
    maintenance: DateTime.fromISO(dates.maintenance) ?? undefined,
    end: DateTime.fromISO(dates.end) ?? undefined
  }

  console.log("\nisoified:\n", JSON.stringify(isoified, null, 2))
}

app()