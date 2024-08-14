import Dexie from 'dexie';

// Extend Dexie to create your database class
class SongDatabase extends Dexie {
  constructor() {
    super("SongDatabase");

    this.version(1).stores({
      songs: '++id, title', // Auto-incremented primary key, title for queries
    });

    this.songs = this.table('songs');
  }
}

export const db = new SongDatabase();