/**
 * This file contains the tests for the Test API
 */

const axios = require('axios')

const endpoint = 'http://localhost:3000/api/test'

describe('Test API', () => {
  it('A GET call should return 200 when newly setup or 500', async () => {
    axios.get(endpoint).then((res) => {
      expect(res.status == 200 || res.status == 500).toBe(true)
    })
  })

  it('A POST call should return 405', async () => {
    axios.post(endpoint).then((res) => {
      expect(res.status).toBe(405)
    })
  })
})
