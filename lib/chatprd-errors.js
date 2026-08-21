export class ChatPrdUnavailableError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "ChatPrdUnavailableError";
  }
}
