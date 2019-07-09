module.exports = (sequelize, type) => {
	return sequelize.define('users', {
		id: {type: type.INTEGER,
			 primaryKey: true,
			 autoIncrement: true
			},
		email: type.STRING(150),
		password: type.STRING(255),
	}, {modelName: 'users', timestamps: false, underscored: true});
}



