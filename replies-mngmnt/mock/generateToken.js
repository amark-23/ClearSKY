const jwt = require('jsonwebtoken');

const token = jwt.sign(
    {
        id: 1,
        role: 'instructor',
        username: 'testInstructor',
        email: 'instructor@example.com'
    },
    'supersecretkey123',
    { expiresIn: '1h' }
);

console.log('Your mock instructor token:\n');
console.log(token);
