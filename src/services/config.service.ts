import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
}

export class ConfigService {
  private envPath: string;

  constructor(envPath?: string) {
    this.envPath = envPath ?? path.resolve(process.cwd(), '.env');
    // Initial load
    dotenv.config({ path: this.envPath });
  }

  public addClient(name: string, clientId: string, clientSecret: string): void {
    const normalizedName = name.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const idKey = `KAM_CLIENT_${normalizedName}_ID`;
    const secretKey = `KAM_CLIENT_${normalizedName}_SECRET`;

    // Update process.env immediately
    process.env[idKey] = clientId;
    process.env[secretKey] = clientSecret;

    // Append to file
    const envContent = fs.existsSync(this.envPath) ? fs.readFileSync(this.envPath, 'utf-8') : '';
    if (envContent.includes(idKey)) {
      throw new Error(`Client ${name} already exists in .env`);
    }

    const newContent = `\n${idKey}=${clientId}\n${secretKey}=${clientSecret}\n`;
    fs.appendFileSync(this.envPath, newContent);
  }

  public removeClient(name: string): void {
      const normalizedName = name.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      const idKey = `KAM_CLIENT_${normalizedName}_ID`;
      const secretKey = `KAM_CLIENT_${normalizedName}_SECRET`;

      if (!fs.existsSync(this.envPath)) return;

      let envContent = fs.readFileSync(this.envPath, 'utf-8');

      // Remove ID and Secret lines, handling various potential newline formats
      // We use a regex that matches the key, optional whitespace, optional quotes, value, and end of line
      const idRegex = new RegExp(`^${idKey}=.*$`, 'gm');
      const secretRegex = new RegExp(`^${secretKey}=.*$`, 'gm');

      envContent = envContent.replace(idRegex, '').replace(secretRegex, '');
      
      // Also check if this was the current client
      if (process.env.KAM_CURRENT_CLIENT === normalizedName) {
          envContent = envContent.replace(/^KAM_CURRENT_CLIENT=.*$/gm, '');
          delete process.env.KAM_CURRENT_CLIENT;
      }

      // Clean up empty lines (optional but nice)
      envContent = envContent.replace(/^\s*[\r\n]/gm, '');

      fs.writeFileSync(this.envPath, envContent.trim() + '\n');
      
      // Update process.env
      delete process.env[idKey];
      delete process.env[secretKey];
  }

  public setCurrentClient(name: string): void {
     const normalizedName = name.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
     const idKey = `KAM_CLIENT_${normalizedName}_ID`;
     
     // Check if valid client
     if (!process.env[idKey]) {
         // Try checking file directly in case env is stale
         const fileContent = fs.existsSync(this.envPath) ? fs.readFileSync(this.envPath, 'utf-8') : '';
         if (!fileContent.includes(idKey)) {
            throw new Error(`Client ${name} not found. Add it first.`);
         }
     }

     // Update process.env
     process.env.KAM_CURRENT_CLIENT = normalizedName;

     // Update file
     let envContent = fs.existsSync(this.envPath) ? fs.readFileSync(this.envPath, 'utf-8') : '';
     if (envContent.includes('KAM_CURRENT_CLIENT=')) {
        envContent = envContent.replace(/KAM_CURRENT_CLIENT=.*/g, `KAM_CURRENT_CLIENT=${normalizedName}`);
     } else {
        envContent += `\nKAM_CURRENT_CLIENT=${normalizedName}\n`;
     }
     
     fs.writeFileSync(this.envPath, envContent);
  }

  public getCurrentClient(): string | null {
      return process.env.KAM_CURRENT_CLIENT || null;
  }
  
  public getClientCredentials(name?: string): ClientCredentials | null {
      const clientName = name ? name.toUpperCase().replace(/[^A-Z0-9_]/g, '_') : process.env.KAM_CURRENT_CLIENT;
      
      if (!clientName) return null;

      const clientId = process.env[`KAM_CLIENT_${clientName}_ID`];
      const clientSecret = process.env[`KAM_CLIENT_${clientName}_SECRET`];

      if (clientId && clientSecret) {
          return { clientId, clientSecret };
      }
      return null;
  }

  public getAllClients(): string[] {
      // Read from file to ensure we get persistent clients and avoiding env noise
      if (!fs.existsSync(this.envPath)) return [];
      
      const content = fs.readFileSync(this.envPath, 'utf-8');
      const clients: Set<string> = new Set();
      
      const lines = content.split('\n');
      for (const line of lines) {
          const match = line.match(/^KAM_CLIENT_(.+)_ID=/);
          if (match) {
              clients.add(match[1]);
          }
      }
      
      return Array.from(clients);
  }
}
