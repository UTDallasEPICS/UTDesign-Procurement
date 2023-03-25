# Schema Documentation

# User

## Fields:

- **userID** - the unique id; integer
- **netID** - can be parsed from email; string
- **firstName** - given by SSO; string
- **lastName** - given by SSO; string
- **email** - given by SSO; string
- **responsibilites** - ???; string
- **active** - because Oddrun want to see history of projects, this is to show if user is still working in a project or not; boolean
- **roleID** - has a relationship with the **Role** entity; integer
- **deactivationDate** - this is NULL unless active is false; date

## Relationships:

- Role - many-to-one

---

# PreviousRecord

This is needed to keep track of previous projects, the users, and their roles since 

## Fields:

- recordID
- projectID
- roleID
- userID

## Relationships:

---

# Project

This entity/model has the details of a project in UTDesign

## Fields:

- projectID
- projectType
- projectNum
- projectTitle
- startingBudget
- sponsorCompany
- additionalInfo
- activationDate
- deactivationDate
- costCenter

## Relationships:

---

# Request

This entity/model represents the data for each procurement form. (The name might be changed)

## Fields:

- requestID
- projectID
- studentID
- vendorID
- dateNeeded
- justification
- additionalInfo
- dateSubmitted
- status
- dateOrdered
- dateReceived
- dateApproved
- . . . might be more if we are combining **processes** with this

## Relationships:

---

# Item

This entity/model are the items to order listed in the procurement form

## Fields:

- itemID
- requestID
- description
- url
- partNumber
- quantity
- unitPrice
- vendorID
- uploadID

## Relationships:

---

# Order

After the request is process a record of the an order is inserted