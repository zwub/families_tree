import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../dbConfigs/dbConfig.js';


const Family = sequelize.define('Family', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    familyName: {
        type: DataTypes.STRING,
        allowNull: false,
    
        },
    fatherId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    motherId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    parent: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Families',
            key: 'id'
        }
    }
});




export default Family;
