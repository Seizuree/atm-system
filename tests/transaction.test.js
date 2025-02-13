import { beforeEach, describe, expect, test } from '@jest/globals'
import Account from '../src/account'
import Database from '../src/database'

beforeEach(() => {
  process.env.NODE_ENV = 'test' // Use test database
  Database.clear() // Reset database before each test
})

describe('2️⃣ Transaction Tests', () => {
  test('✅ Must test valid deposits', () => {
    const account = new Account('Henry', '1234')
    account.deposit(500)
    expect(account.balance).toBe(500)
  })

  test('❌ Must test negative amounts', () => {
    const account = new Account('Isla', '5678')
    expect(() => account.deposit(-100)).toThrow('Deposit must be positive.')
  })

  test('✅ Must test large numbers', () => {
    const account = new Account('Jack', '9999')
    account.deposit(1000000)
    expect(account.balance).toBe(1000000)
  })

  test('✅ Must test valid withdrawals', () => {
    const account = new Account('Kevin', '1234')
    account.deposit(1000)
    account.withdraw(500)
    expect(account.balance).toBe(500)
  })

  test('❌ Must test insufficient funds', () => {
    const account = new Account('Liam', '4321')
    expect(() => account.withdraw(300)).toThrow('Insufficient balance.')
  })

  test('❌ Must test daily withdrawal limits', () => {
    const account = new Account('Mia', '5678')
    account.deposit(2000)
    expect(() => account.withdraw(1500)).toThrow(
      'Exceeds daily withdrawal limit.'
    )
  })
})
