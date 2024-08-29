# UTDesign-Procurement

## READ EVERYTHING BEFORE STARTING ON THE PROJECT!!!

## Project Background

The current process for managing procurement paperwork submitted by students from EPICS, Capstone, and UTD Makerspace is outdated and inefficient. The workflow involves students filling out Excel sheets and emailing them to their mentors for review. Mentors then either approve the form and forward it to the administrator, Oddrun Mahaffey, for order placement or reject it, providing the student with a reason for the rejection. To streamline this process and make it more convenient for all parties involved, the objective is to create a centralized UTD Procurement Manager website where the entire procedure can be completed online. The web application will primarily benefit students engaged in Capstone, Senior Design, and EPICS projects by simplifying their procurement process and enabling more effective financial management. Furthermore, project mentors and UTDesign staff will experience the advantages of reduced email correspondence and a more streamlined approach to handling requests and budgets, making the system more efficient for all involved parties.

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

### Debug & Merge The 3 Branches (dev/suhas, search, nishant/manit)

### Front-end

- Update Login Page for UTD SSO Integration.
- Implement Reimbursement Form In Student View.
- Add form validation to make sure input values follow type requirements.
- Enhance UI, test, and fix the Database Updates Page.
- Enhance UI, test, and fix the request form page (Student View).
- Complete remaining TODOs for Orders, Projects & Order History, and Request Form pages.
- Make sure all work adheres to the UTD guidelines.

### Back-end

- Implement UTD SSO (Single Sign-On) feature for user authentication.
- Continue developing API endpoints and integrating them with the front-end to provide full functionality of the application. APIs to work on: [Backend_APIs.docx](https://github.com/UTDallasEPICS/UTDesign-Procurement/raw/main/docs/Backend_APIs.docx)
- Update the list of APIs done so far with the new add/delete orders APIs. (docs/api.md)
- Integrate cloud software to store uploaded request/reimbursement files in the cloud (DB Updates Page & Student View of Request Form).
- Improve code by implementing type-checking and error handling, and resolve any bugs/TODO comments in code/APIs from previous semesters.

### Notes

Commits have not been made to the main branch due to bugs in different files of the code. The commits are spread across a few branches. Debugging first, and then merging all the branches is ideal. (dev/suhas, search, nishant/manit)
dev/suhas: functional datePicker, add/delete order features, clickable item links, student request card can be edited if rejected (in progress, needs API to save the updated data), add/delete item features (in progress, need to create API and save the added item), and minor debugging.
search: The search feature is nearing completion; however, it requires final bug fixes and comprehensive API call testing. Additionally, implement a filter for task status to enhance functionality.
nishant/manit: Student view other button is done and vendor tag functionality is properly implemented in both student and admin view. Reject and accept buttons are implemented but buggy in admin view. API request for approval for admin view is implemented but untested as admin view in buggy. Reason is unknown for a bug in admin view but potentially because of an api call. In the prisma file vendorStatus, vendorEmail, and vendorURL are properly implemented with no bugs.

### User Workflows

- Student
  Able to request reimbursement of funds with the reimbursement form (TODO) and the ordering of parts with the request form. Also able to
  view requests made in the Orders page.
  The Student opens the Request Form page and fills it out, then press submit.
  Reimbursement Form. (TODO)
- Mentor
  Role: Views requests made by the student on the Orders page and can either approve or deny the request to go to the admin.
- Admin
  Role: Views requests approved by the mentor and can review request orders, edit order request information, add shipment details, and view
  the history of previous projects and
  orders. They can also edit information in the DB
- In the orders page, the admin can edit the request by pressing the edit button, enabling the admin to add/remove shipping details and
  order details.
- In the Projects and Order history page, the admin can view the history of previous projects and orders and edit them by pressing the edit
  button.
- In the Database Updates page, the admin can add/delete users and projects (TODO). They are also able to upload files by clicking the
  Upload Files button.

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
9. (Mac Only) Run this command in the terminal to set up the intial docker container `docker run -d -e MYSQL_ROOT_PASSWORD=<password> -p 3306:3306 mysql mysqld --lower_case_table_names=1` (refer to this [video](https://youtu.be/piekR2i6nRQ) if you are having difficulties) **(ensure the `<password>` is replaced with your mySQL root password)**
10. To sync your database with the project schema type `npx prisma migrate dev` (make sure your in the procurement-manager folder).

Mac users will see a new docker container in docker desktop and you can run the database server by pressing the start button in the future.

The prisma file under the prisma folder has the schema setup and can be edited to change the database.
After making any changes to the database, running `npx prisma migrate dev` will also update the database

You can also do `npx prisma studio` instead of using mySQL Workbench to see the database through Prisma.

> Some more documentation regarding this is provided here: [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### 1️⃣ more thing: 1️⃣

11. In the terminal, enter `openssl rand -base64 32` which will generate random characters and copy it.
12. In the **.env** file, below the DATABASE_URL type: `NEXTAUTH_SECRET="randomcode"` and paste the randome characters in the randomcode.
    > This is what makes the fake authentication work
    > An example .env file can be found in /docs

_NEW THING:_ 13. Add this:
`NODEMAILER_EMAIL="utdesign.procurementmanager@gmail.com"`
`NODEMAILER_PASSWORD="nnft zpaq rooq iwkq"`
This allows the Upload Files page to email error files to admins.

### 😁 Finally!!! 😁

14. Making sure you are still in the **procurement-manager** folder, type `npm run dev` which runs the website
15. In your browser, type `localhost:3000/api/test`. This creates all the sample data to run the project.
16. Finally go to the website in `localhost:3000`.
17. 🎉🎉 GOOD LUCK AND HAVE FUN! 🎉🎉

---

## Figma

This contains the UI mocksups of the app and is located in the /docs folder

## Workflow Diagrams

These are located in the /docs folder.

## Docs

The /docs folder contains various documents on the design and schemas of the app, including documentation on APIs. These should be looked at.

## ⚡ Resources ⚡

- [Prisma Crash Course](https://www.youtube.com/watch?v=RebA5J-rlwg)
- [Next.js Crash Course](https://youtu.be/mTz0GXj8NN0)
- [React.js Crash Course](https://www.youtube.com/watch?v=w7ejDZ8SWv8)
- [Basic Terminal Commands](https://www.youtube.com/watch?v=IVquJh3DXUA)

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
