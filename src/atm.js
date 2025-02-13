import Account from './account.js'
import Database from './database.js'

class ATM {
  constructor() {
    this.currentUser = null
  }

  register(username, pin) {
    if (Database.getAccount(username))
      throw new Error('Account already exists.')
    const account = new Account(username, pin)
    Database.saveAccount(account)
    return 'Account created successfully.'
  }

  login(username, rl, callback) {
    if (this.currentUser) {
      console.log(`Error: ${this.currentUser.username} is currently logged in.`)
      callback()
      return
    }

    const account = Database.getAccount(username)

    if (!account) {
      console.log('Error: Account not found.')
      callback()
      return
    }

    rl.question('Enter PIN: ', (pin) => {
      try {
        if (!account.verifyPIN(pin)) {
          console.log('Error: Incorrect PIN.')
          callback()
          return
        }

        this.currentUser = account
        console.log(`Welcome ${username}!\nBalance: $${account.balance}`)

        let creditList = []
        for (const user of Database.getAllAccounts()) {
          if (user.debt > 0 && user.hasDebtTo(username)) {
            creditList.push(`${user.username}: $${user.debt}`)
          }
        }

        if (creditList.length > 0) {
          creditList.forEach((credit) => console.log(`Credit from ${credit}`))
        }
      } catch (error) {
        console.log(`Error: ${error.message}`)
      }

      callback()
    })
  }

  deposit(amount) {
    this.#requireLogin()
    if (isNaN(amount)) return 'Invalid deposit amount.'
    this.currentUser.deposit(amount)
    return `Deposited $${amount}\nCurrent balance: $${this.currentUser.balance}`
  }

  withdraw(amount) {
    this.#requireLogin()
    this.currentUser.withdraw(amount)
    return `Withdrew $${amount}\nRemaining balance: $${this.currentUser.balance}`
  }

  transfer(targetUser, amount, rl, callback) {
    this.#requireLogin()

    if (isNaN(amount)) return 'Invalid transfer amount.'

    let targetAccount = Database.getAccount(targetUser)

    if (!targetAccount) {
      console.log(`Creating account for ${targetUser}...`)

      rl.question(`Set a PIN for ${targetUser}: `, (newPin) => {
        if (!/^\d{4}$/.test(newPin)) {
          console.log('Error: PIN must be exactly 4 digits.')
          callback()
          return
        }

        targetAccount = new Account(targetUser, newPin)
        Database.saveAccount(targetAccount)

        this.#processTransfer(targetUser, targetAccount, amount)
        callback()
      })
    } else {
      this.#processTransfer(targetUser, targetAccount, amount)
      callback()
    }
  }

  #processTransfer(targetUser, targetAccount, amount) {
    let transferredAmount = 0

    if (this.currentUser.balance < amount) {
      const debtAmount = amount - this.currentUser.balance
      transferredAmount = this.currentUser.balance
      this.currentUser.debt += debtAmount

      if (transferredAmount > 0) {
        targetAccount.deposit(transferredAmount)
      }

      this.currentUser.balance = 0
      this.currentUser.logTransaction(
        `Transfer to ${targetUser}: -$${transferredAmount}`
      )
      this.currentUser.logTransaction(
        `Debt created to ${targetUser}: $${debtAmount}`
      )

      console.log(`Transferred $${transferredAmount} to ${targetUser}`)
      console.log(`Remaining balance: $${this.currentUser.balance}`)
      console.log(`Debt created: $${debtAmount} to ${targetUser}`)
    } else {
      this.currentUser.withdraw(amount)
      targetAccount.deposit(amount)
      this.currentUser.logTransaction(`Transfer to ${targetUser}: -$${amount}`)
      console.log(`Transferred $${amount} to ${targetUser}`)
    }

    Database.saveAccount(this.currentUser)
    Database.saveAccount(targetAccount)
  }

  history() {
    this.#requireLogin()
    return this.currentUser.getHistory()
  }

  logout() {
    console.log(`Goodbye ${this.currentUser.username}!`)
    this.currentUser = null
    return
  }

  #requireLogin() {
    if (!this.currentUser) throw new Error('No user logged in.')
  }

  balance() {
    this.#requireLogin()
    console.log(`Current Balance: $${this.currentUser.balance}`)
    if (this.currentUser.debt > 0) {
      console.log(`Debt: $${this.currentUser.debt}`)
    } else {
      console.log('No outstanding debt.')
    }
  }
}

export default ATM
