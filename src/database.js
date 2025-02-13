import fs from 'fs'
import Account from './account.js'

// Use a separate test file when running Jest tests
const IS_TEST = process.env.NODE_ENV === 'test'
const FILE_PATH = IS_TEST
  ? './database/test-database.json'
  : './database/database.json'

class Database {
  static loadAccounts() {
    try {
      return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'))
    } catch {
      return {}
    }
  }

  static saveAccounts(accounts) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(accounts, null, 2))
  }

  static getAccount(username) {
    const accounts = this.loadAccounts()
    if (accounts[username]) {
      const data = accounts[username]
      const account = new Account(data.username, '0000')
      Object.assign(account, data)
      return account
    }
    return null
  }

  static saveAccount(account) {
    const accounts = this.loadAccounts()
    accounts[account.username] = {
      username: account.username,
      hashedPin: account.hashedPin,
      balance: account.balance,
      transactionHistory: account.transactionHistory,
      dailyWithdrawn: account.dailyWithdrawn,
      debt: account.debt,
      failedAttempts: account.failedAttempts,
      locked: account.locked,
    }
    this.saveAccounts(accounts)
  }

  static getAllAccounts() {
    return Object.values(this.loadAccounts()).map((data) => {
      const account = new Account(data.username, '0000') // PIN dummy
      Object.assign(account, data)
      return account
    })
  }

  static clear() {
    fs.writeFileSync(FILE_PATH, JSON.stringify({}, null, 2)) // Clear database for tests
  }
}

export default Database
