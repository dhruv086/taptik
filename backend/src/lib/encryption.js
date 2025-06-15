import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secretKey = process.env.SECRET_KEY || "your-secret-key"; 
const iv = crypto.randomBytes(16);

// Encrypt function
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encryptedData: encrypted, iv: iv.toString("hex") };
};


export { encrypt};