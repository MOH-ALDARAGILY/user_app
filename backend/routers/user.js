import { Router } from 'express';
import User from '../models/user.js';
import upload from '../midlewares/file-upload.js';
import { patterns } from '../helpers/regex.js';
import { isValidObjectId, Types } from 'mongoose';

const user = Router();

//GET USERS BY NAME
user.get('/', async (req, res, next) => {
    try {
        const { name } = req.query;
        let firstName, lastName;
        if(name) [firstName, lastName] = name.split(' ');
        let users;
        let firstNameReg;
        if(firstName) firstNameReg = new RegExp(`^${firstName}`, 'i');
        if(lastName) {
            firstNameReg = new RegExp(`^${firstName}$`, 'i');
            let lastNameReg = new RegExp(`^${lastName}`, 'i');
            users = await User.find({ $and: [ { firstName: { $regex: firstNameReg } }, { lastName: { $regex: lastNameReg } } ] });
        }
        else
            users = firstName ? await User.find({ firstName: { $regex: firstNameReg } }) : await User.find({});
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500);
        next(new Error(error));
    }
});

//GET user
user.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (isValidObjectId(id)) {
            const objectId = new Types.ObjectId(id);
            const user = await User.findById(objectId);
            if(user) res.status(200).json(user);
            else {
                res.status(404);
                next(new Error(`not found, no user with id(${id})`));
            }
        }
        else {
            res.status(400);
            next(new Error('bad request, invalid id'));
        }
    }
    catch (error) {
        res.status(500);
        next(new Error(error));
    }
});

//POST USER
user.post('/', upload.single('profile_picture'), async (req, res, next) => {
    try {
        const { body, file } = req;
        const isValidName = patterns.name.test(body.firstName) && patterns.name.test(body.lastName);
        const isValidEmail = patterns.email.test(body.email);
        if (!isValidName) {
            res.status(400);
            next(new Error('bad request, invalid name'));
        }
        else if (!isValidEmail) {
            res.status(400);
            next(new Error('bad request, invalid email'));
        }
        if (isValidName && isValidEmail) {
            const user = new User({
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                image: `uploads/images/${file.filename}`
            });
            await user.save();
            res.status(201).json(user);
        }
    }
    catch (error) {
        res.status(500);
        next(new Error(error));
    }
});

//PUT USER
user.put('/:id', upload.single('profile_picture'), async (req, res, next) => {
    try {
        const { body, file } = req;
        const isValidName = patterns.name.test(body.firstName) && patterns.name.test(body.lastName);
        const isValidEmail = patterns.email.test(body.email);
        if (!isValidName) {
            res.status(400)
            next(new Error('bad request, invalid name'));
        }
        else if (!isValidEmail) {
            res.status(400);
            next(new Error('bad request, invalid email'));
        }
        if (isValidName && isValidEmail) {
            const id = req.params.id;
            if (isValidObjectId(id)) {
                const objectId = new Types.ObjectId(id);
                const user = await User.findOneAndReplace(
                    objectId,
                    {
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email,
                        image: `uploads/images/${file.filename}`
                    },
                    { new: true }
                );
                if(user) res.status(201).json(user);
                else {
                    res.status(404);
                    next(new Error(`not found, no user with id(${id})`));
                }
            }
            else {
                res.status(400);
                next(new Error('bad request, invalid id'));
            }
        }
    }
    catch (error) {
        res.status(500);
        next(new Error(error));
    }
});

//DELETE USER
user.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        if (isValidObjectId(id)) {
            const objectId = new Types.ObjectId(id);
            const user = await User.findByIdAndDelete(objectId);
            if(user) res.status(200).json(user);
            else {
                res.status(404);
                next(new Error(`not found, no user with id(${id})`));
            }
        }
        else {
            res.status(400);
            next(new Error('bad request, invalid id'));
        }
    }
    catch (error) {
        res.status(500);
        next(new Error(error));
    }
})

//ERROR HANDLER
user.use((err, req, res, next) => {
    res.json({ error: err.message });
});

export default user;