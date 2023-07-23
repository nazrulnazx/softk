const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');


const UserModel = () => {

  class User extends Model {
    /**
    * Helper method for defining associations.
    * This method is not a part of Sequelize lifecycle.
    * The `models/index` file will call this method automatically.
    */
    static associate(models) {
      // define association here
    }
  }

  User.init({
    // Model attributes are defined here
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING
    },
    phone_code: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.INTEGER
    }
  }, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'user' // We need to choose the model name
  });

  // the defined model is the class itself
  if(User === sequelize.models.User){
    console.info('User model established');
  }

  return User;
};

module.exports = UserModel();
