const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const database = path.join(__dirname, 'covid19India.db')

const app = express()

app.use(express.join())

let database = null

const initializeDbServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbServer()

const convertStateDbObjectToResponseObject = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}

const convertDistrictDbObjectToResponseObject = dbObject => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  }
}

app.get('/states/', async (request, response) => {
  const getStatesQuery = `
    SELECT 
      *
    FROM
      state`
  const statesArray = await database.all(getStatesQuery)
  response.send(
    statesArray.map(eachState => ({stateName: eachState.state_name})),
  )
})

app.get('/states/:stateId/', async (request, response) => {
  const {districtId} = request.params
  const getStateQuery = `
    SELECT 
      * 
    FROM
      state
    WHERE
      state_id = ${stateId};`
  const state = await database.get(getStateQuery)
  response.send(convertStateDbObjectToResponseObject(state))
})

app.post('/districts/', async (request, response) => {
  const {districtId, districtName, stateId, cases, cured, active, deaths} =
    request.body
  const postStateQuery = `
  INSERT INTO
    state ( district_id, district_name, state_id, cases, cured, active, deaths)
  VALUES
    (${districtId}, '${districtName}', '${stateId}', '${cases}', '${cured}', '${active}', '${deaths}');`
  await database.run(postStateQuery)
  response.send('District Successfully Added')
})

app.get('/districts/:districtId/', async (request, response) => {
  const { districtId} = request.params
  const getDistrictQuery = `
    SELECT
      *
    FROM
      district
    WHERE
      district_id = ${district_id};`
  consst district = await database.get(getDistrictQuery)
  response.send(convertDistrictDbObjectToResponseObject(district))
})


app.get("/districts/:districtId/details/",async (request, response) => {
const { districtId } = request.params;
const getDistrictIdQuery = `
select state_id from district
  where district_id = ${districtId};
`;
const getDistrictIdQueryResponse =await database.get(getDistrictIdQuery);

const getStateNameQuery = `
select 
state_name 
as 
stateName 
from 
state
where 
state_id = ${getDistrictIdQueryResponse.state_id};
 `;
const getStateNameQueryResponse =await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
  });


module.exports = app;