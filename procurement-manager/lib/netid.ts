/**
 * This function takes an email and validates the netID, if applicable
 * @param email
 * @param requireNetID whether to require a UTD email and NetID (default: true)
 * @returns NetID of the user, or null if no NetID can be found
 * @throws EmailFormatError if NetID is required but cannot be found
 */
export function validateEmailAndReturnNetID(email: string, requireNetID: boolean = true): string | null {
  const netIDFormat = /^[a-zA-Z]{3}\d{6}$/
  const [netID, emailOrg] = email.toLowerCase().split('@')
  let errorStr = ''

  if (emailOrg === 'utdallas.edu') {
    if (netIDFormat.test(netID)) {
      return netID
    }
    else errorStr = 'Invalid netID found from email, should be in the format abc123456'
  }
  else errorStr = 'Invalid email, must have a UTD email address'

  // By now, our netID is invalid - what do we do from here?
  if (requireNetID)
    throw new EmailFormatError(errorStr)
  else
    return null
}

export class EmailFormatError extends Error { }
