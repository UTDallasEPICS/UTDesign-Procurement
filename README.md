# UTDesign-Procurement

## READ EVERYTHING BEFORE STARTING ON THE PROJECT!!!

## 🔗 Pre-requisites for running the app locally 🔗

You must have the following tools installed:

- [VS Code (recomended editor)](https://code.visualstudio.com/download)
- [Node.js (needed for npm)](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/)
- [Git Installing Guide & Customizing](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Docker (For Mac users only!)](https://docs.docker.com/get-docker/)

### 💾 Database stuff 💾

#### Watch these first (just the installation part):

- [BroCode](https://youtu.be/5OdVJbNCSso?t=142)
- [Mosh (The mac setup will be slightly different than in this video)](https://youtu.be/7S_tz1z_5bA?t=292)
- **IMPORTANT: REMEMBER THE PASSWORD (and make sure you do not use special characters)**

#### 🔗 Download Links: 🔗

- [mySQL (our database)](https://www.mysql.com/downloads/)
- [mySQL Workbench (work with database)](https://dev.mysql.com/downloads/workbench/)

### Also if you want, Github Desktop instead of Git will be easier to use.

- [Github Desktop](https://desktop.github.com/)

---

## 🛠️ Setting up local environment 🛠️

1. Install all the required softwares specified above.
2. Check if you have git and npm installed by typing in your terminal: `git --version` and `npm --version`
3. If you haven't learned how to use the terminal, please do so first to your respective operating system. Some basics are: `cd` and `mkdir`

### Cloning Repository

#### 😎 Using Git (Recommended) 😎

4. Find a folder to save this repository and go there using your terminal. For example mine is saved in `C:\Isaac\Programming`
   In your terminal, write `git clone https://github.com/UTDallasEPICS/UTDesign-Procurement.git` or the SSH link if you have that set up. Sign in to Github if asked.

   Cloning a repository should create a folder for you inside the folder the terminal is in, so don't make a folder like "UTDesign Procurement"

5. Open the repository in VS Code

#### 😑 Using GitHub Desktop 😑

4. Clone a Repository by clicking `File > Clone Repository` and finding it through Github.com or through URL tabs.
5. Open the repository in VS Code

### 📦 Dependencies setup 📦

Dependencies are the packages used to create the project.

6. To install the dependencies, in VS Code, create a new terminal in the editor and run `cd procurement-manager/` to make sure that the terminal is in the **procurement-manager** folder (the project itself) and run `npm install` or `npm i`. This will install all the packages as specified in our `package.json` file.

### 💾 Database Setup 💾

Downlading and setting up mySQL is required first. mySQL Workbench is used then to manually add some data into the tables and can be used to further view changes done to the database.

7. First, we have to create a **.env** file inside of the **procurement-manager** folder.
8. In the **.env** file, type `DATABASE_URL="mysql://root:password@localhost:3306/procurement"` but change the password to your password when initially setting up mySQL.
9. (Mac Only) Run this command in the terminal to set up the intial docker container `docker run -d -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 mysql mysqld --lower_case_table_names=1` (refer to this [video](https://youtu.be/piekR2i6nRQ) if you are having difficulties)
10. To sync your database with the project schema type `npx prisma migrate dev` (make sure your in the procurement-manager folder).

Mac users will see a new docker container in docker desktop and you can run the database server by pressing the start button in the future.

The prisma file under the prisma folder has the schema setup and can be edited to change the database.
After making any changes to the database, running `npx prisma migrate dev` will also update the database

You can also do `npx prisma studio` instead of using mySQL Workbench to see the database through Prisma.

> Some more documentation regarding this is provided here: [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### 1️⃣ more thing: 1️⃣

10. In the terminal, enter `openssl rand -base64 32` which will generate random characters and copy it.
11. In the **.env** file, below the DATABASE_URL type: `NEXTAUTH_SECRET="randomcode"` and paste the randome characters in the randomcode.
    > This is what makes the fake authentication work

_NEW THING:_ 12. Add this:
`NODEMAILER_EMAIL="utdesign.procurementmanager@gmail.com"`
`NODEMAILER_PASSWORD="nnft zpaq rooq iwkq"`
This allows the Upload Files page to email error files to admins.

### 😁 Finally!!! 😁

12. Making sure you are still in the **procurement-manager** folder, type `npm run dev` which runs the website
13. In your browser, type `localhost:3000/api/test`. This creates all the sample data to run the project.
14. Finally go to the website in `localhost:3000`.
15. 🎉🎉 GOOD LUCK AND HAVE FUN! 🎉🎉

---

## Project Introduction

### Conceptual Overview

- This project seeks to digitalize the process of part and reimbursement requests for ECS Senior Design and EPICS students.
- Currently, requests are managed through excel sheets, emails, and in-person meetings, so the website will facilitate communication digitally and present financial information in a user-friendly format.
- There are 3 types of users: admins, mentors, and students.
  - Admins are able to process or reject requests, and can modify any data in the UTDesign database relating to users, projects, requests, vendors, departments, and so on.
  - Mentors are able to approve requests which will send those requests to be processed by admins, or reject requests. They cannot edit any request data.
  - Students are able to submit requests but cannot edit requests, unless an admin or mentor rejects one and then students have the option to edit and resubmit.

### Tech Stack

- Frontend: React.js
- Frontend & Backend: TypeScript, Next.js
- Database: MySQL
- Database Connector: Prisma
- Other Tools: Postman (API Testing)

---

## Functional Requirements

### Login Page

- Allows users to sign in with UTD SSO

### Request Form

- Students can fill out request information such as date needed, additional information, and details for each part needed in the request
- Students can also upload files if needed such as design specifications, which will be stored in the cloud

### Reimbursement Form

- Students can fill out reimbursement information such as additional information and details for each part purchased that needs to be reimbursed
- Students are required to upload receipts for verification, which will be stored in the cloud

### Orders & Reimbursements Page

- Single Orders & Reimbursement Page for mentors, but 2 separate pages for students and admins (Orders Page shows requests that need to be ordered)
- For each project a user is in, displays the submitted request data for unprocessed requests/reimbursements
- Students cannot edit submitted data unless the request/reimbursement is rejected, then they can edit and resubmit
- Mentors can approve or reject requests/reimbursements with comments for rejection reasons, but cannot edit the data
- Admins can process requests/reimbursements or reject requests/reimbursements with comments for rejection reasons
- When processing, admin users can edit the data such as by:
  - editing existing request/reimbursement data if needed
  - adding/deleting parts if needed
  - adding other expenses if needed
  - adding/deleting orders (required)

### Projects & Order History Page

- Single Projects & Order History Page for mentors and admins, but only Order History Page for students
- For each project a user is in, displays:
  - project information (project number, title, starting budget, remaining budget)
  - user information (names of the mentors and students in the project)
  - processed request/reimbursement information (were either approved and ordered/reimbursed, or rejected)
- Students and mentors can view this data, but admins can edit the data such as by:
  - changing the status of a request/reimbursement
  - editing comments visible to other users
  - editing existing request/reimbursement data
  - adding/deleting parts
  - adding/deleting orders
  - adding other expenses

### Database Updates Page

- allows admins to upload excel files for adding users, projects, and modifying any data in the UTDesign database

---

## ✅ To-do list (After FALL 2023) ✅

### Front-end

- Update Login Page for UTD SSO Integration.
- Implement Reimbursement Form.
- Design and Implement Database Updates Page.
- Work on improving the UI/UX of the web application based on user feedback and suggestions and resolve any bugs/TODO comments in code from previous semesters.
  - Complete remaining TODOs for Orders Page, Projects & Order History Page, and Request Form
- Keep following UTD guidelines.

### Back-end

- Implement UTD SSO (Single Sign-On) feature for user authentication.
- Continue developing API endpoints and integrating them with the front-end to provide full functionality of the application. APIs to work on: [Backend_APIs.docx](https://github.com/UTDallasEPICS/UTDesign-Procurement/raw/main/docs/Backend_APIs.docx)
  - [Updated List of APIs we did](docs/api.md)
- Implement excel file upload feature for Database Updates Page.
- Integrate cloud software to store uploaded request/reimbursement files in the cloud.
- Data Input for Departments table.
- Finish data input for Vendors from the vendor list in the UTDesign website.
- Improve code by better type-checking and error handling, and resolve any bugs/TODO comments in code/APIs from previous semesters.

## ⚡ Resources ⚡

- [Prisma Crash Course](https://www.youtube.com/watch?v=RebA5J-rlwg)
- [Next.js Crash Course](https://youtu.be/mTz0GXj8NN0)
- [React.js Crash Course](https://www.youtube.com/watch?v=w7ejDZ8SWv8)

### Creating APIs

- [Familiarize using Prisma with Next.js](https://www.youtube.com/watch?v=FMnlyi60avU)
- [Creating API routes in Next.js 13](https://www.youtube.com/watch?v=varePWkGi8Y&t)
- [API Route Handlers in Next.js 13](https://www.youtube.com/watch?v=J4pdHM-oG-s&t)
- [API GET Request](https://youtu.be/GgzWFxIiwK4)
- [Postman API Testing](https://www.youtube.com/watch?v=CLG0ha_a0q8)

## ⚡ Recommended VS Code Extensions ⚡

- Prisma - formatting and snippets for Prisma
- GitLens - lets you see who edited the code
- CodeSnap - if you want to take screenshots of code
- Auto Close Tag, Auto Rename Tag - good for quickly editing the html/component tags
- ES7+ React/Redux/React-Native Snippets - quickly create components
- ESLint - shows unused or errors in your code, may need some customizing and research (we should have done a configuration for the project so everybody has the same formatting)
- **Live Share** - incredibly useful! it's like Google Docs but for coding
- **Prettier** - awesome code formatting
- Thunder Client - good for testing API and alternative to Postman

---

> Although this was a new project in SPRING 2023, there was a previous version of this project from past semesters. We are constantly trying to improve from their mistakes so that the reset button for this project won't be pressed again. Please do not have duplicated code and resources since this is what the previous version of this project had and document your code as much as you can. I know that some of our code does not have the same format of documentations, some are made by me, and others used a documentation generator, but we tried to explain our code to you nonetheless. Please do the same for others as well. Good luck team!
> -- Isaac (SPRING 2023)
