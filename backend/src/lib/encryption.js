import crypto from "crypto";

const algorithm = "aes-256-cbc";

// Function to generate a proper length key from the secret
const getKey = (secret) => {
  // Use SHA-256 to generate a 32-byte key from the secret
  return crypto.createHash('sha256').update(secret).digest();
};

// Encrypt function
const encrypt = (text) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY environment variable is not set");
  }

  const key = getKey(process.env.SECRET_KEY);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return {
    encryptedData: encrypted,
    iv: iv.toString("hex")
  };
};

// Decrypt function
const decrypt = (encryptedData, iv) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY environment variable is not set");
  }

  const key = getKey(process.env.SECRET_KEY);
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "hex")
  );
  
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
};

export { encrypt, decrypt };