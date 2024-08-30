import User from "../Models/userModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


// while the user log in the server generate access and refresh token and store in cookie
export const login = async(req, res) => {
    const {id, password} = req.body;
    try{
        const user = await User.findOne({where: {id}});
        if(!user){
            res.status(404).json({error: 'user not found'});
        }
        else{
            const isMatch = bcrypt.compare(password, user.password);
            if(!isMatch){
                res.status(401).send({error: 'invalid credential'});
            }
            else{
                const accessToken = jwt.sign({id: user.id, role:user.role}, process.env.ACCESS_TOKEN_SECRET)
                const refreshToken = jwt.sign({id: user.id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'});
                res.cookie("accessToken", accessToken, {httpOnly: true });
                res.cookie("refreshToken", refreshToken, {httpOnly: true });

                res.json({ message: "Login success", accessToken, refreshToken });
            }
        }
    }
    catch(error){
        console.error('unable login', error);
        res.status(500).json({error: 'can not login'})
    }
}


//to refresh the access token when the access token is expired
export const refreshToken = async(req, res) => {
    const refreshToken=req.headers.cookie;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        
        if(err){
            res.status(401).json({error: 'invalid token'});
        }

        const accessToken = jwt.sign({id: user.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'})
            res.cookie("accessToken",accessToken,{httpOnly:true})
            res.json({message:"Token refreshed",accessToken:accessToken});
    })
}


//user to logout
export const logout=(req,res)=>{
    res.clearCookie("accessToken");
    res.json({message:"Logout success"});
}