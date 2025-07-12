# UTDesign-Procurement

> [!CAUTION]
> READ EVERYTHING BEFORE STARTING ON THE PROJECT!!!

## Project Background

The current process for managing procurement paperwork submitted by students from EPICS, Capstone, and UTD Makerspace is outdated and inefficient. The workflow involves students filling out Excel sheets and emailing them to their mentors for review. Mentors then either approve the form and forward it to the administrator, Oddrun Mahaffey, for order placement or rejection, providing the student with a reason for the rejection. To streamline this process and make it more convenient for all parties involved, the objective is to create a centralized UTD Procurement Manager website where the entire procedure can be completed online. The web application will primarily benefit students engaged in Capstone, Senior Design, and EPICS projects by simplifying their procurement process and enabling more effective financial management. Furthermore, project mentors and UTDesign staff will experience the advantages of reduced email correspondence and a more streamlined approach to handling requests and budgets, making the system more efficient for all involved parties.

## Project Introduction

### Conceptual Overview

- This project seeks to digitalize the process of part and reimbursement requests for ECS Senior Design and EPICS students.
- Currently, requests are managed through Excel sheets, emails, and in-person meetings, so the website will facilitate communication digitally and present financial information in a user-friendly format.
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

<!-- TO DISCUSS: is this section up to date at all? if so, it should probably be decomposed into gh issues instead of being here -->

## ✅ To-do list (After FALL 2023) ✅

### Front-end

- Add form validation to make sure input values follow type requirements.
- Complete remaining TODOs for Orders, Projects & Order History, and Request Form pages.
- Make sure all work adheres to the UTD guidelines.

### Back-end

- Continue developing API endpoints and integrating them with the front-end to provide full functionality of the application. APIs to work on: [Backend_APIs.docx](https://github.com/UTDallasEPICS/UTDesign-Procurement/raw/main/docs/Backend_APIs.docx)
- Update the list of APIs done so far with the new add/delete orders APIs. (docs/api.md)
- Integrate cloud software to store uploaded request/reimbursement files in the cloud (DB Updates Page & Student View of Request Form).
- Improve code by implementing type-checking and error handling, and resolve any bugs/TODO comments in code/APIs from previous semesters.



---

## 🛠️ Setting up local development environment  🛠️

### 🔗 Install Pre-requisites 🔗

You must have the following tools installed:

- [VS Code](https://code.visualstudio.com/download) - recommended code editor
- [Node.js](https://nodejs.org/en/download/) - needed for running the app locally
- [Git](https://git-scm.com/) - version control system
  - Helpful reference guide: [Git Installing Guide & Customizing](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [GitHub Desktop](https://desktop.github.com/) - optional, provides a GUI to interact with Git repositories
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) - optional, provides a GUI to interact with the database

Before continuing, verify that you have `git`, `node` (Node.js), and `npm` (package manager for Node.js) installed correctly by typing in your terminal: `git --version` and `npm --version`.

If you haven't learned how to use the terminal, please do so first to your respective operating system. Some basic commands are `cd`, `pwd`, and `mkdir`.

### Clone Repository

#### 😎 Using Git CLI (Recommended) 😎

- Find a folder to save this repository and go there using your terminal. For example mine is saved in `C:\Isaac\Programming`.
- In your terminal, write `git clone https://github.com/UTDallasEPICS/UTDesign-Procurement.git` or the SSH link if you have that set up. Sign in to GitHub if asked.
- Cloning a repository should create a folder for you inside the folder the terminal is in, so don't make a folder like "UTDesign Procurement"


#### 😑 Using GitHub Desktop 😑

Clone a repository by clicking `File > Clone Repository` and finding it through GitHub.com or through URL tabs.


### 💾 Set Up Database 💾

This project uses MySQL as the database where all application data is stored. On **Windows**, you'll run MySQL **directly** on your computer. On **macOS**, you'll run MySQL **in a Docker container** on your computer.

> [!TIP]
> For more info about Docker, see ['What is Docker?'](https://github.com/UTDallasEPICS/Guides/blob/main/tooling/docker_wsl_setup.md#what-is-docker) on the [EPICS Guide](https://github.com/UTDallasEPICS/Guides) repo.
>
> For a rough overview of SQL and more info about MySQL and Prisma, check out [this page](https://github.com/UTDallasEPICS/Guides/blob/main/architecture_and_systems/databases.md) from the [EPICS Guide](https://github.com/UTDallasEPICS/Guides) repo.

#### Setup on Windows

Download [MySQL](https://www.mysql.com/downloads/), then follow along with the installation instructions in [this video](https://youtu.be/5OdVJbNCSso?t=142). You don't need to watch the whole video, just the section on installing MySQL.

> [!WARNING]
> **REMEMBER THE PASSWORD** that you used to create your database! (and make sure you do not use special characters). You'll need it to continue with setup later.

#### Setup on macOS

Docker is a tool that allows you to run applications like MySQL in 'containers' on your computer. Running MySQL in Docker is preferred as opposed to running MySQL on your computer directly because it is easier to set up and provides isolation between any other MySQL instances you may have on your computer. On Windows, setting up Docker is more of a hassle so we only recommend it on macOS.

Install [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/).

Once Docker Desktop is installed and running on your computer, open a terminal to the **procurement-manager** folder, then run `docker compose up -d` to start your database.

In the Docker Desktop app, you should see a new Docker container running. In the future, you can run the database server by pressing the Start button on the container in Docker Desktop, or running `docker compose up -d` in the terminal.

### 📦 Install Dependencies 📦

Many software projects, including this one, use a number of 'dependencies' to help with developing the application. A dependency is a piece of pre-written code (often called a 'package' or 'library') that provides specific functionality your project needs, so you don't have to write everything from scratch.

For example, instead of writing hundreds of lines of code to create buttons, forms, and navigation bars, we use 'react-bootstrap' which gives us pre-built, professional-looking UI components. This lets us focus on writing code specific to the project rather than reinventing the wheel on things that other developers have built before.

To install the dependencies, create a new terminal in the editor and run `cd procurement-manager/` to make sure that the terminal is in the **procurement-manager** folder (the project itself) and run `npm install` or `npm i`. This will install all the packages as specified in our `package.json` file.

### 💾 Configure Environment 💾

> [!NOTE]
> The steps in the [database setup](#-database-setup-) section need to be complete before continuing with environment configuration.

7. Make a copy of the **.env.example** in the **procurement-manager** folder and rename the copy to **.env**.
8. In the **.env** file, update the line beginning with `DATABASE_URL=`.

    - On **Windows**, replace `YOUR_MYSQL_ROOT_PASSWORD` with the password you set when initially setting up MySQL.
    - On **macOS**, replace `YOUR_MYSQL_ROOT_PASSWORD` with `password`.

9. Open a terminal and change directory to the **procurement-manager** directory by running `cd procurement-manager`. The next step requires you to be in the **procurement-manager** directory.

- To sync your database with the project schema, run `npx prisma migrate dev`.

The `schema.prisma` file under the `prisma` folder has the schema setup and can be edited to change the database.
After making any changes to the database schema, running `npx prisma migrate dev` will also update the database.

> [!TIP]
> Some more documentation regarding this is provided here: [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

If you installed MySQL Workbench, you can use it to manually add some data into the tables and view changes done to the database. You can also run `npx prisma studio` instead of using MySQL Workbench to see the database through a locally-hosted web interface developed by Prisma.


### 1️⃣ more thing: 1️⃣

- In the terminal, enter `openssl rand -base64 32` which will generate random characters. Copy those characters.
- In the **.env** file, replace `"EXAMPLE_NEXTAUTH_SECRET"` with the random characters you copied.
- (Only for external servers) If setting up the repository in an environment where it's not being accessed on `localhost`, change the `NEXTAUTH_URL` value to match the external URL.

      - More documentation on this option is provided here: https://next-auth.js.org/configuration/options#nextauth_url

- Change the `NODEMAILER_PASSWORD` to be `"nnft zpaq rooq iwkq"`. This allows the Upload Files page to email error files to admins.
<!-- TO DISCUSS: we really need to invalidate this app specific password and remove it from the README - anyone who has it can send emails on behalf of the utd procurement manager email :skull: -->

### 😁 Finally!!! 😁

- Making sure you are still in the **procurement-manager** folder, run `npm run dev` which runs the website.
- In your browser, go to [http://localhost:3000/api/test](http://localhost:3000/api/test). This creates all the sample data to run the project.
- Finally, go to the website at [http://localhost:3000](http://localhost:3000).
- 🎉🎉 GOOD LUCK AND HAVE FUN! 🎉🎉

#### Sample Login Credentials

- Student: `abc000000`
- Mentor: `def000000`
- Admin: `ghi000000`

---

## Figma

This contains the UI mockups of the app and is located in the /docs folder.

## Workflow Diagrams

These are located in the /docs folder.

## Docs

The **/docs** folder contains various documents on the design and schemas of the app, including documentation on APIs. These should be looked at.

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

Extensions can add features to VS Code that make working with this project easier. When opening this project in VS Code, you may see a notification prompt like this one, allowing you to install all these recommended extensions with one click. If you missed the prompt, you can open the extensions pane in VS Code and install each extension manually.

![Screenshot of VS Code prompt asking if user wants to install recommended extensions](https://github.com/user-attachments/assets/e6f47e4f-8da9-4e2b-8226-1827f927de01)

- **Prisma** - formatting and snippets for Prisma
- **GitLens** - lets you see who last edited code in your editor, includes other helpful Git-related features
- **CodeSnap** - if you want to take screenshots of code
- **Auto Close Tag, Auto Rename Tag** - good for quickly editing the HTML/component tags
- **ES7+ React/Redux/React-Native Snippets** - quickly create components
- **ESLint** - shows unused or errors in your code, may need some customizing and research (we should have done a configuration for the project so everybody has the same formatting)
- **Live Share** - incredibly useful! it's like Google Docs but for coding
- **Prettier** - awesome code formatting
- **Thunder Client** - good for testing API and alternative to Postman

---

> Although this was a new project in SPRING 2023, there was a previous version of this project from past semesters. We are constantly trying to improve from their mistakes so that the reset button for this project won't be pressed again. Please do not have duplicated code and resources since this is what the previous version of this project had and document your code as much as you can. I know that some of our code does not have the same format of documentations, some are made by me, and others used a documentation generator, but we tried to explain our code to you nonetheless. Please do the same for others as well. Good luck team!
> -- Isaac (SPRING 2023)
