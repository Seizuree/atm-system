# ATM System

## Overview

This is a simple ATM (Automated Teller Machine) system implemented in JavaScript. The system allows users to register accounts, log in, deposit and withdraw money, transfer funds, and track their transaction history. Additionally, the system includes security features such as PIN hashing, account locking after failed login attempts, and debt tracking for insufficient fund transfers.

## Features

- **User Registration:** Create an account with a 4-digit PIN.
- **Secure Login:** Accounts are protected using hashed PINs.
- **Deposits and Withdrawals:** Users can deposit money and withdraw up to $1000 per day.
- **Transfers:** Users can transfer money to other users; if funds are insufficient, a debt is created.
- **Transaction History:** Users can view their past transactions.
- **Account Locking:** After three failed login attempts, the account is locked.
- **Debt Management:** Users can owe money when transferring funds without sufficient balance.
- **Unit Testing:** Jest tests validate key functionalities.

## Installation

### Prerequisites

- Node.js installed
- npm installed

### Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/Seizuree/atm-system.git
   cd atm-system
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

1. Start the ATM system:
   ```sh
   sh start.sh
   ```
2. Enter commands to interact with the system:

   | Command                        | Description                        |
   | ------------------------------ | ---------------------------------- |
   | `register <username> <pin>`    | Register a new account             |
   | `login <username>`             | Log in to an account               |
   | `deposit <amount>`             | Deposit money                      |
   | `withdraw <amount>`            | Withdraw money (max $1000 per day) |
   | `transfer <username> <amount>` | Transfer money to another user     |
   | `history`                      | View transaction history           |
   | `balance`                      | Check balance and debt             |
   | `logout`                       | Log out of the system              |
   | `exit`                         | Exit the ATM system                |

## File Structure

```
├── src/
│   ├── account.js  # Account handling
│   ├── atm.js      # ATM operations
│   ├── database.js # Database storage
│   ├── main.js     # CLI interface
│   ├── security.js # PIN security
│   ├── utils.js    # Utility functions
│
├── database/
│   ├── database.json       # Persistent storage for accounts
│   ├── test-database.json  # Separate database for testing
│
├── tests/
│   ├── account.test.js    # Tests for account creation and login
│   ├── transaction.test.js # Tests for deposits and withdrawals
│   ├── transfer.test.js    # Tests for money transfers and debt handling
│
├── package.json           # Project dependencies and scripts
├── README.md              # Documentation
```

## Security

- **Hashed PINs:** User PINs are hashed using bcrypt before storage.
- **Failed Login Attempts:** After three incorrect PIN attempts, the account is locked.
- **Debt Handling:** Users can owe money if they attempt to transfer funds they do not have.

## Running Tests

To run the test suite:

```sh
sh test.sh
```

This runs Jest tests for account creation, login, transactions, and transfers.

## Future Improvements

- Implement a GUI for better user experience.
- Add multi-factor authentication for enhanced security.
- Support different currencies and exchange rates.
- Introduce account recovery options.

## License

This project is open-source and available for use under the MIT License.
