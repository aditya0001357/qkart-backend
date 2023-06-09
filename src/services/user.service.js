const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const getUserById = async (id) => {
  const user=await User.findOne({"_id":id})

    if(user){
        return user
    }
    return null;
};
const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.OK, "Email already taken");
  }
  const user = await User.create(userBody);
  return user;
};
const getUserAddressById = async (id) => {
  return await User.findOne({ _id: id }, { email: 1, address: 1 });
};

const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();

  return user.address;
};
module.exports = {
  getUserById,
  getUserByEmail,
  createUser,
  getUserAddressById,
  setAddress,
};
const bcrypt = require("bcryptjs");

/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */

/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */


