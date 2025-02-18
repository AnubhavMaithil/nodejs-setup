const { hash } = require("bcryptjs");
const { AdminModel } = require("../models/admin/admin.model");
const { getHashPassword } = require("./getPassword.password");

const adminRegister = async () => {
    try {
        const admin = await AdminModel.findOne({
            email: process.env.ADMIN_EMAIL,
        });
        if (admin) return console.log("Admin already registered.");
        const newAdmin = await AdminModel.create({
            username: process.env.ADMIN_USERNAME,
            firstname: process.env.ADMIN_FIRSTNAME,
            lastname: process.env.ADMIN_LASTNAME,
            email: process.env.ADMIN_EMAIL,
            password: await getHashPassword(process.env.ADMIN_PASSWORD),
        });
        if (!newAdmin) return console.log("Register field.");
        console.log("Admin register successfully.!");
    } catch (error) {
        console.log(error);
    }
};
module.exports = { adminRegister };
