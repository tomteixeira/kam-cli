import { getAccessToken } from '../api/oauth';
import { ConfigService } from '../services/config.service';

const DEFAULT_TOKEN_LIFETIME_MS = 55 * 60 * 1000; // 55 minutes (safety margin on the typical 1h expiry)

export class TokenManager {
  private token: string | null = null;
  private expiresAt: number = 0;
  private activeClient: string | null = null;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  getConfigService(): ConfigService {
    return this.configService;
  }

  getActiveClient(): string | null {
    return this.activeClient ?? this.configService.getCurrentClient();
  }

  async getToken(): Promise<string> {
    const currentClient = this.configService.getCurrentClient();

    if (!currentClient) {
      throw new Error('No active client selected. Use the kameleoon_switch_client tool first.');
    }

    const clientChanged = this.activeClient !== currentClient;
    if (clientChanged) {
      this.invalidate();
      this.activeClient = currentClient;
    }

    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }

    const credentials = this.configService.getClientCredentials(currentClient);
    if (!credentials) {
      throw new Error(`Credentials not found for client "${currentClient}".`);
    }

    this.token = await getAccessToken(credentials.clientId, credentials.clientSecret);
    this.expiresAt = Date.now() + DEFAULT_TOKEN_LIFETIME_MS;

    return this.token;
  }

  switchClient(name: string): void {
    this.configService.setCurrentClient(name);
    this.invalidate();
    this.activeClient = this.configService.getCurrentClient();
  }

  invalidate(): void {
    this.token = null;
    this.expiresAt = 0;
  }
}
