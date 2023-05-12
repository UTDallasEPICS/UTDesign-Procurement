# UTDesign-Procurement

## Pre-requisites for running the app locally

You must have the following tools installed:

- VSCode (recomended editor): https://code.visualstudio.com/download
- Node.js (needed for npm): https://nodejs.org/en/download/
- Git: https://git-scm.com/
- (https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### Database stuff:

#### Watch these first (just the installation part):

- BroCode - https://youtu.be/5OdVJbNCSso?t=142
- Mosh - https://youtu.be/7S_tz1z_5bA?t=292
  > IMPORTANT: REMEMBER THE PASSWORD

#### Download Links:

- mySQL (our database): https://www.mysql.com/downloads/
- mySQL Workbench (work with database): https://dev.mysql.com/downloads/workbench/

### Also, using Github Desktop instead of Git will be easier to use.

- Github Desktop: https://desktop.github.com/

---

## Setting up local environment

1. Install all the required softwares specified above.
2. Check if you have git and npm installed by typing in your terminal: `git --version` and `npm --version`
3. If you haven't learned how to use the terminal, please do so first to your respective operating system. Some basics are: `cd` and `mkdir`

### Cloning Repository

#### Using Git (Recommended)

4. Find a folder to save this repository and go there using your terminal. For example mine is saved in `C:\Isaac\Programming`
   In your terminal, write `git clone https://github.com/UTDallasEPICS/UTDesign-Procurement.git` or the SSH link if you have that set up. Sign in to Github if asked.
   > Cloning a repository should create a folder for you so don't make a folder like "UTDesign Procurement"
5. Open the repository in VS Code

#### Using GitHub Desktop:

4. Clone a Repository by clicking `File > Clone Repository` and finding it through Github.com or through URL tabs.
5. Open the repository in VS Code

### Dependencies setup

Dependencies are the packages used to create the project.

6. To install the dependencies, in VSCode, create a new terminal run `cd procurement-manager/` to make sure that the terminal is in the procurement-manager folder (the project itself) and run `npm install` or `npm i`. This will install all the packages as specified in our `package.json` file.

### Database Setup

Downlading and setting up mySQL is required first. mySQL Workbench is used then to manually add some data into the tables and can be used to further view changes done to the database.

7. First, we have to create a **.env** file inside of the **procurement-manager** folder.
8. In the **.env** file, type `DATABASE_URL=`

The prisma file under the prisma folder had the schema setup and can be edited to change the database.
After making any changes to the database, running `npx prisma migrate dev` will update the database

> Some more documentation regarding this is provided here: https://www.prisma.io/docs/concepts/components/prisma-migrate

## To-do list (After SPRING 2023)

- Continue developing API endpoints and integrating them with the front-end to provide full functionality of the application.
- APIs to work on: [final list of API endpoints.docx](https://github.com/UTDallasEPICS/UTDesign-Procurement/files/11426026/final.list.of.API.endpoints.docx)
- Implement the UTD SSO (Single Sign-On) feature for user authentication.
- Input data for Departments table.
- Start working on Orders History page.
- Work on improving the UI design of the web application based on user feedback and suggestions.
- The application still needs to have the feature of the project partner being able to add users, projects, and modify any data in the database.

## Resources

- Prisma: https://www.youtube.com/watch?v=RebA5J-rlwg
- Next.Js: https://youtu.be/mTz0GXj8NN0

### Creating APIs

- https://www.youtube.com/watch?v=FMnlyi60avU
- https://www.youtube.com/watch?v=varePWkGi8Y&t
- https://www.youtube.com/watch?v=J4pdHM-oG-s&t
- https://youtu.be/GgzWFxIiwK4
