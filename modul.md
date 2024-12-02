# Todolist API with Authentication using Typescript, Express, and PostgreSQL

- Initialize node
  ```
  npm init -y
  ```
- Install the required package

  ```
  npm install express body-parser jsonwebtoken bcryptjs sequelize pg pg-hstore dotenv

  npm install @types/express @types/body-parser @types/jsonwebtoken @types/bcryptjs @types/node typescript ts-node-dev sequelize-cli --save-dev
  ```

- Initialize Typescript
  ```
  npx tsc --init
  ```
- Update package.json
  ```json
  "scripts": {
      "start": "ts-node-dev src/server.ts",
      "build": "tsc"
  },
  ```
- Update tsconfig.json
  ```json
  {
    "compilerOptions": {
      "target": "ES6",
      "module": "commonjs",
      "rootDir": "./src",
      "outDir": "./dist",
      "strict": true,
      "esModuleInterop": true
    },
    "include": ["src/**/*"]
  }
  ```
- Create project structure

  ```

  todolist-express/
  │
  ├── src/
  │ ├── controllers/
  │ ├── middleware/
  | ├── migrations/
  | ├── seeders/
  │ ├── models/
  | │ └── index.ts
  │ ├── routes/
  │ ├── config/
  │ │ └── config.ts
  │ ├── app.ts
  │ └── server.ts
  ├── .env
  └── package.json

  ```

- Create Credentials for project

  ```

  DATABASE_NAME=todolist
  DATABASE_USER=your_db_user
  DATABASE_PASSWORD=your_db_password
  DATABASE_HOST=localhost
  SECRET_KEY=your_secret_key

  ```

- Load env variable to config.ts

  ```js
  import dotenv from 'dotenv';

  dotenv.config();

  export default {
  database: process.env.DATABASE_NAME as string,
  username: process.env.DATABASE_USER as string,
  password: process.env.DATABASE_PASSWORD as string,
  host: process.env.DATABASE_HOST as string,
  dialect: 'postgres' as const,
  secretKey: process.env.SECRET_KEY as string,
  };
  ```

- Load Config to connect database in `src/models/index.ts`

  ```js
  import { Sequelize } from "sequelize";
  import config from "../config/config";

  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      dialect: config.dialect,
    }
  );

  export default sequelize;
  ```

- Create app.ts

  ```js
  import express from "express";
  import bodyParser from "body-parser";

  declare module 'express-serve-static-core' {
    interface Request {
        user?: {
        id: string;
        };
    }
    }

  const app = express();

  app.use(bodyParser.json());

  export default app;
  ```

- Create server.ts

  ```js
  import dotenv from "dotenv";
  dotenv.config();

  import app from "./app";
  import sequelize from "./models/index";

  const PORT = process.env.PORT || 3000;

  const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log("Database connected!");
      await sequelize.sync();
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  };

  startServer();
  ```

- Test run the project
  ```
  npm start
  ```
- Create User Models in `src/models/user.ts`

  ```js
  import { DataTypes, Model, Optional } from 'sequelize';
  import sequelize from './index';

  interface UserAttributes {
  id: number;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  }

  interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

  class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  }

  User.init(
  {
      id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      },
      username: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
      },
      password: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      },
      createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      },
      updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      },
  },
  {
      tableName: 'users',
      sequelize,
  }
  );

  export default User;
  ```

- Create Todo Models in `src/models/todo.ts`

  ```js
  import { DataTypes, Model, Optional } from 'sequelize';
  import sequelize from './index';
  import User from './user';

  interface TodoAttributes {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
  }

  interface TodoCreationAttributes extends Optional<TodoAttributes, 'id'> {}

  class Todo extends Model<TodoAttributes, TodoCreationAttributes> implements TodoAttributes {
  public id!: number;
  public title!: string;
  public completed!: boolean;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  }

  Todo.init(
  {
      id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      },
      title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      },
      completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      },
      userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      },
      createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      },
      updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      },
  },
  {
      tableName: 'todos',
      sequelize,
  }
  );

  Todo.belongsTo(User, {
  foreignKey: 'userId',
  targetKey: 'id',
  });

  export default Todo;
  ```

- Create Controller for User in `src/controllers/userController`

  ```js
  import { Request, Response } from "express";
  import bcrypt from "bcryptjs";
  import jwt from "jsonwebtoken";
  import User from "../models/user";
  import config from "../config/config";

  const SECRET_KEY = config.secretKey;

  export const register = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      res.status(400).json({ message: "Invalid data" });
    }
  };

  export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  };
  ```

- Create Controller for Todo in `src/controllers/todoController`

  ```js
  import { Request, Response } from "express";
  import Todo from "../models/todo";

  export const getTodos = async (req: Request, res: Response) => {
    const todos = await Todo.findAll({
      where: { userId: Number(req.user?.id) },
    });
    res.json(todos);
  };

  export const createTodo = async (req: Request, res: Response) => {
    const { title } = req.body;
    const newTodo = await Todo.create({
      title,
      completed: false,
      userId: Number(req.user?.id),
    });
    res.status(201).json(newTodo);
  };

  export const updateTodo = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    const todo = await Todo.findByPk(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (title) todo.title = title;
    if (completed !== undefined) todo.completed = completed;

    await todo.save();
    res.json(todo);
  };

  export const deleteTodo = async (req: Request, res: Response) => {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await todo.destroy();
    res.status(204).send();
  };
  ```

- Create middleware for authentication in `src/middleware/auth.ts`

  ```js
  import { Request, Response, NextFunction } from 'express';
  import jwt from 'jsonwebtoken';
  import config from '../config/config';

  const SECRET_KEY = config.secretKey;

  export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
      return res.status(401).json({ message: 'Access denied' });
  }

  try {
      const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
      req.user = { id: decoded.userId };
      next();
  } catch (err) {
      res.status(400).json({ message: 'Invalid token' });
  }
  };

  ```

- Create routing for user in `src/routes/userRoutes.ts`

  ```js
  import { Router } from "express";
  import { register, login } from "../controllers/userController";

  const router = Router();

  router.post("/register", register);
  router.post("/login", login);

  export default router;
  ```

- Create routing for todo in `src/routes/todoRoutes.ts`

  ```js
  import { Router } from "express";
  import {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  } from "../controllers/todoController";
  import { authenticate } from "../middleware/auth";

  const router = Router();

  router.get("/", authenticate, getTodos);
  router.post("/", authenticate, createTodo);
  router.put("/:id", authenticate, updateTodo);
  router.delete("/:id", authenticate, deleteTodo);

  export default router;
  ```

- Update app.ts to include routes

  ```js
  import express from 'express';
  import bodyParser from 'body-parser';
  import todoRoutes from './routes/todoRoutes';
  import userRoutes from './routes/userRoutes';

  declare module 'express-serve-static-core' {
  interface Request {
      user?: {
      id: string;
      };
  }
  }


  const app = express();

  app.use(bodyParser.json());
  app.use('/todos', todoRoutes);
  app.use('/users', userRoutes);

  export default app;

  ```

- Run It
  ```
  npm start
  ```
- Test and Create documentatation using POSTMAN
