const User = require('../../models/userModel');
const passport = require('passport');
const validator = require('validator');

// const createUser = async (req, res) => {
//     try {
//       // Hardcoded user data
//       const hardcodedUser = {
//         username: 'userB1',
//         password: '111111',
//         phone: '01234567892',
//         email: 'userB1@email.com',
//         role: 'userB',
//         status: 'active',
//       };
  
//       // Create a new user object with hardcoded data
//       const newUser = new User(hardcodedUser);
  
//       // Use passport-local-mongoose's register method to create a new user
//       await User.register(newUser, hardcodedUser.password);
  
//       // Respond based on your application's needs
//       res.status(201).json({ message: 'User registered successfully.' });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };

const createUserPage = (req, res) => {
  res.render('admin/createUser');
}

const createUser = async (req, res) => {
  let isValid = true;
  const {
    username,
    password,
    phone,
    email,
    role,
    status
  } = req.body;

  const usernameRegex = /^[a-zA-Z0-9]+$/; // Regex to allow only alphanumeric characters

  if (!validator.isLength(username, { min: 3, max: 20 }) || !validator.matches(username, usernameRegex)) {
    isValid = false;
    req.flash('error', 'Invalid username, please make sure the username only contains alphanumeric characters with no spaces!');
  }

  if (!validator.isLength(password, { min: 6 })) {
    isValid = false;
    req.flash('error', 'Password must be at least 6 characters long.');
  }

  if (phone.length < 11 || phone.length > 12 || !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
    isValid = false;
    req.flash('error', 'Invalid phone number.');
  }

  if (!validator.isEmail(email)) {
    isValid = false;
    req.flash('error', 'Invalid email.');
  }

  const allowedRoleValue = ['admin', 'userB', 'userC'];
  if (!allowedRoleValue.includes(role)) {
    isValid = false;
    req.flash('error', 'Invalid role.');
  }

  const allowedStatusValue = ['active', 'inactive', 'pending', 'blacklist'];
  if (!allowedStatusValue.includes(status)) {
    isValid = false;
    req.flash('error', 'Invalid status.');
  }

  const userEmailAvailable = await User.findOne({ email: email.trim() });
  const userPhoneAvailable = await User.findOne({ phone: phone.trim() });
  const userNameAvailable = await User.findOne({ username: username.trim() });

  if (!userEmailAvailable && !userNameAvailable && isValid) {
    try {
      const newUser = new User({
        username: username,
        phone: phone,
        email: email,
        role: role,
        status: status
      });

      await User.register(newUser, password);

      req.flash('success', 'User created successfully!');
    } catch (error) {
      req.flash('error', error.message);
    }
  } else if (userNameAvailable && isValid) {
    req.flash('error', 'Username already registered');
  } else if (userPhoneAvailable && isValid) {
    req.flash('error', 'Phone already registered');
  } else if (userEmailAvailable && isValid) {
    req.flash('error', 'Email already registered');
  }

  // Render the view with the input values if there's an issue
  return res.render('admin/createUser', {
    username,
    password,
    phone,
    email,
    role,
    status
  });
};

const dashboardPage = (req, res) => {
    res.render('admin/dashboard');
}

const profilePage = (req, res) =>{
  res.render('admin/profile');
}

const userListPage = async (req, res) =>{
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10; // Adjust this value based on your preference
    const skip = (page - 1) * perPage;

    let query = {};
    const searchQuery = req.query.search;
    const searchField = req.query.searchField;

    if (searchQuery && searchField) {
      // If there's a search query and a selected search field, filter users accordingly
      query = {
        [searchField]: new RegExp(searchQuery, 'i'), // 'i' makes it case-insensitive
      };
    }

    const users = await User.find(query).skip(skip).limit(perPage);

    // Calculate pagination links
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / perPage);
    const pagination = {
      prev: page > 1 ? `/admin/userList?page=${page - 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
      next: page < totalPages ? `/admin/userList?page=${page + 1}&search=${searchQuery || ''}&searchField=${searchField || ''}` : null,
      current: page,
      totalPages: totalPages,
    };

    if (users.length === 0) {
      req.flash('warning', `No user found based on the input "${searchQuery}" for the field "${searchField}".`);
    }

    res.render('admin/userList', { users, pagination, searchQuery, searchField });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const editUserPage = async (req, res) =>{
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    res.render('admin/editUser', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const editUser = async (req, res) => {
  let isValid = true;

  try {
    const userId = req.params.userId;
    const existingUser = await User.findById(userId);

    const {
      username,
      password,
      phone,
      email,
      role,
      status
    } = req.body;

    const usernameRegex = /^[a-zA-Z0-9]+$/; // Regex to allow only alphanumeric characters

    if (!validator.isLength(username, { min: 3, max: 20 }) || !validator.matches(username, usernameRegex)) {
      isValid = false;
      req.flash('error', 'Invalid username, please make sure the username only contains alphanumeric characters with no spaces!');
    }

    if (password && !validator.isLength(password, { min: 6 })) {
      isValid = false;
      req.flash('error', 'Password must be at least 6 characters long.');
    }

    if (phone.length < 11 || phone.length > 12 || !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
      isValid = false;
      req.flash('error', 'Invalid phone number.');
    }

    if (!validator.isEmail(email)) {
      isValid = false;
      req.flash('error', 'Invalid email.');
    }

    const allowedRoleValue = ['admin', 'userB', 'userC'];
    if (!allowedRoleValue.includes(role)) {
      isValid = false;
      req.flash('error', 'Invalid role.');
    }

    const allowedStatusValue = ['active', 'inactive', 'pending', 'blacklist'];
    if (!allowedStatusValue.includes(status)) {
      isValid = false;
      req.flash('error', 'Invalid status.');
    }

    const userEmailAvailable = await User.findOne({ email: email.trim(), _id: { $ne: userId } });
    const userPhoneAvailable = await User.findOne({ phone: phone.trim(), _id: { $ne: userId } });
    const userNameAvailable = await User.findOne({ username: username.trim(), _id: { $ne: userId } });

    if (!userEmailAvailable && !userNameAvailable && isValid) {
      // Check if the password field is empty
      if (!password) {
        // If it's empty, use the existing password
        req.body.password = existingUser.hash; // Assuming the password hash is stored in 'hash' field
      } else {
        // If it's not empty, update the password using setPassword method
        try {
          await new Promise((resolve, reject) => {
            existingUser.setPassword(password, (err) => {
              if (err) {
                console.error(err);
                req.flash('error', 'Error updating password.');
                reject(err);
              } else {
                resolve();
              }
            });
          });
        } catch (error) {
          return res.redirect('/admin/editUser/' + userId);
        }
      }

      // Update user data in the database based on the submitted form data (req.body)
      try {
        await existingUser.save();
        await User.findByIdAndUpdate(userId, req.body);

        req.flash('success', 'User updated successfully!');
        res.redirect('/admin/userList');
      } catch (error) {
        console.error(error);
        req.flash('error', 'Error saving user.');
        res.redirect('/admin/editUser/' + userId);
      }
    } else if (userNameAvailable && isValid) {
      req.flash('error', 'Username already registered');
      res.redirect('/admin/editUser/' + userId);
    } else if (userPhoneAvailable && isValid) {
      req.flash('error', 'Phone already registered');
      res.redirect('/admin/editUser/' + userId);
    } else if (userEmailAvailable && isValid) {
      req.flash('error', 'Email already registered');
      res.redirect('/admin/editUser/' + userId);
    } else {
      // Render the edit form with the input values if there's an issue
      res.render('admin/editUser', {
        user: {
          _id: userId,
          username,
          password, // Note: For security reasons, you might not want to show the existing password in the form
          phone,
          email,
          role,
          status
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Move this to "/userList/edit/:userId" when is done, and if is edit own profile will not able to delete it self.
const deleteUser = async (req, res) =>{
  try {
    const userId = req.params.userId;
    // Remove user from the database
    await User.findByIdAndDelete(userId);
    res.redirect('/admin/userList');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const deleteEditUser = async (req, res) =>{
  try {
    const userId = req.params.userId;
    // Remove user from the database
    await User.findByIdAndDelete(userId);
    res.redirect('/admin/userList');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const logout = (req, res) =>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
}

module.exports = {
  createUserPage,
  createUser,
  dashboardPage,
  profilePage,

  userListPage,
  editUserPage,
  editUser,
  deleteUser,
  deleteEditUser,

  logout,
}