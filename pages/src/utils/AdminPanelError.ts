import { APIError } from 'payload'

/** Class which extends Payload's APIError and ensures that the error is shown in the admin panel. */
export class AdminPanelError extends APIError {
  constructor(message: string, statusCode: number = 400) {
    super(
      message,
      statusCode,
      undefined,
      // isPublic must be true in order for the error to show up in the admin panel
      true,
    )
  }
}
