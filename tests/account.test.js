import ATM from '../src/atm.js'
import Database from '../src/database.js'
import { test, expect, beforeEach, describe, jest } from '@jest/globals'

beforeEach(() => {
  process.env.NODE_ENV = 'test' // Use test database
  Database.clear() // Reset database before each test
})

describe('Account Tests', () => {
  test('Must test valid account creation', () => {
    const atm = new ATM()
    atm.register('Alice', '1234')
    expect(Database.getAccount('Alice').username).toBe('Alice')
  })

  test('Must test invalid PIN formats', () => {
    const atm = new ATM()
    expect(() => atm.register('Bob', 'abcd')).toThrow(
      'PIN must be numbers and exactly 4 digits.'
    )
    expect(() => atm.register('Charlie', '12345')).toThrow(
      'PIN must be numbers and exactly 4 digits.'
    )
  })

  test('Must test duplicate accounts', () => {
    const atm = new ATM()
    atm.register('David', '5678')

    expect(() => atm.register('David', '5678')).toThrow(
      'Account already exists.'
    )
  })

  test('Must test correct PIN validation', (done) => {
    const atm = new ATM()
    atm.register('Eve', '4321') // Create an account

    // Mock the readline interface to simulate user input
    const mockReadline = {
      question: (_, callback) => callback('4321'), // Simulates entering correct PIN
    }

    atm.login('Eve', mockReadline, () => {
      expect(atm.currentUser.username).toBe('Eve') // ✅ User should be logged in
      done()
    })
  })

  test('Must test incorrect PIN handling', (done) => {
    const atm = new ATM()
    atm.register('Frank', '9999')

    const mockReadline = {
      question: (_, callback) => callback('1111'),
    }

    atm.login('Frank', mockReadline, () => {
      // After login, the account's verifyPIN() should have been called.
      // Retrieve the updated account from the database.
      const updatedAccount = Database.getAccount('Frank')

      // Expect that the login attempt failed (currentUser remains null)
      expect(atm.currentUser).toBeNull()

      // Expect that failedAttempts increased to 1
      expect(updatedAccount.failedAttempts).toBe(1)

      done() // Signal Jest that the async test is complete.
    })
  })

  test('Must test account lockout after 3 failures', (done) => {
    const atm = new ATM()
    atm.register('Grace', '5555')

    const mockReadline1 = { question: (_, callback) => callback('0000') } // 1st attempt: wrong PIN
    const mockReadline2 = { question: (_, callback) => callback('1111') } // 2nd attempt: wrong PIN
    const mockReadline3 = { question: (_, callback) => callback('2222') } // 3rd attempt: wrong PIN → should lock

    atm.login('Grace', mockReadline1, () => {
      // After first attempt, no one should be logged in
      expect(atm.currentUser).toBeNull()

      // Second login attempt with wrong PIN
      atm.login('Grace', mockReadline2, () => {
        expect(atm.currentUser).toBeNull()

        // Third login attempt with wrong PIN should lock the account
        atm.login('Grace', mockReadline3, () => {
          const updatedAccount = Database.getAccount('Grace')
          expect(updatedAccount.locked).toBe(true)
          done()
        })
      })
    })
  })

  test('Must prevent logging into another account while logged in', (done) => {
    const atm = new ATM()
    atm.register('David', '1234')
    atm.register('Eve', '4321')

    const mockReadlineDavid = {
      question: (_, callback) => callback('1234'), // Simulate entering correct PIN for David
    }

    // David logs in
    atm.login('David', mockReadlineDavid, () => {
      expect(atm.currentUser.username).toBe('David')
      const mockReadlineEve = {
        question: (_, callback) => callback('4321'), // Simulate entering PIN for Eve
      }

      const consoleSpy = jest.spyOn(console, 'log') // Capture console logs

      // Attempt to login as Eve while David is still logged in
      atm.login('Eve', mockReadlineEve, () => {
        // Ensure an error message was logged
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error: David is currently logged in.'
        )

        // Ensure David is still logged in
        expect(atm.currentUser.username).toBe('David')

        consoleSpy.mockRestore()
        done()
      })
    })
  })

  test('Must check if the account is found', (done) => {
    const atm = new ATM()

    // Create a mock readline object
    const mockReadline = {
      question: (_, callback) => {
        // This should never be called because the account won't be found
        callback('dummy')
      },
    }

    // Spy on console.log to capture output
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    // Attempt to login with a username that does not exist
    atm.login('NonExistentUser', mockReadline, () => {
      // Verify that the error message was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error: Account not found.')
      // Ensure that no user is logged in
      expect(atm.currentUser).toBeNull()

      consoleSpy.mockRestore()
      done()
    })
  })
})
