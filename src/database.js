import fs from 'fs'
import Account from './account.js'

// const accounts = {}

const FILE_PATH = './database/database.json'

class Database {
  // static getAccount(username) {
  //   return accounts[username] || null
  // }

  // static saveAccount(account) {
  //   accounts[account.username] = account
  // }

  // static clear() {
  //   Object.keys(accounts).forEach((key) => delete accounts[key])
  // }

  // static getAllAccounts() {
  //   return Object.values(accounts)
  // }

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
}

export default Database
