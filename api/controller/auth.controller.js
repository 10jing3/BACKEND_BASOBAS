import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

export const signup = async (req, res) => {
 
    // Destructure the request body
    const { username, email, password } = req.body;

    
    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });
    try{
         // Save the user to the database
    await newUser.save();

    // Respond with success
    res.status(201).json({ message: "User created successfully!" });
  
    }catch(error){
        res.status(500).json(error.message);
    }
   
};
