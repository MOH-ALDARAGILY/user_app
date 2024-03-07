import { model, Schema } from "mongoose";

const User = model('User', new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}));

export default User;