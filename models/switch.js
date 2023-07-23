const {DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');


const SwitchModel = () => {

  class Switch extends Model {
    /**
    * Helper method for defining associations.
    * This method is not a part of Sequelize lifecycle.
    * The `models/index` file will call this method automatically.
    */
    static associate(models) {
      // define association here
    }
  }

  Switch.init({
    // Model attributes are defined here
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    switch_board_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    value: {
      type: DataTypes.INTEGER
    },
    type: {
      type: DataTypes.ENUM,
      values: [
        'switch',
        'regulator',
        'fan'  
      ],
      defaultValue: 'switch',
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
    },
    color: {
      type: DataTypes.STRING,
    }
  }, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'switch' // We need to choose the model name
  });

  // the defined model is the class itself
  if(Switch === sequelize.models.User){
    console.info('Switch model established');
  }

  return Switch;
};

module.exports = SwitchModel();


