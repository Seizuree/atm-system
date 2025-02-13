import ATM from './atm.js'
import readline from 'readline'

const atm = new ATM()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
})

console.log('Welcome to Advanced ATM System')

const askCommand = () => {
  rl.question('> ', async (input) => {
    const [cmd, ...args] = input.split(' ')
    try {
      switch (cmd) {
        case 'register':
          console.log(atm.register(args[0], args[1]))
          break

        case 'login':
          if (!args[0]) {
            console.log('Error: Please provide a username.')
            askCommand()
            return
          }
          atm.login(args[0], rl, askCommand)
          return

        case 'deposit':
          console.log(atm.deposit(parseFloat(args[0])))
          break

        case 'withdraw':
          console.log(atm.withdraw(parseFloat(args[0])))
          break

        case 'transfer':
          atm.transfer(args[0], parseFloat(args[1]), rl, askCommand)
          return

        case 'history':
          console.log(atm.history())
          break

        case 'balance':
          atm.balance()
          break

        case 'logout':
          atm.logout()
          break

        case 'exit':
          console.log('Goodbye!')
          rl.close()
          return

        default:
          console.log('Invalid command.')
      }
    } catch (error) {
      console.log(`Error: ${error.message}`)
    }

    askCommand() // Continue loop after command
  })
}

askCommand()
