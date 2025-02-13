import bcrypt from 'bcryptjs'

class Security {
  static hashPin(pin) {
    return bcrypt.hashSync(pin, 10)
  }

  static comparePin(inputPin, hashedPin) {
    return bcrypt.compareSync(inputPin, hashedPin)
  }
}

export default Security
