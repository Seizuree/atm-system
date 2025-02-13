import { beforeEach, describe, expect, test } from '@jest/globals'
import Account from '../src/account'
import Database from '../src/database'
import ATM from '../src/atm'

beforeEach(() => {
  process.env.NODE_ENV = 'test' // Use test database
  Database.clear() // Reset database before each test
})

describe('Transaction Tests', () => {
  test('Must test valid deposits', (done) => {
    const atm = new ATM()
    atm.register('Henry', '1234')

    // Create a mock readline that simulates the correct PIN input.
    const loginReadline = {
      question: (_, callback) => {
        callback('1234')
      },
    }

    // Log in as Henry
    atm.login('Henry', loginReadline, () => {
      // Now that Henry is logged in, call deposit
      atm.deposit(500)

      // Retrieve updated account from the database
      const account = Database.getAccount('Henry')
      expect(account.balance).toBe(500)

      done()
    })
  })

  test('Must test negative amounts', (done) => {
    const atm = new ATM()
    atm.register('Isla', '5678')

    const loginReadline = {
      question: (_, callback) => {
        callback('5678')
      },
    }

    atm.login('Isla', loginReadline, () => {
      // Now that Isla is logged in, call deposit
      expect(() => atm.deposit(-100)).toThrow('Deposit must be positive.')
      done()
    })
  })

  test('Must test large numbers', (done) => {
    const atm = new ATM()
    atm.register('Ariana', '5678')

    const loginReadline = {
      question: (_, callback) => {
        callback('5678')
      },
    }

    atm.login('Ariana', loginReadline, () => {
      // Now that Ariana is logged in, call deposit
      atm.deposit(1000000)
      expect(atm.currentUser.balance).toBe(1000000)
      done()
    })
  })

  test('Must test valid withdrawals', (done) => {
    const atm = new ATM()
    atm.register('Kevin', '1234')

    const loginReadline = {
      question: (_, callback) => {
        callback('1234')
      },
    }

    atm.login('Kevin', loginReadline, () => {
      atm.deposit(1000)
      atm.withdraw(500)
      expect(atm.currentUser.balance).toBe(500)
      done()
    })
  })

  test('Must test insufficient funds', () => {
    const account = new Account('Liam', '4321')
    expect(() => account.withdraw(300)).toThrow('Insufficient balance.')
  })

  test('Must test daily withdrawal limits', () => {
    const account = new Account('Mia', '5678')
    account.deposit(2000)
    expect(() => account.withdraw(1500)).toThrow(
      'Exceeds daily withdrawal limit.'
    )
  })
})
