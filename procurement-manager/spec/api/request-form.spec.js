/**
 * This file contains the tests for the Request Form API
 */

const axios = require('axios')

const endpoint = 'http://localhost:3000/api/request-form'
const get = endpoint + '/get'
const update = endpoint + '/update'

describe('Request Form API', () => {
  it('A GET call should return 405', async () => {
    axios.get(endpoint).then((res) => {
      expect(res.status).toBe(405)
    })
  })

  it('A POST call with an empty body should return 400', () => {
    axios.post(endpoint).then((res) => {
      expect(res.status).toBe(400)
    })
  })

  it('A POST call with a valid body should return 200', () => {
    const requestBody = {
      date: '2024-01-08',
      projectNum: 1,
      studentEmail: 'abc000000@utdallas.edu',
      items: [
        {
          description: 'some item description',
          url: 'someurl.com',
          partNumber: '123456789',
          quantity: 1,
          unitPrice: 0.75,
          vendorID: 1,
        },
      ],
      additionalInfo: 'some additional info',
      totalExpenses: 0.75,
    }
    axios.post(endpoint, requestBody).then((res) => {
      expect(res.status).toBe(200)
    })
  })

  it('A POST call with an invalid items in body should return 400', () => {
    const requestBody = {
      date: '2024-01-08',
      projectNum: 1,
      studentEmail: 'abc000000@utdallas.edu',
      additionalInfo: 'some additional info',
      totalExpenses: 0,
    }

    axios.post(endpoint, requestBody).then((res) => {
      expect(res.status).toBe(400)
    })
  })

  it('A POST call with no body should return 400', () => {
    axios.post(endpoint).then((res) => {
      expect(res.status).toBe(400)
    })
  })
})

describe('Request Form/GET API', () => {
  it('A GET call should return 405', () => {
    axios.get(get).then((res) => {
      expect(res.status).toBe(405)
    })
  })

  it('A POST call with an empty body should return 400', () => {
    axios.post(get).then((res) => {
      expect(res.status).toBe(400)
    })
  })

  it('A POST call with an admin should return all requests', () => {
    axios
      .post(get, {
        email: 'ghi000000@utdallas.edu',
      })
      .then((res) => {
        expect(res.status).toBe(200)
        expect(res.data.projects.length > 0).toBe(true)
        expect(res.data.requests.length > 0).toBe(true)
      })
  })

  it('A POST call with a mentor should return all requests', () => {
    axios
      .post(get, {
        email: 'def000000@utdallas.edu',
      })
      .then((res) => {
        expect(res.status).toBe(200)
        expect(res.data.projects.length > 0).toBe(true)
        expect(res.data.requests.length > 0).toBe(true)
      })
  })

  it('A POST call with a student should return all requests', () => {
    axios
      .post(get, {
        email: 'abc000000@utdallas.edu',
      })
      .then((res) => {
        expect(res.status).toBe(200)
        expect(res.data.projects.length > 0).toBe(true)
        expect(res.data.requests.length > 0).toBe(true)
      })
  })
})

describe('Request Form/UPDATE API', () => {
  it('A GET call should return 405', () => {
    axios.get(update).then((res) => {
      expect(res.status).toBe(405)
    })
  })

  it('A POST call with an empty body should return 400', () => {
    axios.post(update).then((res) => {
      expect(res.status).toBe(400)
    })
  })

  it('A POST call with all fields changed should return 200', () => {
    const requestBody = {
      projectID: 1,
      requestID: 1,
      items: [
        {
          description: 'some item description',
          url: 'someurl.com',
          partNumber: '123456789',
          quantity: 1,
          unitPrice: 0.75,
          vendorID: 1,
        },
        {
          description: 'some item description 2',
          url: 'someurl.com',
          partNumber: '987654321',
          quantity: 1,
          unitPrice: 0.5,
          vendorID: 1,
        },
      ],
      totalExpenses: 1.25,
    }
    axios.post(update, requestBody).then((res) => {
      expect(res.status).toBe(200)
    })
  })
})
