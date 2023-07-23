const { Sequelize } = require('sequelize');
const config = require('config');


const connectDB = () => {
    var DB;
    try {

        //Getting DB config
        if (config.has('mariaDb')) {
            DB = config.get('mariaDb');
        } else {
            console.error('Database config not found key "development". ');
        }


        //Setting DB config
        const sequelize = new Sequelize(DB.name, DB.user, DB.password, {
            host: DB.host,
            dialect: 'mariadb' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
        });

        sequelize.authenticate().then(()=>{
            console.log('MariaDB Connection has been established successfully.');
        }).catch((err)=>{
            console.log('There was error'+err);
        });

        //Testing DB config
        return sequelize;

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

}

module.exports = connectDB();