import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../dbConfigs/dbConfig.js';


const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    department: {
        type: DataTypes.ENUM('Software', 'Electrical', 'Hydraulics'),
        allowNull: false,
        unique: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false,
        unique: false
    },
    priesthood: {
        type: DataTypes.ENUM('Deacon', 'bishop', 'priest', 'monk'),
        allowNull: true,
        defaultValue: null,
        unique: false
    },
    familyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Families',
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('Admin', 'Student', 'SuperAdmin', 'SuperSuperAdmin'),
        defaultValue: 'student',
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    isGraduated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    //to check is assigned as afather or a mother to the family
    isAssigned:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    spritualService: {
        type: DataTypes.ENUM('Teteki Memran', 'Senbet Tmhrt'),
        allowNull: true,
        defaultValue: null,
        unique: false
    }
});



export default User;
