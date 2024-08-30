import User from '../Models/userModel.js';
import Family from '../Models/familyModel.js';
import bcrypt from 'bcryptjs';
import express from 'express';
import { Sequelize } from 'sequelize';



// to rigster a new user
export const rigsterUser = async(req, res) => {
    const {id, firstName, lastName, phoneNumber, department, year, gender, priesthood, familyId, role, password, isGraduated, spritualService} = req.body;

    try{
        const isExist = await User.findOne({where: {id: id}});
        if(isExist){
            res.status(401).send({error: 'user already exist'});
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

       const user = await User.create({
        id: id,
        firstName: firstName,
        lastName:lastName,
        password: hashedPassword,
        phoneNumber: phoneNumber,
        department: department,
        year: year,
        gender: gender,
        priesthood:priesthood,
        familyId: familyId,
        role: role,
        isGraduated: isGraduated,
        spritualService: spritualService
       });
       res.status(200).send({message: 'user rigstered successfully'});

    }

    catch(error){
        console.error('unable to rigster the user', error);
        res.status(500).send({error: 'can not rigster'})
    }
}




// to retrieve all user
export const getAllUser = async(req, res) => {
    try{
        const users = await User.findAll();
        res.json(users);
    }
    catch(error){
        console.error('unable to get the users', error);
    }
}





// to retrieve the user find by user's id
export const getUserById = async(req, res) => {
    try{
        const user = await User.findByPk(req.params.id);
        if(!user){
            res.status(404).send({error: 'user not found'});
        }
        else{
            res.json(user);
        }
    }
    catch(error){
        console.error('unable to get the user', error);
        res.status(500).send({error: 'can not get the user'});
    }
}





//to update user's information except role and isAssigned atribute select by id 
export const updateById = async(req, res) => {
    const {id, firstName, lastName, phoneNumber, department, year, gender, priesthood, isAssigned, familyId, role, password, isGraduated, spritualService} = req.body;
    try{
        const user = await User.findByPk(req.params.id);
        if(!user){
            res.status(404).send({error: 'user not found'});
        }

        else{

        if (firstName !== undefined){
            user.firstName = firstName;
        }
        if (lastName !== undefined){
            user.lastName = lastName;
        }
        if (password) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            user.password = hashedPassword;
        }
        if (phoneNumber !== undefined) {
            user.phoneNumber = phoneNumber;
        }
        if (department !== undefined){
            user.department = department;
        }
        if (year !== undefined){
            user.year = year;
        }
        if (gender !== undefined){
            user.gender = gender;
        }
        if (priesthood !== undefined){
            user.priesthood = priesthood;
        }
        if (familyId !== undefined){
            user.familyId = familyId;
        }
        if (isGraduated !== undefined){
            user.isGraduated = isGraduated;
        }
        if (spritualService !== undefined){
            user.spritualService = spritualService;
        }

            await user.save();
            res.status(200).send({message: 'user successfully updated'});
        }
    }
    catch(error){
        console.error('user information is not updated', error);
        res.status(500).send({error: 'unable to update'});
    }
}




//SuperAdmin to update user's role
export const updateRole = async(req, res) => {
    const {role} = req.body;
    try{
        const user = await User.findByPk(req.params.id);
        if(role){
            user.role = role;
        }
        await user.save();
        res.status(200).send({message: 'update user role'});
    }
    catch(error){
        console.error('unable to update role of the user', error);
        res.status(500).send({error: 'unable to change the role'});
    }
}




// to delete the user selected by the user id
export const deleteUserById = async(req, res) => {
    try{
        const user = await User.findByPk(req.params.id);
        if(!user){
            res.status(404).send({error: 'user not found'});
        }
        else{
            await user.destroy();
            res.status(200).send({message: 'user is deleted successfully'});
        }
    }
    catch(error){
        console.error('unable to delete the user');
        res.status(500).send({error: 'unable to delete the user'});
    }
}






export const userDistribute = async (req, res) => {
    try {
        // Step 1: Fetch all unassigned users grouped by department
        const usersByDepartment = {
            Software: [],
            Electrical: [],
            Hydraulics: []
        };

        const users = await User.findAll({
            where: {
                isAssigned: false,
                department: {
                    [Sequelize.Op.in]: ['Software', 'Electrical', 'Hydraulics']
                },
                familyId: null // Only consider users not yet assigned to a family
            }
        });

        // Group users by their department
        users.forEach(user => {
            if (usersByDepartment[user.department]) {
                usersByDepartment[user.department].push(user);
            }
        });

        // Step 2: Distribute users into families
        for (const department of ['Software', 'Electrical', 'Hydraulics']) {
            const usersInDepartment = usersByDepartment[department];

            if (!usersInDepartment || usersInDepartment.length === 0) {
                console.log(`No unassigned users found for department: ${department}`);
                continue; // Skip to the next department if no unassigned users are found
            }

            // Find available families
            const families = await Family.findAll({
                include: [
                    {
                        model: User,
                        as: 'father',
                        required: true // Ensure each family has a father
                    },
                    {
                        model: User,
                        as: 'mother',
                        required: true // Ensure each family has a mother
                    }
                ],
                where: {
                    [Sequelize.Op.and]: [
                        Sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM Users 
                            WHERE Users.familyId = Family.id
                        ) < 5`) // Ensure the family has room for new members (max 5 members, including father and mother)
                    ]
                }
            });

            const numberOfFamilies = families.length;

            if (numberOfFamilies === 0) {
                console.log(`No available families for department: ${department}`);
                continue; // Skip to the next department if no families are found
            }

            // Distribute up to 5 users per family
            let familyIndex = 0;
            while (usersInDepartment.length > 0) {
                const family = families[familyIndex];

                // Calculate how many users this family can still take
                const currentFamilyMembers = await User.count({ where: { familyId: family.id } });
                const availableSlots = 5 - currentFamilyMembers;
                const numberOfUsersToAssign = Math.min(availableSlots, usersInDepartment.length);

                if (numberOfUsersToAssign > 0) {
                    const usersToAssign = usersInDepartment.splice(0, numberOfUsersToAssign);

                    for (const user of usersToAssign) {
                        await user.update({ familyId: family.id});
                    }
                }

                // Move to the next family
                familyIndex = (familyIndex + 1) % numberOfFamilies;

                // Break out of the loop if all families are full
                if (familyIndex === 0 && usersInDepartment.length > 0 && availableSlots === 0) {
                    break;
                }
            }
        }

        res.status(200).json({ message: 'Unassigned users distributed into families successfully' });
    } catch (error) {
        console.error('Error distributing unassigned users into families:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




//to change the family of assigned user to other family
export const assignUserToFamilyById = async (req, res) => {
    const { newFamilyId } = req.body;
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        if (newFamilyId !== undefined) {
            user.familyId = newFamilyId;
            await user.save();
        }
        res.status(200).send({ message: 'User family updated successfully' });
    } catch (error) {
        console.error('Unable to assign a user to the family', error);
        res.status(500).send({ error: 'Unable to assign the user' });
    }
};








//to retrieve unassigned users to family
export const getUnAssignedUsers = async(req, res) => {
    try {
        const unassignedUsers = await User.findAll({
            where: {
                familyId: null
            },
            attributes: ['id', 'firstName', 'lastName', 'department']
        });


        if (unassignedUsers.length === 0) {
            return res.status(404).json({ error: 'No unassigned users found' });
        }
        res.json(unassignedUsers);
    } catch (error) {
        console.error('Error retrieving unassigned users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
