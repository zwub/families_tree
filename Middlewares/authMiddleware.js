import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const verifyToken = async(req, res, next) => {
    const cookies = cookie.parse(req.headers.cookie);
    const token = cookies.accessToken;
    if(!token){
        res.status(401).send({error: 'can not verify'});
    }
    else{
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
            if(err){
                res.status(403).send({error: ' token not valid'});
            }
            else{
                req.user = user;
                next();
            }
        });
    }
}


export const checkSuperAdminRole = (req, res, next) => {
    if (req.user.role === 'SuperAdmin') {
        next();  
    }
    else{
        res.status(403).send({ error: 'Access denied' });
    }
}



export const checkAdminRole = (req, res, next) => {
    if (req.user.role === 'Admin') {
       next(); 
    }
    else{
        res.status(403).send({ error: 'Access denied' });
    }
};


