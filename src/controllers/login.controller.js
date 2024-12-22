const postgre = require('../database')

const loginController = {
    register: async(req, res) => {
        try {
            const { username, password } = req.body
            
            if (!username || !password) {
                return res.status(400).json({msg: "Username and password are required"})
            }

            const sql = 'INSERT INTO login(username, password) VALUES($1, $2) RETURNING *'
            const { rows } = await postgre.query(sql, [username, password])
            
            res.json({msg: "Register successful", data: rows[0]})
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },
    
    login: async(req, res) => {
        try {
            const { username, password } = req.body

            if (!username || !password) {
                return res.status(400).json({msg: "Username and password are required"})
            }

            const sql = 'SELECT * FROM login WHERE username = $1 AND password = $2'
            const { rows } = await postgre.query(sql, [username, password])
            
            if (rows[0]) {
                return res.json({msg: "Login successful", data: rows[0]})
            }
            
            return res.status(401).json({msg: "Invalid username or password"})
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    }
}

module.exports = loginController