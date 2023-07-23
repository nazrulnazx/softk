'use strict';
const {DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');


const SwitchBoardModel = () => {

  class SwitchBoard extends Model {
    /**
    * Helper method for defining associations.
    * This method is not a part of Sequelize lifecycle.
    * The `models/index` file will call this method automatically.
    */
    static associate(models) {
      // define association here
    }
  }

  SwitchBoard.init({
    // Model attributes are defined here
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    label: {
      type: DataTypes.STRING
    },
    color: {
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING,
    }
  }, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'switchboard' // We need to choose the model name
  });

  // the defined model is the class itself
  if(SwitchBoard === sequelize.models.User){
    console.info('SwitchBoard model established');
  }

  return SwitchBoard;
};

module.exports = SwitchBoardModel();


