const generateRandomString = function () {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789789';
  var result = ""
  var charactersLength = characters.length;

  for ( var i = 0; i < 5 ; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
return result;
};

const findEmail = (email, db) => {
  for(let key in db) {
    if (email === db[key].email){
      return email;
    }
  }
 };
 
 const findUserByID = (email, db) => {
   for (let key in db) {
     if (email === db[key].email) {
       return db[key].id;
     }
   }
   return undefined;
 };
 const findPassword = (email, db) => {
   for (let key in db) {
     if (email === db[key].email) {
       return db[key].password;
     }
   }
   return undefined;
 };
 
 const getUserURLs = (id, db) => {
   const userURLs = {};
   for (let url in db) {
       if (id === db[url].userID){ 
       userURLs[url] = db[url];
       }
   }
   return userURLs;
 }
 
 module.exports =  {findEmail, findUserByID, getUserURLs, generateRandomString, findPassword};