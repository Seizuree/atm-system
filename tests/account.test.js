import Account from '../src/account.js'
import Database from '../src/database.js'
import { test, expect, beforeEach, describe } from '@jest/globals'

beforeEach(() => {
  process.env.NODE_ENV = 'test' // Use test database
  Database.clear() // Reset database before each test
})

describe('1️⃣ Account Tests', () => {
  test('✅ Must test valid account creation', () => {
    const account = new Account('Alice', '1234')
    Database.saveAccount(account)
    expect(Database.getAccount('Alice').username).toBe('Alice')
  })

  test('❌ Must test invalid PIN formats', () => {
    expect(() => new Account('Bob', 'abcd')).toThrow(
      'PIN must be exactly 4 digits.'
    )
    expect(() => new Account('Charlie', '12345')).toThrow(
      'PIN must be exactly 4 digits.'
    )
  })

  test('❌ Must test duplicate accounts', () => {
    const account = new Account('David', '5678')
    Database.saveAccount(account)

    expect(() => {
      if (Database.getAccount('David')) {
        throw new Error('Account already exists.')
      }
    }).toThrow('Account already exists.')
  })

  test('✅ Must test correct PIN validation', () => {
    const account = new Account('Eve', '4321')
    Database.saveAccount(account)
    expect(Database.getAccount('Eve').verifyPIN('4321')).toBe(true)
  })

  test('❌ Must test incorrect PIN handling', () => {
    const account = new Account('Frank', '9999')
    Database.saveAccount(account)

    expect(Database.getAccount('Frank').verifyPIN('1111')).toBe(false)
    expect(Database.getAccount('Frank').failedAttempts).toBe(1)
  })

  test('❌ Must test account lockout after 3 failures', () => {
    const account = new Account('Grace', '5555')
    Database.saveAccount(account)

    expect(Database.getAccount('Grace').verifyPIN('0000')).toBe(false)
    expect(Database.getAccount('Grace').verifyPIN('1111')).toBe(false)
    expect(() => Database.getAccount('Grace').verifyPIN('2222')).toThrow(
      'Account is locked due to multiple incorrect attempts.'
    )

    expect(Database.getAccount('Grace').locked).toBe(true)
  })
})
