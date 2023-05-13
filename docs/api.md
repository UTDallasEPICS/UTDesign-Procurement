These are the APIs that we have done
There are some things listed in the .docx file that might have been done already so please make sure there are no duplicated methods, codes, etc.

## auth

`[...nextauth].ts` - This is the fake-authentication guided by the [next-auth documentation](https://next-auth.js.org/getting-started/introduction)

## orders

- `GET orders/` - gets all the orders
- `POST orders/` - creates an order

## process

- `POST process/update` - updates the process of a request/reimbursement
  - Use cases: when admin rejects/orders; mentor rejects/approves; student cancels/recalls
  - body params: `{netID, requestID, comment, status}`
  - there might be an issue where updating the process doesn't update the total expenses so I hard coded it to zero for the demo -> started fixing by adding a expense field in the Request model, but not a lot of testing has been done to it

## project

- `POST project/` - create a new project (need to be improved)
- `POST project/get` - returns all the project associated to a user

  - body params: `{netID}`

- `POST project/[projectNum]` - returns a project based on query parameter of `[projectNum]`

## request-form

- `POST request-form/` - creates a new request form
  - body params: `{dateNeeded, projectNum, studentEmail, additionalInfo, items with fields: {description, url, partNumber, quantity, unitPrice, upload, vendorID}}`
- `POST request-form/get` - returns the requests in a project that is associated to a user
  - body params: `{netID}`
- `POST request-form/update`
  - body params: `{requestID, requestDetails - fields that's updated}`

## test

- `GET test/` - creates some sample data including the roles

## user

- `GET /user`- returns a list of all users (needed for the admin to see all students)
- `POST /user` - creates a new user
  - body params: `{firstName, lastName, email, responsibilities?, roleID}`
- `GET user/[id]` - returns a user based on query parameter of `[id]`

## vendor

- `GET /vendor` - creates the list of vendors
- `GET /vendor/get` - returns a list of all the vendors
