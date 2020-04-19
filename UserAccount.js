const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize('esol_corona_tracker', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    // dialectOptions: {
    //     useUTC: false
    // },
    timezone: '+05:30'
})

class UserAccount extends Model {}

UserAccount.init({
    // id: {
    //     type: DataTypes.INTEGER,
    //     autoIncrement: true,
    //     primaryKey: true
    // },
    user_password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    unique_phone_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
}, {
  sequelize, 
  modelName: 'UserAccount',
  tableName: 'user_accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = UserAccount