// import cron from 'node-cron';
// import User from '../Models/userModel.js';
// import { Sequelize } from 'sequelize';
// // this job schedule is optional if the value of isGraduated atribute incorrectly filled automatically update to the correct one
// cron.schedule('* * * * *', async () => {
//     try{
//          await User.update(
//             { isGraduated: false },
//             {
//                 where: {
//                     department: { [Sequelize.Op.in]: ['Software', 'Electrical', 'Hydraulics'] },
//                     year: { [Sequelize.Op.lte]: 5 } 
//                 }
//             }
//         );
//         console.log('graduation status is successfully update');
//     }
//     catch(error){
//         console.log('error in updating graduation status', error);
//     }
// })