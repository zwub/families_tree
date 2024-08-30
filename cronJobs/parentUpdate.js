import cron from 'node-cron';
import User from '../Models/userModel.js';
import Family from '../Models/familyModel.js';
import { Sequelize } from 'sequelize';

//schedule the job to run authomatically at Semptember 1 00:00 time
cron.schedule('0 0 1 9 *', async () => {
    try {
        const families = await Family.findAll();

        for (const family of families) {
            const father = await User.findOne({ where: { id: family.fatherId } });
            const mother = await User.findOne({ where: { id: family.motherId } });

            let needsUpdate = false;

            // Replace mother if she is graduated
            if (mother && mother.isGraduated) {
                await mother.update({ isAssigned: false, familyId: family.id });
                needsUpdate = true;

                // Find and assign a new mother
                const eligibleMothers = await User.findAll({
                    where: {
                        [Sequelize.Op.and]: [
                            {
                                [Sequelize.Op.or]: [
                                    { priesthood: 'monk' },
                                    { year: { [Sequelize.Op.gte]: 3 } }
                                ]
                            },
                            { gender: 'female' },
                            { isAssigned: false },
                            { isGraduated: false }
                        ]
                    }
                });

                if (eligibleMothers.length > 0) {
                    const newMother = eligibleMothers[Math.floor(Math.random() * eligibleMothers.length)];
                    await family.update({ motherId: newMother.id });
                    await newMother.update({ isAssigned: true, familyId: family.id });
                }
            }

            // Replace father if he is graduated
            if (father && father.isGraduated) {
                await father.update({ isAssigned: false, familyId: family.id });
                needsUpdate = true;

                // Find and assign a new father
                const eligibleFathers = await User.findAll({
                    where: {
                        [Sequelize.Op.and]: [
                            { priesthood: { [Sequelize.Op.in]: ['Deacon', 'priest'] } },
                            { gender: 'male' },
                            { isAssigned: false },
                            { isGraduated: false }
                        ]
                    }
                });

                if (eligibleFathers.length > 0) {
                    const newFather = eligibleFathers[Math.floor(Math.random() * eligibleFathers.length)];
                    await family.update({ fatherId: newFather.id });
                    await newFather.update({ isAssigned: true, familyId: family.id });
                }
            }
        }

        console.log('Family parent assignments updated successfully.');
    } catch (error) {
        console.error('Error updating family assignments:', error);
    }
});
