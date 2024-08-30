import cron from 'node-cron';
import User from '../Models/userModel.js';
import { Sequelize } from 'sequelize';

//schedule the job to run authomatically at Semptember 1 00:00 time
cron.schedule('0 0 1 9 *', async () => {
    try {
        // Increment the year for all users if the isGraduate atribute is false
        await User.update(
            { year: Sequelize.literal('year + 1') }, 
            { where: { isGraduated: false } } 
        );

        // Find users in relevant departments whose year exceeds 5
        const usersToGraduate = await User.findAll({
            where: {
                department: { [Sequelize.Op.in]: ['Software', 'Electrical', 'Hydraulics'] },
                year: { [Sequelize.Op.gt]: 5 },
                isGraduated: false
            }
        });

        // Update isGraduated status for these users
        for (const user of usersToGraduate) {
            await user.update({ isGraduated: true });
        }

        console.log('User graduation statuses and years updated successfully.');
    } catch (error) {
        console.error('Error updating graduation status:', error);
    }
});
