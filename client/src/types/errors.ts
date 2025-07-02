export class ApiError extends Error {
  constructor(public status: number, public response: any) {
    super(response?.message || "An error occured");
  }
}
