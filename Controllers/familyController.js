import Family from '../Models/familyModel.js';
import User from '../Models/userModel.js';
import { Sequelize } from 'sequelize';




// to create new family and automatically assign father and mother while it is created
export const createFamily = async (req, res) => {
    const { familyName, parent } = req.body;

    try {
        // Get all users with priesthood 'Deacon' or 'priest'  and (gender 'male' and isAssigned is false and isGraduated is false)
        const eligibleFathers = await User.findAll({
            where: {
                [Sequelize.Op.and]: [
                    {
                        priesthood: {
                            [Sequelize.Op.in]: ['Deacon', 'priest']
                        }
                    },
                    {
                        gender: 'male'
                    },
                    {
                        isAssigned: false
                    },
                    {
                        isGraduated: false
                    }
                ]
            }
        });
        

        if (eligibleFathers.length === 0) {
            return res.status(400).json({ error: 'No eligible fathers available' });
        }

        // Randomly select a father from the eligible fathers
        const randomFatherIndex = Math.floor(Math.random() * eligibleFathers.length);
        const father = eligibleFathers[randomFatherIndex];

        // Get all users with priesthood 'monk' or year >= 3 and (gender 'female' and isAssigned is false and isGraduated is false)
        const eligibleMothers = await User.findAll({
            where: {
                [Sequelize.Op.and]: [
                    {
                        [Sequelize.Op.or]: [
                            { priesthood: 'monk' },
                            { year: { [Sequelize.Op.gte]: 3 } }
                        ]
                    },
                    {
                        gender: 'female'
                    },
                    {
                        isAssigned: false
                    },
                    {
                        isGraduated: false
                    }
                ]
            }
        });

        if (eligibleMothers.length === 0) {
            return res.status(400).json({ error: 'No eligible mothers available' });
        }

        // Randomly select a mother from the eligible mothers
        const randomMotherIndex = Math.floor(Math.random() * eligibleMothers.length);
        const mother = eligibleMothers[randomMotherIndex];
            // Create the new family
            const newFamily = await Family.create({
                familyName,
                fatherId: father.id,
                motherId: mother.id,
                parent
            });
        // Mark the selected father and mother as used and update familyId
        await User.update({ isAssigned: true, familyId: newFamily.id }, { where: { id: father.id } });
        await User.update({ isAssigned: true, familyId: newFamily.id }, { where: { id: mother.id } });
        res.status(201).json({ message: 'Family created successfully', family: newFamily });
    } catch (error) {
        console.error('Unable to create family:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



//to delete specific family selected by family id
export const deleteFamilyById = async (req, res) => {
    try {
        // Find the family to be deleted
        const family = await Family.findByPk(req.params.id);

        if (!family) {
            return res.status(404).send({ error: 'Family not found' });
        }

        // Retrieve the father and mother Id from the family
        const { fatherId, motherId } = family;

        // Update the isAssigned column for the father and mother
        await User.update(
            { isAssigned: false,
                familyId: null
            },
            {
                where: {
                    id: {
                        [Sequelize.Op.in]: [fatherId, motherId]
                    }
                }
            }
        );

        // Delete the family
        await family.destroy();

        res.status(200).send({ message: 'Family successfully deleted' });
    } catch (error) {
        console.error('Unable to delete family:', error);
        res.status(500).send({ error: 'Unable to delete the family' });
    }
};



//to retrieve all family with it's information
export const getAllFamily = async(req, res) =>{
    try{
        const families = await Family.findAll();
        res.json(families);
    }
    catch(error){
        console.log('unable to access the family');
        res.status(500).send({error: 'unable to access the family'});
    }
}





// to retrieve the members of a specific family
export const getFamilyMembers = async (req, res) => {
    try {
        const { id: familyId } = req.params;

        const family = await Family.findOne({
            where: { id: familyId },
            include: [
                {
                    model: User,
                    as: 'father',
                    attributes: ['id', 'firstName', 'lastName', 'department']
                },
                {
                    model: User,
                    as: 'mother',
                    attributes: ['id', 'firstName', 'lastName', 'department']
                },
                {
                    model: User,
                    as: 'members',
                    attributes: ['id', 'firstName', 'lastName', 'department']
                }
            ]
        });

        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        res.json({
            familyName: family.familyName,
            father: family.father,
            mother: family.mother,
            members: family.members
        });
    } catch (error) {
        console.error('Error retrieving family members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





//to update specific family information selected by family id
export const updateFamilyById = async(req, res) => {
    const {familyName, fatherId, motherId, parent} = req.body;
    try{
        const family = await Family.findByPk(req.params.id);
        if(!family){
            res.status(404).send({error: 'family not found'});
        }
        else{
            if(familyName !== undefined){
                family.familyName = familyName;
            }
            if(parent !== undefined){
                family.parent = parent;
            }

            await family.save();
            res.status(200).send({message: 'family information successfully updated'});
        }
    }
    catch(error) {
        console.error('unable to update the family', error);
        res.status(500).send({error: 'unable to update'});
    }
}



// to retrieve specific family selected by the family id
export const getFamilyById = async(req, res) => {
    try{
        const family = await Family.findByPk(req.params.id);
        if(!family){
            res.status(404).send({error: 'family not found'});
        }

        else{
            res.json(family);
        }
    }
    catch(error){
        console.error('unable to get the family', error);
        res.status(500).send({error: 'unable to get the family'});
    }
}





//update the father and mother of a specific family selected by family id
export const updateFatherAndMother = async (req, res) => {
    try {
        const { newFatherId, newMotherId } = req.body; 
        const family = await Family.findByPk(req.params.id);

        if (!family) {
            return res.status(404).json({ message: 'Family not found.' });
        }

        const oldFatherId = family.fatherId;
        const oldMotherId = family.motherId;

        // Find the new father and mother by their IDs if provided
        const newFather = newFatherId ? await User.findByPk(newFatherId) : null;
        const newMother = newMotherId ? await User.findByPk(newMotherId) : null;

        if (newFather) {
            // Ensure the selected user is eligible to be a father
            if (
                (newFather.priesthood !== 'Deacon' || newFather.priesthood !== 'priest') &&
                newFather.gender !== 'male' &&
                newFather.isAssigned === true
            ) {
                return res.status(400).json({ message: 'Selected father is not eligible.' });
            }

            // Update the family with the new father ID
            await family.update({ fatherId: newFather.id });
            await newFather.update({ isAssigned: true, familyId: family.id });
        }

        if (newMother) {
            // Ensure the selected user is eligible to be a mother
            if (
                newMother.gender !== 'female' &&
                (newMother.priesthood !== 'monk' || newMother.year < 3) &&
                newMother.isAssigned === true
            ) {
                return res.status(400).json({ message: 'Selected mother is not eligible.' });
            }

            // Update the family with the new mother ID
            await family.update({ motherId: newMother.id });
            await newMother.update({ isAssigned: true, familyId: family.id });
        }

        // Update the isAssigned attribute for the old father and mother if they have been replaced
        if (oldFatherId && newFather) {
            await User.update(
                { isAssigned: false, familyId: null },
                { where: { id: oldFatherId } }
            );
        }
        
        if (oldMotherId && newMother) {
            await User.update(
                { isAssigned: false, familyId: null },
                { where: { id: oldMotherId } }
            );
        }

        res.status(200).json({ message: 'Family parent assignments updated successfully.' });
    } catch (error) {
        console.error('Error updating father and mother:', error);
        res.status(500).json({ message: 'Error updating family parent assignments.' });
    }
};




