//Menotr will either approve or reject request for tiem and provide a comment as to why
//this information needs to be sent to the student (status update)
//only approved request by mentor reaches admin
//admin approves or declines this information is then sent to student and mentor withe comments
//admin also tells students to pickup when ready

// GET for mentors
//mentors would be assigned or view only specific project id's
/// filter Processes for status === UNDER_REVIEW && NOT CANCELLED, get projectID from requestID

// GET for admins
// filter Process for status === APPROVED
// admin can see every process that is approved by mentors

// IF PROCESS IS CANCELLED DO PATCH/PUT REQUEST - prob used by students
// find Process
// change status of Process to CANCELLED

// IF PROCESS IS APPROVED BY ADMIN
// create an order and put in database
// ??? ask Oddrun and Navaneeth about how creating a new Order into database will work
export default function handler() {}
