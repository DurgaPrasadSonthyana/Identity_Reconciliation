import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/dbConfig';

class Contact extends Model {
    email: unknown;
    phoneNumber: unknown;
    linkedId: any;
    id: any;
    linkPrecedence: string | undefined;
}

Contact.init({
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  linkPrecedence: {
    type: DataTypes.ENUM('primary', 'secondary'),
    defaultValue: 'primary',
  },
}, {
  sequelize,
  modelName: 'Contact',
});

export default Contact;
