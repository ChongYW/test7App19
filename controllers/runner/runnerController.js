const User = require('../../models/userModel');
const passport = require('passport');
const validator = require('validator');
const mongoose = require('mongoose');
const paginate = require('express-paginate');

const dashboardPage = (req, res) => {
    res.render('runner/dashboard');
}

const profilePage = (req, res) => {
    const user = req.user;
    res.render('runner/profile', { user });
}

const updateProfile = async (req, res) => {
    let isValid = true;

    try {
        const user = req.user;

        const {
            password,
            phone,
            email,
        } = req.body;

        if (password && !validator.isLength(password, { min: 6 })) {
            isValid = false;
            req.flash('error', 'Password must be at least 6 characters long.');
        }

        if (phone) {
            if (phone.length < 11 || phone.length > 12 || !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
                isValid = false;
                req.flash('error', 'Invalid phone number.');
            }

            const userPhoneAvailable = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } });
            if (userPhoneAvailable) {
                isValid = false;
                req.flash('error', 'Phone already registered');
            }
        }


        if (email) {
            if (!validator.isEmail(email)) {
                isValid = false;
                req.flash('error', 'Invalid email.');
            }

            const userEmailAvailable = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
            if (userEmailAvailable) {
                isValid = false;
                req.flash('error', 'Email already registered');
            }
        }

        if (isValid) {
            // Check if the password field is empty
            if (password) {

                try {
                    await new Promise((resolve, reject) => {
                        user.setPassword(password, (err) => {
                            if (err) {
                                console.error(err);
                                req.flash('error', 'Error updating password.');
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });

                    await user.save();

                } catch (error) {
                    console.log(error);
                    return res.redirect('/runner/profile');
                }
            }

            if (phone || email) {
                let updatedField = {};

                if (phone) {
                    updatedField.phone = phone;
                }

                if (email) {
                    updatedField.email = email;
                }

                const updatedProfile = await User.findByIdAndUpdate(
                    user._id,
                    updatedField,
                    { new: true }
                );

                await updatedProfile.save();

            }

            req.flash('success', 'Profile updated successfully!');

        } else {

            // Render the edit form with the input values if there's an issue
            return res.render('runner/profile', {
                user: {
                    _id: user._id,
                    username: user.username,
                    password, // Note: For security reasons, you might not want to show the existing password in the form
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                }
            });

        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

    // req.flash('success', 'Profile updated successfully!');
    return res.redirect('/runner/profile');
};

const logout = (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
}

module.exports = {
    dashboardPage,
    profilePage,
    updateProfile,

    logout,
}