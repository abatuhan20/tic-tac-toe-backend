import express from "express";
import cors from "cors";
import { StreamChat } from "stream-chat";
import {v4 as uuidv4} from "uuid";
import bcrypt from "bcrypt";
// package.jsona eklediğim "type: module" satırı bu yazıyı yazabilmemi sağlıyor
const app = express();

app.use(cors());
app.use(express.json());
const api_key = "my4ee8pwjqvn";
const api_secret = "mcxtcba33vbrajuyazf2xath2c4pt3x78f3r3yay76t34s9z4psa7ndemwz5wgu2";

const serverClient = StreamChat.getInstance(api_key,api_secret);
app.post("/signup", async (req, res) => {
        try {
    const {firstName, lastName, username, password} = req.body;
    const userID = uuidv4();
    const hashedPassword = await bcrypt.hash(password,10);
    console.log(userID + username + " Signed Up");
    const token = serverClient.createToken(userID);
    res.json({ token, userID, firstName, lastName, username, hashedPassword });
    } catch(error) {
        res.json(error)
    }
});
// Express içerisinde route bu şekilde kuruluyor.

app.post("/login", async (req, res) => {
    // Bir nevi query burası ama stream api ile
    try {
    const {username, password} = req.body;
    const {users} = await serverClient.queryUsers({name: username});
    if (users.length === 0) {
        return res.json({message: "User not found"})
    }
    console.log(users[0].id +" " + username+ " Logined");
    const token = serverClient.createToken(users[0].id);
    // Kendi ürettiğim userID ye erişimim yok o yüzden id olması gerekiyor.
    const passwordMatch = await bcrypt.compare(password, users[0].hashedPassword);
    //Tokeni almam çok önemli signup ile bu ayrı olduğundan farklı
    if(passwordMatch) {
        res.json({
            token, 
            firstName: users[0].firstName,
            lastName: users[0].firstName,
            username,
            userID: users[0].id,
        });
    }
}catch (error) {
    res.json(error);
}
    
});
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});