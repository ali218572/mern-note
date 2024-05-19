import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user";
import bcrypt from "bcrypt";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  try {
    if (!authenticatedUserId) {
      throw createHttpError(401, "User not authenticated");
    }

    // Use async/await (preferred)
    const user = await UserModel.findById(authenticatedUserId).select("email");

    // Or use .then()
    // UserModel.findById(authenticatedUserId).select("email")
    //   .then((user) => {
    //     if (!user) {
    //       throw createHttpError(404, "User not found"); // Optional: Check for not found user
    //     }
    //     res.status(200).json(user);
    //   })
    //   .catch(next);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

interface signUpBody {
  username: string;
  email: string;
  password: string;
}

export const signUp: RequestHandler<
  unknown,
  unknown,
  signUpBody,
  unknown
> = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      throw createHttpError(400, "username, email and password are required");
    }

    const existingUsername = await UserModel.findOne({ username }).exec();
    if (existingUsername) {
      throw createHttpError(409, "username already exists");
    }
    const existingEmail = await UserModel.findOne({ email }).exec();
    if (existingEmail) {
      throw createHttpError(409, "email already exists");
    }
    const passwordHashed = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const newUser = await UserModel.create({
      username,
      password: passwordHashed,
      email,
    });
    req.session.userId = newUser._id;
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};
interface signInBody {
  username: string;
  password: string;
}

export const login: RequestHandler<
  unknown,
  unknown,
  signInBody,
  unknown
> = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      throw createHttpError(400, "username and password are required");
    }
    const user = await UserModel.findOne({ username })
      .select("+password +email")
      .exec();
    if (!user) {
      throw createHttpError(401, "Invalid credentials");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw createHttpError(401, "Invalid credentials");
    }
    req.session.userId = user._id;
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
