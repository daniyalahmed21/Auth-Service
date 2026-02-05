import fs from "fs";
import { importSPKI, exportJWK } from "jose";

try {
    const publicKeyPem = fs.readFileSync("./certs/public.pem", "utf8");
    
    // Import the public key
    const publicKey = await importSPKI(publicKeyPem, "RS256");
    
    // Export as JWK
    const jwk = await exportJWK(publicKey);
    
    // Add the 'use' field
    jwk.use = "sig";
    
    console.log(JSON.stringify(jwk, null, 2));
} catch (error) {
    console.error("Error:", error);
}