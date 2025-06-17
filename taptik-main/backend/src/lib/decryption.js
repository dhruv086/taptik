import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secretKey = process.env.SECRET_KEY || "your-secret-key"; 
const iv = crypto.randomBytes(16); 

const decrypt = (encryptedData, iv) => {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export { decrypt };