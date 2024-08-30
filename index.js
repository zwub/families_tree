import express from 'express';
import sequelize from './dbConfigs/dbConfig.js';
import './cronJobs/atributeUpdate.js';
import './cronJobs/parentUpdate.js'
import './cronJobs/check.js';
import Family from './Models/familyModel.js';
import User from './Models/userModel.js';
import userroute from './Routes/userRoute.js';
import authroute from './Routes/authRoute.js';
import familyroute from './Routes/familyRoute.js';


const app = express();
app.use(express.json());
app.use('/users', userroute);
app.use('/auth', authroute);
app.use('/families', familyroute);


// Relationship between table Families and Ussers

User.belongsTo(Family, { as: 'family', foreignKey: 'familyId' });
Family.belongsTo(User, { as: 'father', foreignKey: 'fatherId' });
Family.belongsTo(User, { as: 'mother', foreignKey: 'motherId' });
Family.hasMany(Family, { as: 'subFamilies', foreignKey: 'parent' });
Family.belongsTo(Family, { as: 'parentFamily', foreignKey: 'parent' });
Family.hasMany(User, { as: 'members', foreignKey: 'familyId' });


const port = process.env.PORT;
sequelize.sync().then(()=>{
    app.listen(port, ()=>{
        console.log(`the server is running on the port ${port}`);
    })
}).catch((error)=>{
    console.error('the server is not running', error);
})

