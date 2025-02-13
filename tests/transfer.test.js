import Account from '../src/account'
import ATM from '../src/atm'
import Database from '../src/database'

import { test, expect, describe, beforeEach } from '@jest/globals'

beforeEach(() => {
  process.env.NODE_ENV = 'test' // Use test database
  Database.clear() // Reset database before each test
})

describe('3️⃣ Transfer Tests', () => {
  test('✅ Must test valid transfers', () => {
    const sender = new Account('Nina', '1234')
    const receiver = new Account('Oliver', '5678')
    sender.deposit(1000)
    receiver.deposit(100)

    sender.withdraw(300)
    receiver.deposit(300)

    expect(sender.balance).toBe(700)
    expect(receiver.balance).toBe(400)
  })

  test('❌ Must test transfers with insufficient funds', () => {
    const sender = new Account('Paul', '9999')
    const receiver = new Account('Quinn', '8888')
    sender.deposit(100)

    expect(() => sender.withdraw(500)).toThrow('Insufficient balance.')
  })

  test('✅ Must test debt creation', () => {
    const debtor = new Account('Rachel', '5555')
    const creditor = new Account('Steve', '4444')
    Database.saveAccount(creditor)

    debtor.deposit(200) // Rachel has $100
    debtor.withdraw(100) // Withdraw all balance, now $0

    const atm = new ATM()
    atm.currentUser = debtor // Simulate logged-in user
    atm.processTransfer('Steve', creditor, 200) // Tries to send $200

    expect(debtor.debt).toBe(100) // ✅ Debt should be created
    expect(debtor.balance).toBe(0) // ✅ Balance should remain 0
    expect(creditor.balance).toBe(100) // ✅ Only the available $100 is transferred
  })

  test('✅ Must test automatic debt repayment', () => {
    const debtor = new Account('Tom', '7777')
    const creditor = new Account('Uma', '8888')
    Database.saveAccount(creditor)

    // ❌ Tom has no money but transfers $200 → Creates debt
    debtor.deposit(100)
    const atm = new ATM()
    atm.currentUser = debtor
    atm.processTransfer('Uma', creditor, 200)

    expect(debtor.debt).toBe(100)
    expect(creditor.balance).toBe(100)

    // ✅ Tom deposits $200 → Should repay Uma automatically
    debtor.deposit(200)
    expect(debtor.debt).toBe(0)
    expect(creditor.balance).toBe(200) // ✅ Uma received $200

    console.log('✅ Debt repayment test passed.')
  })
})
