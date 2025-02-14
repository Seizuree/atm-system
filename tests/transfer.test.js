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
    const acc1 = atm.register('Nina', '1234')
    const acc2 = atm.register('Oliver', '5678')

    if (acc1 && acc2) {
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
    }
  })

  test('Must test transfers with insufficient funds', (done) => {
    const atm = new ATM()
    const acc1 = atm.register('Paul', '9999')
    const acc2 = atm.register('Quinn', '8888')

    if (acc1 && acc2) {
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
          expect(atm.currentUser.balance).toBe(100)
        })

        done() // Mark test as complete
      })
    }
  })

  test('Must test debt creation', (done) => {
    const atm = new ATM()
    const acc1 = atm.register('Rachel', '5555')
    const acc2 = atm.register('Steve', '4444')

    if (acc1 && acc2) {
      const rachelLoginReadline = {
        question: (_, callback) => callback('5555'),
      }

      const steveLoginReadline = {
        question: (_, callback) => callback('4444'),
      }

      atm.login('Rachel', rachelLoginReadline, () => {
        atm.deposit(100)

        atm.transfer('Steve', 200, steveLoginReadline, () => {
          expect(atm.currentUser.debt).toBe(100)
          expect(atm.currentUser.balance).toBe(0)
        })

        atm.logout()

        atm.login('Steve', steveLoginReadline, () => {
          const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
          expect(atm.currentUser.balance).toBe(100)
          expect(consoleSpy).toHaveBeenCalledWith('Credit from Rachel: $100')
        })

        done() // Mark test as complete
      })
    }
  })

  test('Must test automatic debt repayment', (done) => {
    const atm = new ATM()
    const acc1 = atm.register('Tom', '7777')
    const acc2 = atm.register('Uma', '8888')

    if (acc1 && acc2) {
      const tomLoginReadline = {
        question: (_, callback) => callback('7777'),
      }

      const umaLoginReadline = {
        question: (_, callback) => callback('5555'),
      }

      atm.login('Tom', tomLoginReadline, () => {
        atm.transfer('Uma', 200, umaLoginReadline, () => {
          const currentTom = Database.getAccount('Tom')
          expect(currentTom.debt).toBe(200)

          atm.deposit(200)
        })

        atm.logout()

        atm.login('Uma', umaLoginReadline, () => {
          const currentUma = Database.getAccount('Uma')
          expect(currentUma.balance).toBe(200)
        })
      })

      done()
    }
  })
})
