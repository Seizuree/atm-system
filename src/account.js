import Security from './security.js'
import Database from './database.js'
import { getCurrentTimestamp } from './utils.js'

class Account {
  constructor(username, pin) {
    if (!/^\d{4}$/.test(pin))
      throw new Error('PIN must be numbers and exactly 4 digits.')
    this.username = username
    this.hashedPin = Security.hashPin(pin)
    this.balance = 0
    this.transactionHistory = []
    this.dailyWithdrawn = 0
    this.debt = 0
    this.failedAttempts = 0
    this.locked = false
  }

  verifyPIN(inputPin) {
    if (this.locked) throw new Error('Account is locked.')
    if (Security.comparePin(inputPin, this.hashedPin)) {
      this.failedAttempts = 0
      Database.saveAccount(this)
      return true
    } else {
      this.failedAttempts += 1

      if (this.failedAttempts >= 3) {
        this.locked = true
      }

      Database.saveAccount(this)
      if (this.locked) {
        throw new Error('Account is locked due to multiple incorrect attempts.')
      }

      return false
    }
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('Deposit must be positive.')

    if (this.debt > 0) {
      let debtPayment = Math.min(this.debt, amount)
      this.debt -= debtPayment
      amount -= debtPayment

      for (const user of Database.getAllAccounts()) {
        if (this.hasDebtTo(user.username)) {
          user.balance += debtPayment
          user.logTransaction(`Debt paid by ${this.username}: +$${debtPayment}`)
          Database.saveAccount(user)
          console.log(
            `${this.username} paid $${debtPayment} to ${user.username}`
          )
          break
        }
      }

      this.logTransaction(`Debt paid: -$${debtPayment}`)
    }

    if (amount > 0) {
      this.balance += amount
      this.logTransaction(`Deposit: +$${amount}`)
    }

    Database.saveAccount(this)
  }

  withdraw(amount) {
    if (amount > 1000) throw new Error('Exceeds daily withdrawal limit.')
    if (this.balance < amount) throw new Error('Insufficient balance.')
    this.balance -= amount
    this.dailyWithdrawn += amount
    this.logTransaction(`Withdraw: -$${amount}`)
    Database.saveAccount(this)
  }

  logTransaction(detail) {
    this.transactionHistory.push({ time: getCurrentTimestamp(), detail })
  }

  getHistory() {
    return this.transactionHistory
      .map((t) => {
        const date = new Date(t.time)
        const formattedTime =
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(date.getDate()).padStart(2, '0')} ` +
          `${String(date.getHours()).padStart(2, '0')}:${String(
            date.getMinutes()
          ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`

        return `${formattedTime} - ${t.detail}`
      })
      .join('\n')
  }

  hasDebtTo(user) {
    let totalDebt = 0
    let totalPaid = 0

    for (const t of this.transactionHistory) {
      if (t.detail.includes(`Debt created to ${user}:`)) {
        totalDebt += parseFloat(t.detail.split(': $')[1]) // Extract amount
      }
      if (t.detail.includes(`Debt paid:`)) {
        totalPaid += parseFloat(t.detail.split(': -$')[1]) // Extract amount
      }
    }

    return totalDebt > totalPaid // Only return true if debt remains
  }
}

export default Account
