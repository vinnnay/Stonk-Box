// Simple User model. Expand for authentication, profile, permissions.
class User {
  constructor(username, email) {
    this.username = username;
    this.email = email;
    this.watchlist = [];
    this.journal = [];
  }
}

export default User;