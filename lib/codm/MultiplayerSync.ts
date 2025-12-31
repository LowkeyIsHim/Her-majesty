// lib/codm/MultiplayerSync.ts - Firebase Real-time Multiplayer

import { ref, set, onValue, off, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { Player, Bullet } from '../shooterTypes';

export interface MatchSettings {
  mode: 'TDM' | 'FFA';
  maxPlayers: number; // 2, 4, 6, 8, 10
  scoreLimit: number;
  timeLimit: number; // seconds
  mapName: string;
}

export interface MultiplayerState {
  roomCode: string;
  hostId: string;
  players: Record<string, Player>;
  bullets: Bullet[];
  matchSettings: MatchSettings;
  matchStarted: boolean;
  matchTime: number;
  redScore: number;
  blueScore: number;
}

export class MultiplayerSync {
  private roomCode: string = '';
  private playerId: string = '';
  private isHost: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  // Create new match room
  async createRoom(
    playerName: string,
    matchSettings: MatchSettings
  ): Promise<string> {
    const roomCode = this.generateRoomCode();
    const playerId = this.generatePlayerId();

    this.roomCode = roomCode;
    this.playerId = playerId;
    this.isHost = true;

    const initialState: MultiplayerState = {
      roomCode,
      hostId: playerId,
      players: {
        [playerId]: this.createInitialPlayer(playerId, playerName, 'blue', true),
      },
      bullets: [],
      matchSettings,
      matchStarted: false,
      matchTime: matchSettings.timeLimit,
      redScore: 0,
      blueScore: 0,
    };

    if (!database) {
      throw new Error('Firebase not initialized');
    }

    await set(ref(database, `matches/${roomCode}`), initialState);

    return roomCode;
  }

  // Join existing match
  async joinRoom(roomCode: string, playerName: string): Promise<boolean> {
    this.roomCode = roomCode.toUpperCase();
    this.playerId = this.generatePlayerId();

    if (!database) {
      throw new Error('Firebase not initialized');
    }

    const matchRef = ref(database, `matches/${this.roomCode}`);

    try {
      // Check if room exists and has space
      const snapshot = await new Promise<any>((resolve, reject) => {
        onValue(
          matchRef,
          (snap) => {
            off(matchRef);
            resolve(snap);
          },
          { onlyOnce: true }
        );
      });

      if (!snapshot.exists()) {
        throw new Error('Room not found');
      }

      const state: MultiplayerState = snapshot.val();
      const playerCount = Object.keys(state.players).length;

      if (playerCount >= state.matchSettings.maxPlayers) {
        throw new Error('Room is full');
      }

      // Assign team (balance teams in TDM)
      let team: 'blue' | 'red' = 'blue';
      if (state.matchSettings.mode === 'TDM') {
        const bluePlayers = Object.values(state.players).filter(p => p.team === 'blue').length;
        const redPlayers = Object.values(state.players).filter(p => p.team === 'red').length;
        team = bluePlayers <= redPlayers ? 'blue' : 'red';
      }

      // Add player to room
      const newPlayer = this.createInitialPlayer(this.playerId, playerName, team, false);
      
      await update(ref(database, `matches/${this.roomCode}/players`), {
        [this.playerId]: newPlayer,
      });

      return true;
    } catch (error) {
      console.error('Join room error:', error);
      return false;
    }
  }

  // Subscribe to match updates
  subscribeToMatch(callback: (state: MultiplayerState) => void) {
    if (!database || !this.roomCode) return;

    const matchRef = ref(database, `matches/${this.roomCode}`);
    
    onValue(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  }

  // Update local player state
  async updatePlayer(player: Player) {
    if (!database || !this.roomCode) return;

    await update(ref(database, `matches/${this.roomCode}/players/${this.playerId}`), {
      position: player.position,
      rotation: player.rotation,
      health: player.health,
      ammo: player.ammo,
      isMoving: player.isMoving,
      isSprinting: player.isSprinting,
      isCrouching: player.isCrouching,
      isDead: player.isDead,
      kills: player.kills,
      deaths: player.deaths,
      isReloading: player.isReloading,
    });
  }

  // Shoot bullet (synced across clients)
  async shootBullet(bullet: Bullet) {
    if (!database || !this.roomCode) return;

    const bulletsRef = ref(database, `matches/${this.roomCode}/bullets`);
    const newBulletRef = ref(database, `matches/${this.roomCode}/bullets/${bullet.id}`);

    await set(newBulletRef, bullet);

    // Auto-delete bullet after 3 seconds
    setTimeout(async () => {
      await remove(newBulletRef);
    }, 3000);
  }

  // Register kill
  async registerKill(killerId: string, victimId: string) {
    if (!database || !this.roomCode) return;

    const state = await this.getMatchState();
    if (!state) return;

    const killer = state.players[killerId];
    const victim = state.players[victimId];

    if (!killer || !victim) return;

    // Update scores
    const updates: any = {
      [`players/${killerId}/kills`]: killer.kills + 1,
      [`players/${victimId}/deaths`]: victim.deaths + 1,
      [`players/${victimId}/isDead`]: true,
      [`players/${victimId}/health`]: 0,
    };

    // Update team score in TDM
    if (state.matchSettings.mode === 'TDM') {
      if (killer.team === 'blue') {
        updates['blueScore'] = state.blueScore + 1;
      } else {
        updates['redScore'] = state.redScore + 1;
      }
    }

    await update(ref(database, `matches/${this.roomCode}`), updates);
  }

  // Start match (host only)
  async startMatch() {
    if (!this.isHost || !database || !this.roomCode) return;

    await update(ref(database, `matches/${this.roomCode}`), {
      matchStarted: true,
    });
  }

  // Leave match
  async leaveMatch() {
    if (!database || !this.roomCode) return;

    await remove(ref(database, `matches/${this.roomCode}/players/${this.playerId}`));

    // If host leaves, delete room
    if (this.isHost) {
      await remove(ref(database, `matches/${this.roomCode}`));
    }
  }

  // Helper: Get current match state
  private async getMatchState(): Promise<MultiplayerState | null> {
    if (!database || !this.roomCode) return null;

    const snapshot = await new Promise<any>((resolve) => {
      onValue(
        ref(database, `matches/${this.roomCode}`),
        (snap) => {
          off(ref(database, `matches/${this.roomCode}`));
          resolve(snap);
        },
        { onlyOnce: true }
      );
    });

    return snapshot.exists() ? snapshot.val() : null;
  }

  // Helper: Create initial player
  private createInitialPlayer(
    id: string,
    name: string,
    team: 'blue' | 'red',
    isHost: boolean
  ): Player {
    return {
      id,
      name,
      position: { x: 300, y: 300 },
      rotation: 0,
      velocity: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      team,
      isMoving: false,
      isSprinting: false,
      isCrouching: false,
      isDead: false,
      kills: 0,
      deaths: 0,
      currentWeapon: { 
        id: 'AR', 
        name: 'M4A1', 
        type: 'AR', 
        damage: 25, 
        fireRate: 10, 
        reloadTime: 2000,
        magazineSize: 30,
        reserveAmmo: 120,
        range: 600,
        accuracy: 0.92,
        recoil: 3,
        bulletSpeed: 1200,
        penetration: false
      },
      ammo: 30,
      reserveAmmo: 120,
      isReloading: false,
      lastShotTime: 0,
      consecutiveShots: 0,
      size: 20,
      speed: 250,
      sprintSpeed: 400,
      crouchSpeed: 150,
    };
  }

  // Helper: Generate room code
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Helper: Generate player ID
  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  getRoomCode(): string {
    return this.roomCode;
  }

  getPlayerId(): string {
    return this.playerId;
  }

  getIsHost(): boolean {
    return this.isHost;
  }
}
