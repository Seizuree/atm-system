import Account from '../src/account'
import ATM from '../src/atm'
import Database from '../src/database'

import { test, expect, describe, beforeEach, jest } from '@jest/globals'

beforeEach(() => {
  process.env.NODE_ENV = 'test' // Use test database
  Database.clear() // Reset database before each test
})

describe('3️⃣ Transfer Tests', () => {
  test('Must test valid transfers', (done) => {
    const atm = new ATM()
    atm.register('Nina', '1234')
    atm.register('Oliver', '5678')

    const ninaLoginReadline = {
      question: (_, callback) => callback('1234'),
    }

    const oliverLoginReadline = {
      question: (_, callback) => callback('5678'),
    }

    // First, login as Nina
    atm.login('Nina', ninaLoginReadline, () => {
      atm.deposit(1000) // Now this will work because login completed

      // Now, perform the transfer
      atm.transfer('Oliver', 300, oliverLoginReadline, () => {
        const nina = Database.getAccount('Nina')
        const oliver = Database.getAccount('Oliver')

        expect(nina.balance).toBe(700)
        expect(oliver.balance).toBe(300)
        done() // Ensure test completes only after everything runs
      })
    })
  })

  test('Must test transfers with insufficient funds', (done) => {
    const atm = new ATM()
    atm.register('Paul', '9999')
    atm.register('Quinn', '8888')

    const paulLoginReadline = {
      question: (_, callback) => callback('9999'),
    }

    const quinnLoginReadline = {
      question: (_, callback) => callback('8888'),
    }

    // Login as Paul
    atm.login('Paul', paulLoginReadline, () => {
      atm.deposit(100) // Deposit an initial amount

      atm.transfer('Quinn', 200, quinnLoginReadline, () => {
        expect(atm.currentUser.debt).toBe(100)
      })

      atm.logout()

      atm.login('Quinn', quinnLoginReadline, () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
        expect(atm.currentUser.balance).toBe(100)
        expect(consoleSpy).toHaveBeenCalledWith('Credit from Paul: 100')
      })

      done() // Mark test as complete
    })
  })

  test('Must test debt creation', () => {
    const debtor = new Account('Rachel', '5555')
    const creditor = new Account('Steve', '4444')
    Database.saveAccount(creditor)

    debtor.deposit(200) // Rachel has $100
    debtor.withdraw(100) // Withdraw all balance, now $0

    const atm = new ATM()
    atm.currentUser = debtor // Simulate logged-in user
    atm.processTransfer('Steve', creditor, 200) // Tries to send $200

    expect(debtor.debt).toBe(100) // Debt should be created
    expect(debtor.balance).toBe(0) // Balance should remain 0
    expect(creditor.balance).toBe(100) // Only the available $100 is transferred
  })

  test('Must test automatic debt repayment', () => {
    const debtor = new Account('Tom', '7777')
    const creditor = new Account('Uma', '8888')
    Database.saveAccount(creditor)

    // Tom has no money but transfers $200 → Creates debt
    debtor.deposit(100)
    const atm = new ATM()
    atm.currentUser = debtor
    atm.processTransfer('Uma', creditor, 200)

    expect(debtor.debt).toBe(100)
    expect(creditor.balance).toBe(100)

    // Tom deposits $200 → Should repay Uma automatically
    debtor.deposit(100)
    const updatedCreditor = Database.getAccount('Uma')
    expect(debtor.debt).toBe(0)
    expect(updatedCreditor.balance).toBe(200) // Uma received $200

    console.log('Debt repayment test passed.')
  })
})
