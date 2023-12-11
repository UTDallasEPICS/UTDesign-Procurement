These are the APIs that we have done
There are some things listed in the .docx file that might have been done already so please make sure there are no duplicated methods, codes, etc.

## auth

`[...nextauth].ts` - This is the fake-authentication guided by the [next-auth documentation](https://next-auth.js.org/getting-started/introduction)

## orders

- `GET orders/` - gets all the orders
- `POST orders/` - creates an order
- `GET orders/get` - gets the orders placed for a request

## process

- `POST process/update` - updates the process of a request/reimbursement
  - Use cases: when admin rejects/orders; mentor rejects/approves; student cancels/recalls
  - body params: `{netID, requestID, comment, status}`
  - there might be an issue where updating the process doesn't update the total expenses so I hard coded it to zero for the demo -> started fixing by adding a expense field in the Request model, but not a lot of testing has been done to it

## project

- `POST project/` - create a new project (need to be improved)
- `GET project/` - gets all projects from the database
- `POST project/get` - returns all the project associated to a user

  - body params: `{netID}`

- `POST project/[projectNum]` - returns a project based on query parameter of `[projectNum]`
- `POST project/deactivate/delete` - updates a project with a deactivation date given a project number
- `POST project/update` - updates information in project. (includes, totalExpenses, ProjectNum, ProjectTitle, startingBudget, sponsorCompany, and additonalInfo)

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
- `GET user/get` - gets a user given their first and last name

## vendor

- `GET /vendor` - creates the list of vendors
- `GET /vendor/get` - returns a list of all the vendors

## worksOn
- `GET /worksOn` - gets all worksOn entries from the database
- `POST /worksOn` - creates a new worksOn entry for a user and project
- `POST /worksOn/deactivate` - deactivates user in project (make current project user a past user) by updating endDate in worksOn
- `GET /worksOn/currentProjects` - gets all the current projects of a user (returns worksOn entries of user with no end date, so ongoing)
- `GET /worksOn/pastUsers` - gets all the previous users on a project (returns worksOn entries of users with an end date that isn't null)
- `GET /worksOn/currentUsers/` - gets all the current users of a project, returns both works on entries and users given a projectID 

## reimbursement-form
- `GET /reimbursement-form` - gives the projects and reimbursements associated with a user
- `POST /reimbursement-form` - creates a new reimbursement entry, new reimbursement items for every component in the submission, and updates the status of the reimbursement to under review after a student submits the reimbursement form
- ` /reimbursement-form/update` - updates fields in a reimbursement entry, a reimbursement item in that entry, and the status of the reimbursement (status is optional param)
