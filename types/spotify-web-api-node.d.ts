/**
 * Type declarations for spotify-web-api-node
 */

declare module "spotify-web-api-node" {
  export default class SpotifyWebApi {
    constructor(options?: {
      clientId?: string;
      clientSecret?: string;
      redirectUri?: string;
    });

    setAccessToken(token: string): void;
    setRefreshToken(token: string): void;
    createAuthorizeURL(scopes: string[], state?: string): string;
    authorizationCodeGrant(code: string): Promise<{
      body: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
    }>;
    getMe(): Promise<{
      body: {
        id: string;
        email?: string;
        display_name?: string;
      };
    }>;
    refreshAccessToken(): Promise<{
      body: {
        access_token: string;
        expires_in: number;
      };
    }>;
    getMyRecentlyPlayedTracks(options?: {
      limit?: number;
      after?: number;
      before?: number;
    }): Promise<{
      body: {
        items: Array<{
          track: {
            id: string;
            name: string;
            artists: Array<{ id: string; name: string }>;
            duration_ms: number;
            album?: { name: string };
          };
          played_at: string;
        }>;
      };
    }>;
    getArtist(artistId: string): Promise<{
      body: SpotifyApi.ArtistObjectFull;
    }>;
    getTrack(trackId: string): Promise<{
      body: SpotifyApi.TrackObjectFull;
    }>;
    getMyTopTracks(options?: {
      limit?: number;
      offset?: number;
      time_range?: "short_term" | "medium_term" | "long_term";
    }): Promise<{
      body: {
        items: SpotifyApi.TrackObjectFull[];
      };
    }>;
    getMyTopArtists(options?: {
      limit?: number;
      offset?: number;
      time_range?: "short_term" | "medium_term" | "long_term";
    }): Promise<{
      body: {
        items: SpotifyApi.ArtistObjectFull[];
      };
    }>;
  }
}

